import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Flame, Star, Heart, Share2, Bookmark, ArrowLeft, Mic, Timer, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FAMOUS_RECIPES } from "@/lib/recipes-data";
import { VideoCard } from "@/components/VideoCard";
import { useFavorites } from "@/lib/favorites-store";
import { RecipeCard } from "@/components/RecipeCard";

export const Route = createFileRoute("/recipe/$id")({
  loader: ({ params }) => {
    const recipe = FAMOUS_RECIPES.find((r) => r.id === params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.recipe.title} — IngreDish AI` },
      { name: "description", content: loaderData?.recipe.description },
      { property: "og:image", content: loaderData?.recipe.image },
    ],
  }),
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipe } = Route.useLoaderData();
  const { isFav, toggle } = useFavorites();
  const [done, setDone] = useState<Set<number>>(new Set());
  const fav = isFav(recipe.id);

  const toggleStep = (i: number) =>
    setDone((p) => {
      const n = new Set(p);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const similar = FAMOUS_RECIPES.filter((r) => r.id !== recipe.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Link to="/recipes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All recipes
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-[2rem] overflow-hidden glass-strong">
        <div className="relative aspect-[16/9] lg:aspect-[21/9]">
          <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-6 lg:p-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gradient-ember text-primary-foreground">{recipe.cuisine}</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold glass text-gold">{recipe.difficulty}</span>
            </div>
            <h1 className="font-display text-3xl lg:text-6xl font-bold leading-tight">{recipe.title}</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">{recipe.description}</p>
            <div className="mt-5 flex items-center gap-5 text-sm">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-gold text-gold" /> {recipe.rating}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {recipe.time}</span>
              <span className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-primary" /> {recipe.calories} kcal</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => { toggle(recipe.id); toast.success(fav ? "Removed from favorites" : "Saved to favorites"); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-strong font-medium text-sm hover:bg-white/10"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-accent text-accent" : ""}`} /> {fav ? "Saved" : "Save"}
        </button>
        <button onClick={() => toast.success("Link copied!")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-strong font-medium text-sm hover:bg-white/10">
          <Share2 className="h-4 w-4" /> Share
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-strong font-medium text-sm hover:bg-white/10">
          <Bookmark className="h-4 w-4" /> Add to plan
        </button>
        <button onClick={() => toast.info("Voice assistant coming soon")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-ember text-primary-foreground font-semibold text-sm shadow-ember">
          <Mic className="h-4 w-4" /> Voice cooking mode
        </button>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-10">
          {/* Ingredients */}
          <section className="glass-strong rounded-3xl p-6 lg:p-8">
            <h2 className="font-display text-2xl font-bold mb-5">Ingredients</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing) => (
                <label key={ing} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 accent-primary" />
                  <span className="text-sm">{ing}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="glass-strong rounded-3xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold">Cooking Steps</h2>
              <button className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Timer className="h-3.5 w-3.5" /> Start timer
              </button>
            </div>
            <ol className="space-y-3">
              {recipe.steps.map((s, i) => {
                const checked = done.has(i);
                return (
                  <li
                    key={i}
                    onClick={() => toggleStep(i)}
                    className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition ${
                      checked ? "bg-primary/10 ring-1 ring-primary/30" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="shrink-0">
                      {checked ? (
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                      ) : (
                        <span className="grid place-items-center h-7 w-7 rounded-full bg-gradient-ember text-primary-foreground text-xs font-bold">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${checked ? "line-through text-muted-foreground" : ""}`}>{s}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* YouTube */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-5">Watch & Learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {recipe.youtube.map((v, i) => (
                <VideoCard
                  key={v.id}
                  id={v.id}
                  searchQuery={`${v.title} ${recipe.title}`}
                  title={v.title}
                  channel={v.channel}
                  index={i}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="glass-strong rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold mb-4">Nutrition Facts</h3>
            <div className="space-y-3">
              {[
                { l: "Calories", v: `${recipe.calories} kcal`, p: 75 },
                { l: "Protein", v: `${recipe.protein}g`, p: (recipe.protein / 50) * 100 },
                { l: "Carbs", v: `${recipe.carbs}g`, p: (recipe.carbs / 100) * 100 },
                { l: "Fat", v: `${recipe.fat}g`, p: (recipe.fat / 50) * 100 },
              ].map((n) => (
                <div key={n.l}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{n.l}</span>
                    <span className="font-semibold">{n.v}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-ember" style={{ width: `${Math.min(100, n.p)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Similar */}
      <section className="mt-16">
        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-6">You might also love</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {similar.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
