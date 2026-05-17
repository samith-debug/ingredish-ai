import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChefHat, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { loginUser, storeUser } from "@/lib/auth.functions";
import { setToken } from "@/lib/api-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign In — IngreDish AI" },
      { name: "description", content: "Sign in to your IngreDish AI account." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const runLogin = useServerFn(loginUser);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await runLogin({ data: form });
      if (!res.ok) {
        toast.error(res.message ?? "Login failed");
        return;
      }
      setToken(res.token);
      storeUser(res.user);
      window.dispatchEvent(new Event("ingredish:auth:changed"));
      toast.success(`Welcome back, ${res.user.name}! 🍽️`);
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex flex-col items-center gap-3 group">
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-ember grid place-items-center shadow-ember">
              <ChefHat className="h-7 w-7 text-primary-foreground" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-ember opacity-50 blur-xl -z-10 group-hover:opacity-80 transition" />
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-xl">IngreDish AI</div>
              <div className="text-xs text-muted-foreground tracking-wider">AI Kitchen</div>
            </div>
          </Link>
        </div>

        <div className="glass-strong rounded-3xl p-8">
          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Sign in to access your kitchen.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-input/40 ring-1 ring-white/10 focus-within:ring-primary transition">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-input/40 ring-1 ring-white/10 focus-within:ring-primary transition">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  id="login-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-ember text-primary-foreground font-semibold shadow-ember hover:opacity-95 disabled:opacity-60 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create one →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
