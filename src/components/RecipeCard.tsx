import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Flame, Star, Heart } from "lucide-react";
import type { FamousRecipe } from "@/lib/recipes-data";
import { useFavorites } from "@/lib/favorites-store";

export function RecipeCard({ recipe, index = 0 }: { recipe: FamousRecipe; index?: number }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(recipe.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="group relative"
    >
      <Link to="/recipe/$id" params={{ id: recipe.id }} className="block">
        <div className="relative overflow-hidden rounded-3xl glass-strong">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              loading="lazy"
              width={896}
              height={896}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <button
              onClick={(e) => {
                e.preventDefault();
                toggle(recipe.id);
              }}
              aria-label="Save"
              className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full glass-strong hover:scale-110 transition"
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-accent text-accent" : "text-foreground"}`} />
            </button>

            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gradient-ember text-primary-foreground">
                {recipe.cuisine}
              </span>
              {recipe.trending && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider glass text-gold">
                  Trending
                </span>
              )}
            </div>

            <div className="absolute bottom-0 inset-x-0 p-5">
              <h3 className="font-display text-xl font-bold leading-tight mb-2 group-hover:text-gradient transition">
                {recipe.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" /> {recipe.rating}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {recipe.time}</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {recipe.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
