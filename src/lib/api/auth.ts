import type { LoginPayload, AuthResponse } from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

export const STORAGE_KEYS = {
  token: "gottwald_admin_token",
  refreshToken: "gottwald_admin_refresh_token",
  user: "gottwald_admin_user",
} as const;

export interface RefreshedTokens {
  accessToken: string;
  refreshToken?: string;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login/
// Sends: { email, password }
// Returns: { status, success, message, data: { tokens: { access, refresh }, user } }

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    throw new Error(
      (error.detail as string) ?? (error.message as string) ?? "Login failed",
    );
  }

  const raw = (await res.json()) as Record<string, unknown>;
  const data = (raw.data as Record<string, unknown>) ?? raw;
  const tokens = data.tokens as Record<string, unknown> | undefined;
  const token =
    (tokens?.access as string) ??
    (data.access as string) ??
    (data.token as string);
  if (!token) throw new Error("Invalid response: no token received");
  const refreshToken =
    (tokens?.refresh as string) ??
    (data.refresh as string) ??
    (data.refresh_token as string);
  const rawUser = data.user ?? data;
  const user = {
    id: String((rawUser as { id?: string }).id ?? "1"),
    email: String((rawUser as { email?: string }).email ?? payload.email),
    name: String(
      (rawUser as { name?: string }).name ??
        (rawUser as { username?: string }).username ??
        "Admin",
    ),
  };
  return { token, refreshToken, user };
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh-token/
// Sends: { refresh_token }
// Returns: { access, refresh? } or { access_token, refresh_token? } (Django JWT style)

let refreshLock: Promise<RefreshedTokens> | null = null;

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshedTokens> {
  if (refreshLock) return refreshLock;

  refreshLock = (async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh-token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      throw new Error(
        (err.detail as string) ??
          (err.message as string) ??
          "Token refresh failed",
      );
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const data = (raw.data as Record<string, unknown>) ?? raw;
    const tokens = data.tokens as Record<string, unknown> | undefined;
    const accessToken =
      (tokens?.access as string) ??
      (data.access as string) ??
      (data.token as string);
    const newRefresh =
      (tokens?.refresh as string) ??
      (data.refresh as string) ??
      (data.refresh_token as string);

    if (!accessToken)
      throw new Error("Invalid refresh response: no access token");
    return { accessToken, refreshToken: newRefresh };
  })();

  try {
    return await refreshLock;
  } finally {
    refreshLock = null;
  }
}

/** Persist new tokens after refresh. */
export function updateTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(STORAGE_KEYS.token, accessToken);
  if (refreshToken)
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
}

/** Clear all auth storage (e.g. after refresh failed or explicit logout). */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout/
// Backend expects { refresh_token } in body to blacklist it.
// If no refresh token: client-side logout only (clear state, no API call).

export async function logout(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  try {
    await fetch(`${BASE_URL}/api/v1/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // Ignore — always clear local session regardless
  }
}
