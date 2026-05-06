/**
 * apps/web/lib/api.ts
 *
 * Central helper for building backend API URLs.
 *
 * NEXT_PUBLIC_API_URL already includes the version prefix, e.g.:
 *   http://localhost:8000/api/v1   (dev)
 *   https://api.example.com/api/v1 (prod)
 *
 * Usage:
 *   fetch(apiUrl("settings"))             → …/api/v1/settings
 *   fetch(apiUrl("locations/category/x")) → …/api/v1/locations/category/x
 *
 * The function trims accidental leading/trailing slashes so callers can
 * write either apiUrl("settings") or apiUrl("/settings") interchangeably.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

if (!BASE && typeof window !== "undefined") {
  console.warn("[api] NEXT_PUBLIC_API_URL is not set. All API calls will fail.");
}

/**
 * Returns the full API URL for a given path segment.
 * Strips leading slashes from `path` before joining so the base URL's
 * /api/v1 prefix is never duplicated.
 */
export function apiUrl(path: string): string {
  return `${BASE}/${path.replace(/^\/+/, "")}`;
}
