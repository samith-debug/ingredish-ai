-- IngreDish AI — SQLite Schema (auto-applied on boot)

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  password   TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  vegetarian   INTEGER DEFAULT 1,
  spicy        INTEGER DEFAULT 0,
  gluten_free  INTEGER DEFAULT 0,
  ai_personal  INTEGER DEFAULT 1,
  notif_daily  INTEGER DEFAULT 1,
  notif_weekly INTEGER DEFAULT 1,
  theme        TEXT    DEFAULT 'saffron-ember',
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS generated_recipes (
  id             TEXT PRIMARY KEY,
  user_id        TEXT REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  cuisine        TEXT,
  time           TEXT,
  difficulty     TEXT,
  calories       INTEGER,
  protein        INTEGER,
  carbs          INTEGER,
  fat            INTEGER,
  description    TEXT,
  ingredients    TEXT DEFAULT '[]',
  steps          TEXT DEFAULT '[]',
  youtube_search TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id   TEXT NOT NULL,
  recipe_type TEXT NOT NULL DEFAULT 'famous',
  created_at  TEXT DEFAULT (datetime('now')),
  UNIQUE (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  metadata   TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gen_user    ON generated_recipes(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_fav_user    ON favorites(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_act_user    ON activity_log(user_id, created_at);
