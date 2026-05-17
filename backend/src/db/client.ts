import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// DB file lives next to this file (backend/src/db/ingredish.db)
const DB_PATH = resolve(__dirname, "ingredish.db");

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Typed query helpers ───────────────────────────────────────

/** Run a SELECT and return all rows as T[] */
export function query<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): T[] {
  return db.prepare(sql).all(...params) as T[];
}

/** Run a SELECT and return the first row or null */
export function queryOne<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): T | null {
  return (db.prepare(sql).get(...params) as T | undefined) ?? null;
}

/** Run an INSERT / UPDATE / DELETE */
export function execute(sql: string, params: unknown[] = []): void {
  db.prepare(sql).run(...params);
}

/** Generate a UUID (replaces gen_random_uuid() from Postgres) */
export { randomUUID as uuid };

/** Apply the SQL schema idempotently */
export function applySchema(): void {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  db.exec(sql);
  console.log("[DB] SQLite schema applied ✓  →", DB_PATH);
}
