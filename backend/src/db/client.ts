/**
 * Database client — Postgres (via pg).
 * Converts SQLite-style ? placeholders to $1, $2, $3... for Postgres.
 * Drop-in replacement for the old SQLite client — same sync-style API surface
 * but all functions are now async.
 */
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
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
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  await pool.query(sql);
  console.log("[DB] Postgres schema applied ✓");
}

export { pool };
