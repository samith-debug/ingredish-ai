import { Router } from "express";
import { z } from "zod";
import { query, queryOne, execute, uuid } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const recipesRouter = Router();
recipesRouter.use(requireAuth);

// POST /recipes/save
const SaveRecipeSchema = z.object({
  title: z.string(),
  cuisine: z.string().optional(),
  time: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  calories: z.number().int().optional(),
  protein: z.number().int().optional(),
  carbs: z.number().int().optional(),
  fat: z.number().int().optional(),
  description: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  youtubeSearch: z.string().optional(),
});

recipesRouter.post("/save", validateBody(SaveRecipeSchema), (req, res) => {
  try {
    const data = req.body as z.infer<typeof SaveRecipeSchema>;
    const userId = req.user!.userId;
    const id = uuid();

    execute(
      `INSERT INTO generated_recipes
         (id, user_id, title, cuisine, time, difficulty, calories, protein, carbs, fat,
          description, ingredients, steps, youtube_search)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, userId, data.title,
        data.cuisine ?? null, data.time ?? null, data.difficulty ?? null,
        data.calories ?? null, data.protein ?? null, data.carbs ?? null, data.fat ?? null,
        data.description ?? null,
        JSON.stringify(data.ingredients ?? []),
        JSON.stringify(data.steps ?? []),
        data.youtubeSearch ?? null,
      ],
    );

    execute(
      "INSERT INTO activity_log (id, user_id, action, metadata) VALUES (?, ?, 'generated', ?)",
      [uuid(), userId, JSON.stringify({ recipeId: id, title: data.title })],
    );

    const row = queryOne<{ created_at: string }>("SELECT created_at FROM generated_recipes WHERE id = ?", [id]);
    res.status(201).json({ ok: true, id, createdAt: row?.created_at });
  } catch (err) {
    console.error("[recipes/save]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to save recipe" });
  }
});

// GET /recipes/history
recipesRouter.get("/history", (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    const rows = query<{ id: string; title: string; cuisine: string; time: string; difficulty: string; calories: number; description: string; created_at: string }>(
      "SELECT id, title, cuisine, time, difficulty, calories, description, created_at FROM generated_recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [req.user!.userId, limit, offset],
    );
    const countRow = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM generated_recipes WHERE user_id = ?", [req.user!.userId]);
    res.json({ ok: true, recipes: rows, total: countRow?.count ?? 0 });
  } catch (err) {
    console.error("[recipes/history]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to fetch history" });
  }
});

// GET /recipes/:id
recipesRouter.get("/:id", (req, res) => {
  try {
    const recipe = queryOne<Record<string, unknown>>(
      "SELECT * FROM generated_recipes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user!.userId],
    );
    if (!recipe) {
      res.status(404).json({ ok: false, error: "not_found", message: "Recipe not found" });
      return;
    }
    res.json({ ok: true, recipe });
  } catch (err) {
    console.error("[recipes/get]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to fetch recipe" });
  }
});

// POST /recipes/:id/cooked
recipesRouter.post("/:id/cooked", (req, res) => {
  try {
    const userId = req.user!.userId;
    const recipe = queryOne<{ id: string; title: string }>(
      "SELECT id, title FROM generated_recipes WHERE id = ? AND user_id = ?",
      [req.params.id, userId],
    );
    if (!recipe) {
      res.status(404).json({ ok: false, error: "not_found", message: "Recipe not found" });
      return;
    }
    execute(
      "INSERT INTO activity_log (id, user_id, action, metadata) VALUES (?, ?, 'cooked', ?)",
      [uuid(), userId, JSON.stringify({ recipeId: recipe.id, title: recipe.title })],
    );
    res.json({ ok: true, message: "Cooking logged!" });
  } catch (err) {
    console.error("[recipes/cooked]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to log" });
  }
});
