import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { FAMOUS_RECIPES } from "@/lib/recipes-data";
import { useFavorites } from "@/lib/favorites-store";
import { RecipeCard } from "@/components/RecipeCard";

export const Route = createFileRoute("/favorites")({
  component: Favorites,
  head: () => ({ meta: [{ title: "Favorites — IngreDish AI" }] }),
});

function Favorites() {
  const { favorites } = useFavorites();
  const saved = FAMOUS_RECIPES.filter((r) => favorites.includes(r.id));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Your Collection</div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">Saved <span className="text-gradient">favorites.</span></h1>
        <p className="mt-3 text-muted-foreground">{saved.length} recipe{saved.length === 1 ? "" : "s"} in your cookbook.</p>
      </motion.div>

      {saved.length === 0 ? (
        <div className="glass-strong rounded-3xl p-16 text-center">
          <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-gradient-ember shadow-ember mb-4">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="font-display text-2xl font-bold">No favorites yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Tap the heart on any recipe to save it here.</p>
          <Link to="/recipes" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-ember text-primary-foreground font-semibold shadow-ember">
            <Sparkles className="h-4 w-4" /> Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {saved.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
        </div>
      )}
    </div>
  );
}
