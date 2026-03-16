import type { LoginPayload, AuthResponse } from "../types/auth";

const USE_MOCK = import.meta.env.VITE_DATA_SOURCE === "mock";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── MOCK CREDENTIALS ────────────────────────────────────────────────────────
// Only used in mock mode — remove when backend is ready
const MOCK_EMAIL = "admin@gottwald.com";
const MOCK_PASSWORD = "admin123";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Sends: { email, password }
// Returns: { token, user }

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    if (
      payload.email === MOCK_EMAIL &&
      payload.password === MOCK_PASSWORD
    ) {
      return {
        token: "mock-jwt-token-gottwald-2030",
        user: {
          id: "1",
          email: MOCK_EMAIL,
          name: "Mathias Gottwald",
        },
      };
    }
    throw new Error("Invalid email or password");
  }

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Login failed");
  }

  return res.json();
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Sends: Authorization header with token
// Returns: nothing

export async function logout(token: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }

  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  // Do not throw on logout failure — always clear local session
}
