import "dotenv/config";
import { applySchema } from "../src/db/client.js";
import app from "../src/app.js";

// Apply schema on cold start (idempotent — safe to run every time)
applySchema().catch((err) => console.error("[vercel] Schema apply failed:", err));

export default app;
