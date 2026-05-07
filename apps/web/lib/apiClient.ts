/**
 * apps/web/lib/apiClient.ts
 *
 * Centralized, production-safe API client for all fetch calls.
 *
 * - Works in server components, client components, and edge runtime
 * - Never throws — always returns a typed result
 * - Handles non-JSON responses, network failures, and non-2xx statuses
 * - Auth token is optional; pass it for admin/protected routes
 *
 * Usage:
 *   // Public read
 *   const { ok, data, error } = await apiFetch("/settings");
 *
 *   // Authenticated write
 *   const { ok, data, error } = await apiFetch("/locations", {
 *     method: "POST",
 *     body: JSON.stringify(payload),
 *     token: adminToken,
 *   });
 *
 *   // Server component with ISR
 *   const { ok, data } = await apiFetch("/locations/slug", {
 *     next: { revalidate: 3600 },
 *   });
 */

export interface ApiResult<T = any> {
  /** true if the request succeeded and the API returned status:"success" */
  ok: boolean;
  /** unwrapped response body — the value of `json.data` on success */
  data: T | null;
  /** human-readable error message, null on success */
  error: string | null;
  /** HTTP status code, 0 on network failure */
  status: number;
}

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  /** Bearer token for Authorization header */
  token?: string | null;
  /** Extra / override headers */
  headers?: Record<string, string>;
};

/**
 * Safe wrapper around fetch that never throws.
 *
 * @param path  Path relative to NEXT_PUBLIC_API_URL, e.g. "/settings"
 * @param opts  Standard RequestInit + optional `token` field
 */
export async function apiFetch<T = any>(
  path: string,
  opts?: ApiFetchOptions,
): Promise<ApiResult<T>> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[apiFetch] NEXT_PUBLIC_API_URL is not set");
    }
    return { ok: false, data: null, error: "API URL not configured", status: 0 };
  }

  const { token, headers: extraHeaders, ...rest } = opts ?? {};

  const headers: Record<string, string> = {
    ...(rest.body && !(rest.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Strip leading slash from path so base URL never gains double-slash
  const url = `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  try {
    const res = await fetch(url, { ...rest, headers });

    // Read body as text first — avoids JSON parse panic on HTML error pages
    let text = "";
    try {
      text = await res.text();
    } catch {
      return {
        ok: false,
        data: null,
        error: `Failed to read response body (HTTP ${res.status})`,
        status: res.status,
      };
    }

    // Attempt JSON parse
    let parsed: any = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        return {
          ok: false,
          data: null,
          error: `Non-JSON response from server (HTTP ${res.status})`,
          status: res.status,
        };
      }
    }

    // Non-2xx → treat as error
    if (!res.ok) {
      return {
        ok: false,
        data: null,
        error: parsed?.message ?? `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    // API-level error (status:"error" in body)
    if (parsed?.status === "error") {
      return {
        ok: false,
        data: null,
        error: parsed.message ?? "API returned an error",
        status: res.status,
      };
    }

    // Success — unwrap `data` if it exists, otherwise return the whole body
    const payload = parsed !== null && "data" in parsed ? parsed.data : parsed;
    return { ok: true, data: payload as T, error: null, status: res.status };
  } catch (err: any) {
    // Network failure, CORS, timeout, etc.
    const msg = err?.message ?? "Network error";
    if (process.env.NODE_ENV !== "production") {
      console.error(`[apiFetch] ${path}:`, msg);
    }
    return { ok: false, data: null, error: msg, status: 0 };
  }
}

/**
 * Convenience wrapper that reads the admin token from localStorage.
 * Only usable in client components (browser environment).
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}
