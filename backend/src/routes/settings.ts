import { Router } from "express";
import { z } from "zod";
import { queryOne, execute } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

// GET /settings
settingsRouter.get("/", (req, res) => {
  try {
    const userId = req.user!.userId;
    execute("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", [userId]);

    const s = queryOne<{
      vegetarian: number; spicy: number; gluten_free: number;
      ai_personal: number; notif_daily: number; notif_weekly: number;
      theme: string; updated_at: string;
    }>("SELECT * FROM user_settings WHERE user_id = ?", [userId]);

    res.json({
      ok: true,
      settings: {
        vegetarian:  Boolean(s?.vegetarian  ?? 1),
        spicy:       Boolean(s?.spicy       ?? 0),
        glutenFree:  Boolean(s?.gluten_free ?? 0),
        aiPersonal:  Boolean(s?.ai_personal ?? 1),
        notifDaily:  Boolean(s?.notif_daily  ?? 1),
        notifWeekly: Boolean(s?.notif_weekly ?? 1),
        theme:       s?.theme ?? "saffron-ember",
        updatedAt:   s?.updated_at,
      },
    });
  } catch (err) {
    console.error("[settings/get]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to fetch settings" });
  }
});

// PUT /settings
const UpdateSettingsSchema = z.object({
  vegetarian:  z.boolean().optional(),
  spicy:       z.boolean().optional(),
  glutenFree:  z.boolean().optional(),
  aiPersonal:  z.boolean().optional(),
  notifDaily:  z.boolean().optional(),
  notifWeekly: z.boolean().optional(),
  theme:       z.string().optional(),
});

settingsRouter.put("/", validateBody(UpdateSettingsSchema), (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = req.body as z.infer<typeof UpdateSettingsSchema>;

    execute("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", [userId]);

    const fieldMap: Record<string, string> = {
      vegetarian:  "vegetarian",
      spicy:       "spicy",
      glutenFree:  "gluten_free",
      aiPersonal:  "ai_personal",
      notifDaily:  "notif_daily",
      notifWeekly: "notif_weekly",
      theme:       "theme",
    };

    const setClauses: string[] = ["updated_at = datetime('now')"];
    const values: unknown[] = [];

    for (const [key, col] of Object.entries(fieldMap)) {
      const val = data[key as keyof typeof data];
      if (val !== undefined) {
        setClauses.push(`${col} = ?`);
        // SQLite stores booleans as 0/1
        values.push(typeof val === "boolean" ? (val ? 1 : 0) : val);
      }
    }
    values.push(userId);

    execute(`UPDATE user_settings SET ${setClauses.join(", ")} WHERE user_id = ?`, values);
    res.json({ ok: true, message: "Settings saved" });
  } catch (err) {
    console.error("[settings/put]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to save settings" });
  }
});
