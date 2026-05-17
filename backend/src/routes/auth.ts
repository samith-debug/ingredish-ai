import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query, queryOne, execute, uuid } from "../db/client.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const authRouter = Router();

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/register
authRouter.post("/register", validateBody(RegisterSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body as z.infer<typeof RegisterSchema>;

    const existing = queryOne<{ id: string }>("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      res.status(409).json({ ok: false, error: "email_taken", message: "Email already registered" });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const id = uuid();
    execute("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)", [id, name, email, hash]);
    execute("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", [id]);

    const token = signToken({ userId: id, email });
    res.status(201).json({ ok: true, token, user: { id, name, email } });
  } catch (err) {
    console.error("[auth/register]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Registration failed" });
  }
});

// POST /auth/login
authRouter.post("/login", validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;

    const user = queryOne<{ id: string; email: string; name: string; password: string; avatar_url: string | null }>(
      "SELECT id, email, name, password, avatar_url FROM users WHERE email = ?",
      [email],
    );
    if (!user) {
      res.status(401).json({ ok: false, error: "invalid_credentials", message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ ok: false, error: "invalid_credentials", message: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url } });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Login failed" });
  }
});

// GET /auth/me
authRouter.get("/me", requireAuth, (req, res) => {
  try {
    const user = queryOne<{ id: string; email: string; name: string; avatar_url: string | null; created_at: string }>(
      "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?",
      [req.user!.userId],
    );
    if (!user) {
      res.status(404).json({ ok: false, error: "not_found", message: "User not found" });
      return;
    }
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url, createdAt: user.created_at } });
  } catch (err) {
    console.error("[auth/me]", err);
    res.status(500).json({ ok: false, error: "server_error", message: "Failed to fetch profile" });
  }
});
