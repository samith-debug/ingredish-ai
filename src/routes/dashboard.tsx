import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Heart, Flame, TrendingUp, ChefHat, Youtube, Loader2, LogIn } from "lucide-react";
import { FAMOUS_RECIPES } from "@/lib/recipes-data";
import { RecipeCard } from "@/components/RecipeCard";
import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api-client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — IngreDish AI" }] }),
});

interface Stats {
  recipesGenerated: number;
  recipesThisWeek: number;
  cookingStreakDays: number;
  favoritesSaved: number;
  favoritesThisWeek: number;
  videosWatched: number;
}

interface ActivityItem {
  action: string;
  metadata: { title?: string; recipeId?: string };
  created_at: string;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function actionLabel(action: string, meta: { title?: string }): string {
  switch (action) {
    case "generated": return `Generated${meta.title ? ` "${meta.title}"` : " a recipe"}`;
    case "cooked": return `Cooked${meta.title ? ` "${meta.title}"` : " a recipe"}`;
    case "favorited": return "Saved a recipe to favorites";
    case "watched": return "Watched a tutorial";
    default: return action;
  }
}

function Dashboard() {
  const recent = FAMOUS_RECIPES.slice(0, 4);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (!token) { setLoading(false); return; }

    api.get<{ ok: boolean; stats: Stats; recentActivity: ActivityItem[] }>("/stats").then((res) => {
      if (res.ok && res.data) {
        setStats(res.data.stats);
        setActivity(res.data.recentActivity);
      }
    }).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats
    ? [
        { label: "Recipes Generated", value: String(stats.recipesGenerated), icon: Sparkles, trend: `+${stats.recipesThisWeek} this week` },
        { label: "Cooking Streak", value: `${stats.cookingStreakDays} days`, icon: Flame, trend: stats.cookingStreakDays >= 7 ? "Personal best! 🔥" : "Keep it up!" },
        { label: "Favorites Saved", value: String(stats.favoritesSaved), icon: Heart, trend: `+${stats.favoritesThisWeek} new` },
        { label: "Videos Watched", value: String(stats.videosWatched), icon: Youtube, trend: "Keep learning!" },
      ]
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Dashboard</div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
          Welcome back, <span className="text-gradient">Chef.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">Your kitchen at a glance.</p>
      </motion.div>

      {/* Auth gate */}
      {!isLoggedIn && !loading && (
        <div className="glass-strong rounded-3xl p-10 text-center mb-10">
          <ChefHat className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Sign in to see your stats</h2>
          <p className="text-sm text-muted-foreground mb-6">Track your cooking streak, saved recipes, and AI-generated meals.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-ember text-primary-foreground font-semibold shadow-ember"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-strong rounded-2xl p-5 flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ))}
        </div>
      ) : STAT_CARDS ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-strong rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-ember opacity-10 blur-2xl" />
              <div className="h-10 w-10 rounded-xl bg-gradient-ember grid place-items-center shadow-ember mb-4">
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              <div className="text-[10px] text-primary mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />{s.trend}
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-bold">Recently generated</h2>
            <Link to="/generate" className="text-xs text-primary hover:underline">Generate more →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recent.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <h3 className="font-display text-lg font-bold mb-4">Activity</h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : activity.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {activity.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{actionLabel(a.action, a.metadata)}</div>
                      <div className="text-xs text-muted-foreground">{formatRelativeTime(a.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isLoggedIn ? "No activity yet. Generate your first recipe!" : "Sign in to see your activity."}
              </p>
            )}
          </div>

          <div className="rounded-2xl p-6 bg-gradient-ember text-primary-foreground shadow-ember">
            <ChefHat className="h-6 w-6 mb-3" />
            <div className="font-display text-lg font-bold leading-tight">Today's pick</div>
            <div className="text-xs opacity-90 mt-1">Try a North Indian classic tonight.</div>
            <Link to="/generate" className="mt-4 inline-block px-4 py-2 rounded-lg bg-background text-foreground text-xs font-semibold">
              Get suggestion
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
