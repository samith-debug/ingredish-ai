/**
 * Central API client for IngreDish AI backend.
 *
 * Token storage strategy: we use a simple module-level variable for SSR
 * compatibility (TanStack Start server functions can read it),
 * plus localStorage for browser persistence across page loads.
 */

const BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  (typeof process !== "undefined" ? process.env.INGREDISH_API_URL : undefined) ||
  "http://localhost:3001";

const TOKEN_KEY = "ingredish:token";

// ── Token helpers ─────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("ingredish:auth:changed"));
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("ingredish:auth:changed"));
}

// ── Core fetch wrapper ────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<ApiResponse<T>> {
  const { token: explicitToken, ...fetchOptions } = options;
  const token = explicitToken ?? getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    });

    const body = await res.json().catch(() => ({}));

    return {
      ok: res.ok && body.ok !== false,
      data: body as T,
      error: body.error,
      message: body.message,
      status: res.status,
    };
  } catch (err) {
    return {
      ok: false,
      error: "network_error",
      message: err instanceof Error ? err.message : "Network request failed",
      status: 0,
    };
  }
}

// ── Typed API helpers ─────────────────────────────────────────

export const api = {
  get: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: "GET", token }),

  post: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body), token }),

  put: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body), token }),

  delete: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: "DELETE", token }),
};
