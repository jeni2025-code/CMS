// Central API utility
// Backend URL comes from environment variable - set in .env.local for local dev
// and in Vercel/Render environment settings for production.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper that automatically prepends the backend base URL.
 * Usage: apiClient("/auth/login", { method: "POST", body: ... })
 */
export async function apiClient(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}
