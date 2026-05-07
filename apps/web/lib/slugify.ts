/**
 * apps/web/lib/slugify.ts
 *
 * Centralized, production-safe slug utility.
 * Use this everywhere a string needs to become a URL path segment.
 *
 * Rules:
 *   - Lowercase only
 *   - Alphanumeric characters and hyphens only
 *   - Consecutive non-alphanumeric characters collapsed to a single hyphen
 *   - Leading and trailing hyphens removed
 *
 * Examples:
 *   "Mount Kilimanjaro"  → "mount-kilimanjaro"
 *   "Mt. Meru"          → "mt-meru"
 *   "Gorilla Hike"      → "gorilla-hike"
 *   "Safari & Trekking" → "safari-trekking"
 *   "Day Trips"         → "day-trips"
 */
export function toSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Normalizes a full slug path (segments separated by `/`).
 * Slugifies each segment independently, preserving the path structure.
 *
 * Examples:
 *   "Climbing/Kilimanjaro"        → "climbing/kilimanjaro"
 *   "destinations/Gorilla Hike"  → "destinations/gorilla-hike"
 *   "safari/Mt. Meru"            → "safari/mt-meru"
 */
export function normalizeSlugPath(path: string | undefined | null): string {
  if (!path) return "";
  return path
    .split("/")
    .map((segment) => toSlug(segment))
    .filter(Boolean)
    .join("/");
}

/**
 * Safely decodes percent-encoded characters (e.g. %20 → space) and then
 * normalizes the full slug path. Null/undefined safe, never throws.
 *
 * Use this whenever a slug may arrive already percent-encoded
 * (e.g. from URL params, old DB data, or user input).
 *
 * Examples:
 *   "Gorilla%20Hike"              → "gorilla-hike"
 *   "destinations/Gorilla Hike"  → "destinations/gorilla-hike"
 *   undefined                     → ""
 */
export function safeNormalizeSlugPath(path: string | undefined | null): string {
  if (!path) return "";
  let decoded = path;
  try {
    decoded = decodeURIComponent(path.replace(/\+/g, " "));
  } catch {
    decoded = path;
  }
  return normalizeSlugPath(decoded);
}
