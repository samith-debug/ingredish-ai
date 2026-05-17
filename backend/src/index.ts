import "dotenv/config";
import express from "express";
import cors from "cors";
import { applySchema } from "./db/client.js";
import { authRouter } from "./routes/auth.js";
import { favoritesRouter } from "./routes/favorites.js";
import { recipesRouter } from "./routes/recipes.js";
import { statsRouter } from "./routes/stats.js";
import { settingsRouter } from "./routes/settings.js";
import { generateRouter } from "./routes/generate.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return cb(null, true);
      // Allow any localhost / 127.0.0.1 port in development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      // Allow any explicitly listed origins from env
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

// ── Boot ──────────────────────────────────────────────────────
async function start() {
  try {
    applySchema();
    app.listen(PORT, () => {
      console.log(`\n🍽️  IngreDish AI backend running`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/health`);
      console.log(`   DB:      SQLite (backend/src/db/ingredish.db)\n`);
    });
  } catch (err) {
    console.error("[boot] Failed to start server:", err);
    process.exit(1);
  }
}

start();
