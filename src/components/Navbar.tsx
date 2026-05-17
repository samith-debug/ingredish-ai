import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChefHat, Sparkles, Heart, LayoutDashboard, BookOpen, Settings, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { getToken, clearToken } from "@/lib/api-client";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Home", icon: ChefHat },
  { to: "/generate", label: "Generate", icon: Sparkles },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

interface StoredUser {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  // Load user from localStorage whenever auth state changes
  const syncUser = () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const stored = localStorage.getItem("ingredish:user");
      if (stored) setUser(JSON.parse(stored) as StoredUser);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    window.addEventListener("ingredish:auth:changed", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("ingredish:auth:changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("ingredish:user");
    setUser(null);
    window.dispatchEvent(new Event("ingredish:auth:changed"));
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 px-4 pt-4"
      >
        <nav className="glass-strong mx-auto max-w-7xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-ember grid place-items-center shadow-ember">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl bg-gradient-ember opacity-50 blur-md -z-10 group-hover:opacity-80 transition" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base tracking-tight">IngreDish</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Kitchen</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active = loc.pathname === item.to || (item.to !== "/" && loc.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-white/5 ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/settings"
              className="hidden sm:grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {user ? (
              <>
                <Link
                  to="/generate"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-ember text-primary-foreground text-sm font-semibold shadow-ember hover:opacity-90 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </Link>
                {/* User avatar with initials */}
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    title={user.name}
                    className="h-8 w-8 rounded-full bg-gradient-ember ring-2 ring-background grid place-items-center text-xs font-bold text-primary-foreground select-none"
                  >
                    {getInitials(user.name)}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    aria-label="Sign out"
                    className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-ember text-primary-foreground text-sm font-semibold shadow-ember hover:opacity-90 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-lg text-foreground hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-10">
            <span className="font-display font-bold">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/5">
              <X className="h-5 w-5" />
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl glass">
              <div className="h-9 w-9 rounded-full bg-gradient-ember grid place-items-center text-xs font-bold text-primary-foreground">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {[...NAV, { to: "/settings", label: "Settings", icon: Settings }].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl glass text-base font-medium"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </Link>
            ))}

            {user ? (
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl glass text-base font-medium text-left text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-ember text-primary-foreground text-base font-semibold"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-4 inset-x-4 z-40 glass-strong rounded-2xl px-2 py-2 flex items-center justify-around">
        {NAV.map((item) => {
          const active = loc.pathname === item.to || (item.to !== "/" && loc.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
