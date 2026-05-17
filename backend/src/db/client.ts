/**
 * Database client — Postgres (via pg).
 * Converts SQLite-style ? placeholders to $1, $2, $3... for Postgres.
 * Drop-in replacement for the old SQLite client — same sync-style API surface
 * but all functions are now async.
 */
import pg from "pg";
import { randomUUID } from "crypto";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => console.error("[DB] Unexpected pool error:", err));

// ── Placeholder converter ─────────────────────────────────────

function toPg(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ── Typed query helpers ───────────────────────────────────────

/** Run a SELECT and return all rows as T[] */
export async function query<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { rows } = await pool.query(toPg(sql), params);
  return rows as T[];
}

/** Run a SELECT and return the first row or null */
export async function queryOne<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const { rows } = await pool.query(toPg(sql), params);
  return (rows[0] as T) ?? null;
}

/** Run an INSERT / UPDATE / DELETE */
export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  await pool.query(toPg(sql), params);
}

/** Generate a UUID */
export { randomUUID as uuid };

/** Apply the SQL schema idempotently (called on boot) */
export async function applySchema(): Promise<void> {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL, password TEXT NOT NULL,
      avatar_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      vegetarian BOOLEAN DEFAULT TRUE, spicy BOOLEAN DEFAULT FALSE,
      gluten_free BOOLEAN DEFAULT FALSE, ai_personal BOOLEAN DEFAULT TRUE,
      notif_daily BOOLEAN DEFAULT TRUE, notif_weekly BOOLEAN DEFAULT TRUE,
      theme TEXT DEFAULT 'saffron-ember', updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS generated_recipes (
      id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL, cuisine TEXT, time TEXT, difficulty TEXT,
      calories INTEGER, protein INTEGER, carbs INTEGER, fat INTEGER,
      description TEXT, ingredients TEXT DEFAULT '[]', steps TEXT DEFAULT '[]',
      youtube_search TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipe_id TEXT NOT NULL, recipe_type TEXT NOT NULL DEFAULT 'famous',
      created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE (user_id, recipe_id)
    );
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL, metadata TEXT DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_gen_user ON generated_recipes(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_fav_user ON favorites(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_act_user ON activity_log(user_id, created_at);
  `;
  await pool.query(schema);
  console.log("[DB] Postgres schema applied ✓");
}

export { pool };
