import { Router } from "express";
import { z } from "zod";
import { query, queryOne, execute, uuid } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const favoritesRouter = Router();
favoritesRouter.use(requireAuth);

// GET /favorites
favoritesRouter.get("/", (req, res) => {
  try {
    const rows = query<{ id: string; recipe_id: string; recipe_type: string; created_at: string }>(
      "SELECT id, recipe_id, recipe_type, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
      [req.user!.userId],
    );
    res.json({ ok: true, favorites: rows });
  } catch (err) {
    console.error("[favorites/get]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to fetch favorites" });
  }
});

// POST /favorites
const AddFavoriteSchema = z.object({
  recipeId: z.string().min(1).max(255),
  recipeType: z.enum(["famous", "generated"]).default("famous"),
});

favoritesRouter.post("/", validateBody(AddFavoriteSchema), (req, res) => {
  try {
    const { recipeId, recipeType } = req.body as z.infer<typeof AddFavoriteSchema>;
    const userId = req.user!.userId;

    const existing = queryOne<{ id: string }>(
      "SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId],
    );
    if (existing) {
      res.status(409).json({ ok: false, error: "already_favorited", message: "Already in favorites" });
      return;
    }

    const id = uuid();
    execute("INSERT INTO favorites (id, user_id, recipe_id, recipe_type) VALUES (?, ?, ?, ?)", [id, userId, recipeId, recipeType]);
    execute("INSERT INTO activity_log (id, user_id, action, metadata) VALUES (?, ?, 'favorited', ?)", [uuid(), userId, JSON.stringify({ recipeId, recipeType })]);

    res.status(201).json({ ok: true, favorite: { id, recipe_id: recipeId, recipe_type: recipeType } });
  } catch (err) {
    console.error("[favorites/add]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to add favorite" });
  }
});

// DELETE /favorites/:recipeId
favoritesRouter.delete("/:recipeId", (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user!.userId;

    const existing = queryOne<{ id: string }>("SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]);
    if (!existing) {
      res.status(404).json({ ok: false, error: "not_found", message: "Favorite not found" });
      return;
    }

    execute("DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]);
    res.json({ ok: true, message: "Removed from favorites" });
  } catch (err) {
    console.error("[favorites/delete]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to remove favorite" });
  }
});

// POST /favorites/toggle
const ToggleSchema = z.object({
  recipeId: z.string().min(1).max(255),
  recipeType: z.enum(["famous", "generated"]).default("famous"),
});

favoritesRouter.post("/toggle", validateBody(ToggleSchema), (req, res) => {
  try {
    const { recipeId, recipeType } = req.body as z.infer<typeof ToggleSchema>;
    const userId = req.user!.userId;

    const existing = queryOne<{ id: string }>("SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]);
    if (existing) {
      execute("DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]);
      res.json({ ok: true, isFavorited: false });
    } else {
      execute("INSERT OR IGNORE INTO favorites (id, user_id, recipe_id, recipe_type) VALUES (?, ?, ?, ?)", [uuid(), userId, recipeId, recipeType]);
      execute("INSERT INTO activity_log (id, user_id, action, metadata) VALUES (?, ?, 'favorited', ?)", [uuid(), userId, JSON.stringify({ recipeId, recipeType })]);
      res.json({ ok: true, isFavorited: true });
    }
  } catch (err) {
    console.error("[favorites/toggle]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Toggle failed" });
  }
});
