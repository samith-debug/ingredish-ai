import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ChefHat, Youtube, Flame, Salad, Mic, Camera, Heart, Brain, Soup } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";
import butterChicken from "@/assets/dish-butter-chicken.jpg";
import biryani from "@/assets/dish-biryani.jpg";
import paneer from "@/assets/dish-paneer-tikka.jpg";
import { FAMOUS_RECIPES } from "@/lib/recipes-data";
import { RecipeCard } from "@/components/RecipeCard";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "IngreDish AI — Cook Amazing Meals With AI" },
      { name: "description", content: "Premium AI Indian recipe generator. Turn ingredients you already have into delicious meals with YouTube tutorials." },
    ],
  }),
});

const FEATURES = [
  { icon: Sparkles, title: "AI Recipe Generator", desc: "Personalised recipes from your pantry, instantly." },
  { icon: Salad, title: "Ingredient-Based", desc: "Type, snap or speak — we'll do the thinking." },
  { icon: Youtube, title: "YouTube Tutorials", desc: "Watch India's best chefs make every dish." },
  { icon: ChefHat, title: "Famous Indian Recipes", desc: "From biryani to bhature, the icons of Indian cuisine." },
  { icon: Flame, title: "Nutrition Info", desc: "Calories, macros and balance on every recipe." },
  { icon: Heart, title: "Save Favorites", desc: "Build your own cookbook of go-to dishes." },
  { icon: Camera, title: "Smart Detection", desc: "Snap your fridge — AI spots the ingredients." },
  { icon: Brain, title: "Cooking Assistant", desc: "Step-by-step guidance while you cook." },
];

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-6 lg:pt-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-strong text-xs font-medium text-muted-foreground mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Powered by IngreDish AI · Gemini 3
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
              Cook Amazing<br />
              Meals With <span className="text-gradient">AI.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Tell us what's in your fridge — we'll craft delicious, authentic Indian
              recipes complete with steps, nutrition and YouTube tutorials. Made for the
              modern home cook.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/generate"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-ember text-primary-foreground font-semibold shadow-ember hover:opacity-95 transition"
              >
                <Sparkles className="h-4 w-4" />
                Generate Recipe
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-strong font-semibold hover:bg-white/10 transition"
              >
                Explore Indian Recipes
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-gradient-ember ring-2 ring-background" />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">28,491</span> meals cooked this week
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-glow ring-1 ring-white/10">
              <img src={heroFood} alt="Premium Indian cuisine" width={1536} height={1536} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/50 via-transparent to-transparent" />
            </div>

            {/* Floating card 1 */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-2 lg:-left-10 top-10 glass-strong rounded-2xl p-3 w-52 shadow-ember"
            >
              <div className="flex items-center gap-2.5">
                <img src={butterChicken} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Butter Chicken</div>
                  <div className="text-[10px] text-muted-foreground">45m · 540 kcal</div>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: "20%" }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="h-full bg-gradient-ember"
                />
              </div>
            </motion.div>

            {/* Floating card 2 */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-2 lg:-right-8 top-32 glass-strong rounded-2xl p-3 w-44"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Matched</span>
              </div>
              <div className="mt-1.5 text-sm font-semibold">98% ingredient match</div>
              <div className="text-[10px] text-muted-foreground">Tomato · Cream · Chicken</div>
            </motion.div>

            {/* Floating card 3 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-4 lg:right-2 bottom-16 glass-strong rounded-2xl p-3 w-56"
            >
              <div className="flex items-center gap-2.5">
                <img src={biryani} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div>
                  <div className="text-xs font-semibold">Hyderabadi Biryani</div>
                  <div className="text-[10px] text-muted-foreground">⭐ 4.9 · Trending</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute left-2 lg:-left-6 bottom-8 glass-strong rounded-2xl p-3 w-48"
            >
              <div className="flex items-center gap-2.5">
                <img src={paneer} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <div className="text-xs font-semibold">Paneer Tikka</div>
                  <div className="text-[10px] text-muted-foreground">High protein · 30m</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-32">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Everything you need</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
            A complete kitchen, powered by AI.
          </h2>
          <p className="mt-4 text-muted-foreground">From ingredient detection to step-by-step cooking, every feature is built for delicious outcomes.</p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl glass-strong p-6 hover:ring-ember transition"
            >
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-ember opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-ember grid place-items-center shadow-ember mb-4">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI demo strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-32">
        <div className="relative overflow-hidden rounded-[2.5rem] glass-strong p-8 lg:p-14">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-ember opacity-30 blur-3xl" />
          <div className="grid lg:grid-cols-2 gap-10 items-center relative">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Live AI</div>
              <h3 className="font-display text-3xl lg:text-4xl font-bold leading-tight">
                Type ingredients.<br /> Get dinner. In seconds.
              </h3>
              <p className="mt-4 text-muted-foreground max-w-md">Our AI understands Indian cooking traditions — from regional spice blends to authentic techniques.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-xs"><Mic className="h-3.5 w-3.5 text-primary" /> Voice input</div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-xs"><Camera className="h-3.5 w-3.5 text-primary" /> Photo scan</div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-xs"><Soup className="h-3.5 w-3.5 text-primary" /> Regional cuisines</div>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ingredients</div>
              <div className="flex flex-wrap gap-1.5">
                {["paneer", "tomato", "cream", "kasuri methi", "garam masala", "onion"].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-white/5 ring-1 ring-white/10">{t}</span>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-gradient-ember/10 ring-1 ring-primary/30">
                <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">AI Suggestion</div>
                <div className="font-semibold">Paneer Butter Masala</div>
                <div className="text-xs text-muted-foreground mt-1">25 min · 380 kcal · Medium difficulty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending recipes */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-32">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Trending now</div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">India's most loved dishes</h2>
          </div>
          <Link to="/recipes" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {FAMOUS_RECIPES.filter((r) => r.trending).slice(0, 4).map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-32">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-ember p-10 lg:p-20 text-center shadow-ember">
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, white, transparent 50%)" }} />
          <div className="relative">
            <h2 className="font-display text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Your next great meal is one prompt away.
            </h2>
            <Link
              to="/generate"
              className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-background text-foreground font-semibold hover:scale-105 transition shadow-2xl"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Start cooking now
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 mt-24 pb-8">
        <div className="border-t border-white/5 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" />
            IngreDish AI · Cook with intelligence
          </div>
          <div>© {new Date().getFullYear()} IngreDish AI</div>
        </div>
      </footer>
    </div>
  );
}
