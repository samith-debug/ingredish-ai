import { Router } from "express";
import { z } from "zod";
import { generateText, Output } from "ai";
import { execute, uuid } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const generateRouter = Router();

// ── Schemas ───────────────────────────────────────────────────

const RecipeSchema = z.object({
  recipes: z
    .array(
      z.object({
        title: z.string(),
        cuisine: z.string(),
        time: z.string(),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        description: z.string(),
        ingredients: z.array(z.string()),
        steps: z.array(z.string()),
        youtubeSearch: z.string(),
      }),
    )
    .min(1)
    .max(5),
});

const GenerateInputSchema = z.object({
  ingredients: z.array(z.string().min(1).max(60)).min(1).max(20),
  filters: z.array(z.string()).max(15).optional(),
});

// ── POST /generate ────────────────────────────────────────────
generateRouter.post("/", validateBody(GenerateInputSchema), async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      ok: false,
      error: "not_configured",
      message: "AI service not configured. Set GEMINI_API_KEY in environment.",
    });
    return;
  }

  try {
    const { ingredients, filters } = req.body as z.infer<typeof GenerateInputSchema>;
    const filterStr = filters?.length ? filters.join(", ") : "no specific filters";

    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const googleAI = createGoogleGenerativeAI({ apiKey });
    const model = googleAI("gemini-2.5-flash");

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: RecipeSchema }),
      prompt: `You are IngreDish AI, an expert Indian chef. Generate 3 authentic, delicious Indian recipes using primarily these ingredients: ${ingredients.join(", ")}.

Filters/preferences: ${filterStr}

Rules:
- Lean Indian cuisine (North, South, street food, regional).
- Use the listed ingredients as the core; you may add common Indian pantry staples (oil, salt, basic spices like cumin/turmeric/garam masala, onion, garlic, ginger, tomato).
- Realistic cooking time and macros.
- "steps" must be 5-8 clear numbered actions.
- "ingredients" must include quantities.
- "youtubeSearch" should be a precise search like "authentic paneer butter masala recipe".
- difficulty: Easy / Medium / Hard.

Return exactly 3 distinct recipes.`,
    });

    const recipes = experimental_output.recipes;

    // ── Persist if authenticated ───────────────────────────────
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const { verifyToken } = await import("../lib/jwt.js");
      const payload = verifyToken(authHeader.slice(7));
      if (payload) {
        for (const r of recipes) {
          const id = uuid();
          try {
            await execute(
              `INSERT INTO generated_recipes
                 (id, user_id, title, cuisine, time, difficulty, calories, protein,
                  carbs, fat, description, ingredients, steps, youtube_search)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                id, payload.userId, r.title, r.cuisine, r.time, r.difficulty,
                r.calories, r.protein, r.carbs, r.fat, r.description,
                JSON.stringify(r.ingredients), JSON.stringify(r.steps), r.youtubeSearch,
              ],
            );
            await execute(
              "INSERT INTO activity_log (id, user_id, action, metadata) VALUES (?,?,'generated',?)",
              [uuid(), payload.userId, JSON.stringify({ recipeId: id, title: r.title })],
            );
          } catch (e) {
            console.warn("[generate] Failed to persist recipe:", e);
          }
        }
      }
    }

    res.json({ ok: true, recipes });
  } catch (err: unknown) {
    console.error("[generate]", err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      res.status(429).json({ ok: false, error: "rate_limit", message: "Too many requests. Please wait a moment." });
      return;
    }
    const message = err instanceof Error ? err.message : "Generation failed";
    res.status(500).json({ ok: false, error: "unknown", message });
  }
});
