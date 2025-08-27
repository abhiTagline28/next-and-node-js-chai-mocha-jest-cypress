export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
    try {
      // Mirror token in a cookie for middleware-based route protection
      if (token) {
        document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
      } else {
        // Expire the cookie
        document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    } catch (_) {
      // ignore cookie errors in non-browser contexts
    }
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    accessToken = token;
  }
  return accessToken;
};

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  next?: RequestInit["next"];
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, auth = false, next } = options;
  const url = `${API_BASE_URL}${path}`;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    next,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      (init.headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }

  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed: ${res.status}`
    );
  }
  return data as T;
}

export const withAuth = <Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>
) => {
  return async (...args: Args) => {
    const token = getAccessToken();
    if (!token) throw new Error("Not authenticated");
    return fn(...args);
  };
};
