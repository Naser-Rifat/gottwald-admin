import { useState, type ReactNode } from "react";
import type { AuthUser } from "../lib/types/auth";
import { logout as apiLogout } from "../lib/api/auth";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = "gottwald_admin_token";
const USER_KEY = "gottwald_admin_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializers — read from localStorage synchronously on first render
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
    }
    return null;
  });
  const isLoading = false;

  const setAuth = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const logout = async () => {
    if (token) await apiLogout(token);
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
