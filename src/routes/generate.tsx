import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Sparkles, Plus, X, Mic, Camera, Loader2, Clock, Flame, ChefHat,
  Heart, Share2, Youtube, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { api, getToken } from "@/lib/api-client";

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
  head: () => ({
    meta: [
      { title: "AI Recipe Generator — IngreDish AI" },
      { name: "description", content: "Generate authentic Indian recipes from your ingredients using AI." },
    ],
  }),
});

const SUGGESTED = ["paneer", "tomato", "onion", "potato", "chicken", "rice", "ginger", "garlic", "cream", "spinach", "yogurt", "lentils"];

const FILTERS = [
  { group: "Diet", items: ["Vegetarian", "Non-Veg", "Vegan", "High Protein", "Gym Diet", "Healthy"] },
  { group: "Time & Budget", items: ["Under 30 min", "Budget Meals", "Quick & Easy"] },
  { group: "Cuisine", items: ["North Indian", "South Indian", "Street Food", "Bengali", "Andhra", "Punjabi"] },
];

type Recipe = {
  title: string; cuisine: string; time: string; difficulty: string;
  calories: number; protein: number; carbs: number; fat: number;
  description: string; ingredients: string[]; steps: string[]; youtubeSearch: string;
};

function GeneratePage() {
  const [ingredients, setIngredients] = useState<string[]>(["paneer", "tomato", "cream"]);
  const [input, setInput] = useState("");
  const [filters, setFilters] = useState<string[]>(["Vegetarian"]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const addIngredient = (val: string) => {
    const v = val.trim().toLowerCase();
    if (!v || ingredients.includes(v)) return;
    setIngredients((p) => [...p, v]);
  };
  const removeIngredient = (v: string) => setIngredients((p) => p.filter((x) => x !== v));
  const toggleFilter = (f: string) =>
    setFilters((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }
    setLoading(true);
    setRecipes([]);
    try {
      // Call backend directly — it handles AI + optional DB persistence
      const token = getToken();
      const res = await api.post<{ ok: boolean; recipes: Recipe[]; message?: string }>(
        "/generate",
        { ingredients, filters },
        token ?? undefined,
      );

      if (!res.ok || !res.data?.ok) {
        toast.error(res.data?.message ?? res.message ?? "Couldn't generate recipes");
      } else {
        setRecipes(res.data.recipes);
        toast.success(`${res.data.recipes.length} recipes ready!`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">AI Generator</div>
        <h1 className="font-display text-4xl lg:text-6xl font-bold leading-tight">
          What's in your <span className="text-gradient">kitchen?</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Add ingredients, pick preferences, and let IngreDish AI craft authentic Indian recipes for you.</p>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">Filters</h3>
            <div className="space-y-5">
              {FILTERS.map((g) => (
                <div key={g.group}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{g.group}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((f) => {
                      const active = filters.includes(f);
                      return (
                        <button
                          key={f}
                          onClick={() => toggleFilter(f)}
                          className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition ${
                            active
                              ? "bg-gradient-ember text-primary-foreground shadow-ember"
                              : "bg-white/5 ring-1 ring-white/10 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Generator */}
        <div className="space-y-6">
          <div className="glass-strong rounded-3xl p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Your ingredients</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
              <AnimatePresence>
                {ingredients.map((ing) => (
                  <motion.span
                    key={ing}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-gradient-ember text-primary-foreground text-xs font-medium shadow-ember"
                  >
                    {ing}
                    <button onClick={() => removeIngredient(ing)} aria-label={`Remove ${ing}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-input/40 ring-1 ring-white/10 focus-within:ring-primary transition">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addIngredient(input);
                      setInput("");
                    }
                  }}
                  placeholder="Add ingredient and press Enter…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => toast.info("Voice input — coming soon")}
                aria-label="Voice"
                className="h-11 w-11 grid place-items-center rounded-xl glass hover:bg-white/10 transition"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                onClick={() => toast.info("Fridge photo scan — coming soon")}
                aria-label="Photo"
                className="h-11 w-11 grid place-items-center rounded-xl glass hover:bg-white/10 transition"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Suggested</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.filter((s) => !ingredients.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addIngredient(s)}
                    className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-ember text-primary-foreground font-semibold shadow-ember hover:opacity-95 disabled:opacity-60 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "AI is preparing your recipe…" : "Generate Recipes"}
            </button>
          </div>

          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-30">
                  {["🌶", "🧄", "🧅", "🍅", "🌿", "🥘"].map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 200, x: i * 80, opacity: 0 }}
                      animate={{ y: -100, opacity: [0, 1, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }}
                      className="absolute text-3xl"
                      style={{ left: `${10 + i * 14}%` }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
                <div className="relative">
                  <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-ember shadow-ember mb-4 animate-pulse-glow">
                    <ChefHat className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="font-display text-2xl font-bold">AI is preparing your recipe…</div>
                  <div className="text-sm text-muted-foreground mt-2">Sourcing spices, balancing flavors, calculating macros</div>
                  <div className="mt-6 max-w-xs mx-auto h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full w-1/2 bg-gradient-ember"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && recipes.length === 0 && (
            <div className="glass rounded-3xl p-10 text-center border-dashed">
              <div className="inline-grid place-items-center h-14 w-14 rounded-2xl bg-white/5 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="font-semibold">Ready when you are</div>
              <div className="text-sm text-muted-foreground mt-1">Add ingredients and hit Generate — fresh recipes appear here.</div>
            </div>
          )}

          {/* Results */}
          <div className="grid gap-4">
            {recipes.map((r, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-strong rounded-3xl overflow-hidden"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gradient-ember text-primary-foreground">{r.cuisine}</span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold glass text-gold">{r.difficulty}</span>
                      </div>
                      <h2 className="font-display text-2xl lg:text-3xl font-bold">{r.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{r.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button aria-label="Save" className="h-10 w-10 grid place-items-center rounded-xl glass hover:bg-white/10">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button aria-label="Share" className="h-10 w-10 grid place-items-center rounded-xl glass hover:bg-white/10">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {[
                      { l: "Time", v: r.time, i: Clock },
                      { l: "Calories", v: `${r.calories}`, i: Flame },
                      { l: "Protein", v: `${r.protein}g`, i: null },
                      { l: "Carbs", v: `${r.carbs}g`, i: null },
                      { l: "Fat", v: `${r.fat}g`, i: null },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl bg-white/5 ring-1 ring-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          {s.i && <s.i className="h-3 w-3" />} {s.l}
                        </div>
                        <div className="text-sm font-semibold mt-0.5">{s.v}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="mt-5 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-medium"
                  >
                    <span>View ingredients, steps &amp; tutorials</span>
                    <ChevronDown className={`h-4 w-4 transition ${expanded === i ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid lg:grid-cols-2 gap-6 mt-5">
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Ingredients</h3>
                            <ul className="space-y-2">
                              {r.ingredients.map((ing) => (
                                <li key={ing} className="flex items-start gap-2 text-sm">
                                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                  {ing}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Steps</h3>
                            <ol className="space-y-3">
                              {r.steps.map((s, idx) => (
                                <li key={idx} className="flex gap-3 text-sm">
                                  <span className="shrink-0 h-6 w-6 rounded-lg bg-gradient-ember text-primary-foreground text-[11px] font-bold grid place-items-center">{idx + 1}</span>
                                  <span className="leading-relaxed">{s}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <div className="mt-6 p-4 rounded-2xl bg-white/5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 grid place-items-center rounded-xl bg-accent">
                              <Youtube className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">Watch a tutorial</div>
                              <div className="text-xs text-muted-foreground">"{r.youtubeSearch}"</div>
                            </div>
                          </div>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r.youtubeSearch)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-lg bg-gradient-ember text-primary-foreground text-xs font-semibold"
                          >
                            Open YouTube
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
