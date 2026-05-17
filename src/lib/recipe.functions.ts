import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.js";

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
        youtubeSearch: z.string().describe("YouTube search query for a great tutorial of this dish"),
      }),
    )
    .min(2)
    .max(4),
});

const InputSchema = z.object({
  ingredients: z.array(z.string().min(1).max(60)).min(1).max(20),
  filters: z.array(z.string()).max(15).optional(),
  /** JWT token — passed from the client so the server fn can persist recipes */
  authToken: z.string().optional(),
});

export const generateRecipes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const filters = data.filters?.length ? data.filters.join(", ") : "no specific filters";

    try {
      const { experimental_output } = await generateText({
        model,
        experimental_output: Output.object({ schema: RecipeSchema }),
        prompt: `You are IngreDish AI, an expert Indian chef. Generate 3 authentic, delicious Indian recipes using primarily these ingredients: ${data.ingredients.join(", ")}.

Filters/preferences: ${filters}

Rules:
- Lean Indian cuisine (North, South, street food, regional).
- Use the listed ingredients as the core; you may add common Indian pantry staples (oil, salt, basic spices like cumin/turmeric/garam masala, onion, garlic, ginger, tomato).
- Realistic cooking time and macros.
- "steps" must be 5-8 clear numbered actions.
- "ingredients" must include quantities.
- "youtubeSearch" should be a precise search like "authentic paneer butter masala recipe".
- difficulty: Easy / Medium / Hard.

Return 3 distinct recipes.`,
      });

      const recipes = experimental_output.recipes;

      // ── Persist to backend if user is authenticated ───────────
      if (data.authToken) {
        const apiBase = process.env.INGREDISH_API_URL ?? "http://localhost:3001";
        // Fire-and-forget for each recipe — we don't block the response
        for (const recipe of recipes) {
          fetch(`${apiBase}/recipes/save`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.authToken}`,
            },
            body: JSON.stringify({
              title: recipe.title,
              cuisine: recipe.cuisine,
              time: recipe.time,
              difficulty: recipe.difficulty,
              calories: recipe.calories,
              protein: recipe.protein,
              carbs: recipe.carbs,
              fat: recipe.fat,
              description: recipe.description,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
              youtubeSearch: recipe.youtubeSearch,
            }),
          }).catch((err) => console.warn("[recipe.functions] Failed to persist recipe:", err));
        }
      }

      return { ok: true as const, recipes };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      const status = (err as { status?: number })?.status;
      if (status === 429) {
        return { ok: false as const, error: "rate_limit", message: "Too many requests. Please wait a moment." };
      }
      if (status === 402) {
        return { ok: false as const, error: "no_credits", message: "AI credits exhausted. Add credits in workspace settings." };
      }
      return { ok: false as const, error: "unknown", message };
    }
  });
