import { Router } from "express";
import { z } from "zod";
import { queryOne, execute } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

// GET /settings
settingsRouter.get("/", async (req, res) => {
  try {
    const userId = req.user!.userId;
    await execute("INSERT INTO user_settings (user_id) VALUES (?) ON CONFLICT DO NOTHING", [userId]);

    const s = await queryOne<{
      vegetarian: boolean; spicy: boolean; gluten_free: boolean;
      ai_personal: boolean; notif_daily: boolean; notif_weekly: boolean;
      theme: string; updated_at: string;
    }>("SELECT * FROM user_settings WHERE user_id = ?", [userId]);

    res.json({
      ok: true,
      settings: {
        vegetarian:  s?.vegetarian  ?? true,
        spicy:       s?.spicy       ?? false,
        glutenFree:  s?.gluten_free ?? false,
        aiPersonal:  s?.ai_personal ?? true,
        notifDaily:  s?.notif_daily ?? true,
        notifWeekly: s?.notif_weekly ?? true,
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

settingsRouter.put("/", validateBody(UpdateSettingsSchema), async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = req.body as z.infer<typeof UpdateSettingsSchema>;

    await execute("INSERT INTO user_settings (user_id) VALUES (?) ON CONFLICT DO NOTHING", [userId]);

    const fieldMap: Record<string, string> = {
      vegetarian:  "vegetarian",
      spicy:       "spicy",
      glutenFree:  "gluten_free",
      aiPersonal:  "ai_personal",
      notifDaily:  "notif_daily",
      notifWeekly: "notif_weekly",
      theme:       "theme",
    };

    const setClauses: string[] = ["updated_at = NOW()"];
    const values: unknown[] = [];

    for (const [key, col] of Object.entries(fieldMap)) {
      const val = data[key as keyof typeof data];
      if (val !== undefined) {
        setClauses.push(`${col} = ?`);
        values.push(val); // Postgres handles booleans natively
      }
    }
    values.push(userId);

    await execute(`UPDATE user_settings SET ${setClauses.join(", ")} WHERE user_id = ?`, values);
    res.json({ ok: true, message: "Settings saved" });
  } catch (err) {
    console.error("[settings/put]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to save settings" });
  }
});
