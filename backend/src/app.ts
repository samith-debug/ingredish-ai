import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { favoritesRouter } from "./routes/favorites.js";
import { recipesRouter } from "./routes/recipes.js";
import { statsRouter } from "./routes/stats.js";
import { settingsRouter } from "./routes/settings.js";
import { generateRouter } from "./routes/generate.js";

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      const allowed = (process.env.FRONTEND_ORIGIN ?? "").split(",").map((o) => o.trim()).filter(Boolean);
      if (allowed.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ingredish-backend", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/auth", authRouter);
app.use("/favorites", favoritesRouter);
app.use("/recipes", recipesRouter);
app.use("/stats", statsRouter);
app.use("/settings", settingsRouter);
app.use("/generate", generateRouter);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "not_found", message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[unhandled]", err);
  res.status(500).json({ ok: false, error: "server_error", message: err.message ?? "Internal server error" });
});

export default app;
