import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Palette, Salad, Brain, Bell, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api, getToken } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings — IngreDish AI" }] }),
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gradient-ember shadow-ember" : "bg-white/10"}`}
    >
      <motion.span
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-white"
      />
    </button>
  );
}

function Settings() {
  const [prefs, setPrefs] = useState({ veg: true, spicy: false, gluten: false, notif: true, weekly: true, ai: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from API on mount
  const loadSettings = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    const res = await api.get<{ ok: boolean; settings: { vegetarian: boolean; spicy: boolean; glutenFree: boolean; aiPersonal: boolean; notifDaily: boolean; notifWeekly: boolean } }>("/settings");
    if (res.ok && res.data) {
      const s = res.data.settings;
      setPrefs({ veg: s.vegetarian, spicy: s.spicy, gluten: s.glutenFree, ai: s.aiPersonal, notif: s.notifDaily, weekly: s.notifWeekly });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updatePref = async (key: keyof typeof prefs, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    const token = getToken();
    if (!token) return;
    setSaving(true);
    const keyMap: Record<string, string> = { veg: "vegetarian", spicy: "spicy", gluten: "glutenFree", ai: "aiPersonal", notif: "notifDaily", weekly: "notifWeekly" };
    const res = await api.put("/settings", { [keyMap[key]]: value });
    if (!res.ok) toast.error("Failed to save settings");
    else toast.success("Settings saved");
    setSaving(false);
  };

  const sections = [
    {
      icon: User, title: "Profile",
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <input defaultValue="Chef Vihaan" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-input/40 ring-1 ring-white/10 focus:ring-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input defaultValue="chef@ingredish.ai" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-input/40 ring-1 ring-white/10 focus:ring-primary outline-none text-sm" />
          </div>
        </div>
      ),
    },
    {
      icon: Palette, title: "Theme",
      content: (
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "Saffron Ember", colors: ["#0f0a08", "#ff7a1a", "#e23e2b"] },
            { name: "Tandoor Gold", colors: ["#0c0a09", "#f5b342", "#c2410c"] },
            { name: "Midnight", colors: ["#0a0a0f", "#ff6b6b", "#fbbf24"] },
          ].map((t, i) => (
            <button key={t.name} className={`p-3 rounded-xl glass ${i === 0 ? "ring-2 ring-primary" : ""}`}>
              <div className="flex gap-1 mb-2">
                {t.colors.map((c) => <div key={c} className="h-6 flex-1 rounded" style={{ background: c }} />)}
              </div>
              <div className="text-[10px] font-medium">{t.name}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: Salad, title: "Dietary Preferences",
      content: (
        <div className="space-y-3">
          {[
            { k: "veg", l: "Vegetarian by default" },
            { k: "spicy", l: "Prefer spicy dishes" },
            { k: "gluten", l: "Gluten-free" },
          ].map((o) => (
            <div key={o.k} className="flex items-center justify-between py-2">
              <span className="text-sm">{o.l}</span>
              <Toggle on={prefs[o.k as keyof typeof prefs]} onChange={(v) => updatePref(o.k as keyof typeof prefs, v)} />
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Brain, title: "AI Preferences",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm">Personalised suggestions</div>
              <div className="text-xs text-muted-foreground">Learn from your cooking history</div>
            </div>
            <Toggle on={prefs.ai} onChange={(v) => updatePref("ai", v)} />
          </div>
        </div>
      ),
    },
    {
      icon: Bell, title: "Notifications",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Daily recipe suggestions</span>
            <Toggle on={prefs.notif} onChange={(v) => updatePref("notif", v)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Weekly meal plan</span>
            <Toggle on={prefs.weekly} onChange={(v) => updatePref("weekly", v)} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-3">Settings</div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">Make it <span className="text-gradient">yours.</span></h1>
          {(loading || saving) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
      </motion.div>

      <div className="space-y-4">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-gradient-ember grid place-items-center shadow-ember">
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
            </div>
            {s.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
