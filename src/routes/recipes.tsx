import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { FAMOUS_RECIPES, CATEGORIES } from "@/lib/recipes-data";
import { RecipeCard } from "@/components/RecipeCard";

export const Route = createFileRoute("/recipes")({
  component: RecipesPage,
  head: () => ({
    meta: [
      { title: "Famous Indian Recipes — IngreDish AI" },
      { name: "description", content: "Browse India's most iconic dishes — biryani, butter chicken, dosa, samosa and more." },
    ],
  }),
});

function RecipesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(
    () =>
      FAMOUS_RECIPES.filter((r) => {
        const matchCat = cat === "All" || r.category === cat;
        const matchQ =
          !query ||
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase());
        return matchCat && matchQ;
      }),
    [query, cat],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Famous Indian Recipes</div>
        <h1 className="font-display text-4xl lg:text-6xl font-bold leading-tight">
          The icons of <span className="text-gradient">Indian cuisine.</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">From street-side chaat to royal biryanis — curated, tested and ready to cook.</p>
      </motion.div>

      <div className="glass-strong rounded-2xl p-4 mb-8 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes, cuisines, ingredients…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition ${
              cat === c
                ? "bg-gradient-ember text-primary-foreground shadow-ember"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Trending */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="font-display text-2xl font-bold">{cat === "All" ? "All Recipes" : cat}</h2>
        <span className="text-xs text-muted-foreground">· {filtered.length} dishes</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {filtered.map((r, i) => (
          <RecipeCard key={r.id} recipe={r} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center mt-8">
          <div className="font-semibold">No dishes found</div>
          <div className="text-sm text-muted-foreground mt-1">Try a different search or category.</div>
        </div>
      )}
    </div>
  );
}
