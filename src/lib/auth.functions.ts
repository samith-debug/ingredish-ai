import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "./api-client.js";

// ── Types ─────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

/** Persist user profile to localStorage so Navbar can read it synchronously */
export function storeUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ingredish:user", JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ingredish:user");
}

const RegisterInput = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Server Functions ──────────────────────────────────────────

/**
 * Register a new user. Returns a JWT token on success.
 */
export const registerUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => RegisterInput.parse(data))
  .handler(async ({ data }) => {
    const res = await api.post<{ ok: boolean; token: string; user: AuthUser; message?: string }>(
      "/auth/register",
      data,
    );
    if (!res.ok) {
      return { ok: false as const, message: res.message ?? "Registration failed" };
    }
    const body = res.data!;
    return { ok: true as const, token: body.token, user: body.user };
  });

/**
 * Login an existing user. Returns a JWT token on success.
 */
export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => LoginInput.parse(data))
  .handler(async ({ data }) => {
    const res = await api.post<{ ok: boolean; token: string; user: AuthUser; message?: string }>(
      "/auth/login",
      data,
    );
    if (!res.ok) {
      return { ok: false as const, message: res.message ?? "Login failed" };
    }
    const body = res.data!;
    return { ok: true as const, token: body.token, user: body.user };
  });

/**
 * Fetch the currently authenticated user from the token.
 */
export const getMe = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const res = await api.get<{ ok: boolean; user: AuthUser; message?: string }>(
      "/auth/me",
      data.token,
    );
    if (!res.ok) {
      return { ok: false as const, message: res.message ?? "Not authenticated" };
    }
    return { ok: true as const, user: res.data!.user };
  });
