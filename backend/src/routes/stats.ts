import { Router } from "express";
import { query, queryOne } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";

export const statsRouter = Router();
statsRouter.use(requireAuth);

// GET /stats
statsRouter.get("/", async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [genRow, favRow, watchRow, weekGen, weekFav] = await Promise.all([
      queryOne<{ count: string }>("SELECT COUNT(*) as count FROM generated_recipes WHERE user_id = ?", [userId]),
      queryOne<{ count: string }>("SELECT COUNT(*) as count FROM favorites WHERE user_id = ?", [userId]),
      queryOne<{ count: string }>("SELECT COUNT(*) as count FROM activity_log WHERE user_id = ? AND action = 'watched'", [userId]),
      queryOne<{ count: string }>("SELECT COUNT(*) as count FROM generated_recipes WHERE user_id = ? AND created_at >= NOW() - INTERVAL '7 days'", [userId]),
      queryOne<{ count: string }>("SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND created_at >= NOW() - INTERVAL '7 days'", [userId]),
    ]);

    // Cooking streak — distinct days with 'cooked' or 'generated' activity
    const streakRows = await query<{ day: string }>(
      `SELECT DISTINCT created_at::date as day
       FROM activity_log
       WHERE user_id = ? AND action IN ('cooked','generated')
       ORDER BY day DESC`,
      [userId],
    );

    let streak = 0;
    if (streakRows.length > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      let expected = new Date(today);
      for (const { day } of streakRows) {
        const d = new Date(day);
        d.setUTCHours(0, 0, 0, 0);
        if (d.getTime() === expected.getTime()) {
          streak++;
          expected.setUTCDate(expected.getUTCDate() - 1);
        } else if (d.getTime() < expected.getTime()) {
          break;
        }
      }
    }

    // Recent activity
    const recentActivity = (
      await query<{ action: string; metadata: string; created_at: string }>(
        "SELECT action, metadata, created_at FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        [userId],
      )
    ).map((r) => ({
      ...r,
      metadata: (() => { try { return JSON.parse(r.metadata); } catch { return {}; } })(),
    }));

    res.json({
      ok: true,
      stats: {
        recipesGenerated:  Number(genRow?.count   ?? 0),
        recipesThisWeek:   Number(weekGen?.count  ?? 0),
        cookingStreakDays:  streak,
        favoritesSaved:    Number(favRow?.count   ?? 0),
        favoritesThisWeek: Number(weekFav?.count  ?? 0),
        videosWatched:     Number(watchRow?.count ?? 0),
      },
      recentActivity,
    });
  } catch (err) {
    console.error("[stats]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to fetch stats" });
  }
});
