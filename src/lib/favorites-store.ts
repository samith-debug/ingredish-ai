/**
 * Favorites store — global singleton so ALL components share the same state.
 * Uses useSyncExternalStore for React 18 concurrent-safe subscriptions.
 * Hybrid: API when logged in, localStorage as fallback for guests.
 */
import { useSyncExternalStore, useCallback } from "react";
import { api, getToken } from "./api-client.js";

const LS_KEY = "ingredish:favorites";

// ── In-memory singleton state ─────────────────────────────────

let _favs: string[] = [];
let _loaded = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function getSnapshot(): string[] {
  return _favs;
}

function getServerSnapshot(): string[] {
  return [];
}

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// ── localStorage helpers ──────────────────────────────────────

function lsRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function lsWrite(ids: string[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

// ── API helpers ───────────────────────────────────────────────

async function apiFetchFavorites(): Promise<string[]> {
  const res = await api.get<{ favorites: Array<{ recipe_id: string }> }>("/favorites");
  if (!res.ok || !res.data) return [];
  return res.data.favorites.map((f) => f.recipe_id);
}

async function apiToggleFavorite(
  recipeId: string,
  recipeType: "famous" | "generated" = "famous",
): Promise<boolean> {
  const res = await api.post<{ isFavorited: boolean }>("/favorites/toggle", { recipeId, recipeType });
  return res.data?.isFavorited ?? false;
}

// ── Load (called once globally, re-called after mutations) ────

let _loadPromise: Promise<void> | null = null;

async function loadFavorites(): Promise<void> {
  const token = getToken();
  let ids: string[];
  if (token) {
    ids = await apiFetchFavorites();
    lsWrite(ids); // keep localStorage in sync
  } else {
    ids = lsRead();
  }
  _favs = ids;
  _loaded = true;
  notify();
}

function ensureLoaded() {
  if (!_loadPromise) {
    _loadPromise = loadFavorites().catch(() => {
      _loadPromise = null; // allow retry on error
    });
  }
  return _loadPromise;
}

// ── Toggle ────────────────────────────────────────────────────

async function toggleFavorite(recipeId: string, recipeType: "famous" | "generated" = "famous") {
  const token = getToken();
  if (token) {
    // Optimistic update
    _favs = _favs.includes(recipeId)
      ? _favs.filter((x) => x !== recipeId)
      : [..._favs, recipeId];
    notify();
    await apiToggleFavorite(recipeId, recipeType);
    // Re-sync from server for truth
    await loadFavorites();
  } else {
    const next = _favs.includes(recipeId)
      ? _favs.filter((x) => x !== recipeId)
      : [..._favs, recipeId];
    _favs = next;
    lsWrite(next);
    notify();
  }
}

// ── React hook ────────────────────────────────────────────────

export function useFavorites() {
  const favs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Kick off the initial load (idempotent — only runs once globally)
  ensureLoaded();

  const toggle = useCallback(
    (recipeId: string, recipeType: "famous" | "generated" = "famous") =>
      toggleFavorite(recipeId, recipeType),
    [],
  );

  return {
    favorites: favs,
    loaded: _loaded,
    toggle,
    isFav: (id: string) => favs.includes(id),
  };
}

// Re-load when auth changes (login/logout)
if (typeof window !== "undefined") {
  window.addEventListener("ingredish:auth:changed", () => {
    _loadPromise = null; // force reload
    loadFavorites();
  });
}
