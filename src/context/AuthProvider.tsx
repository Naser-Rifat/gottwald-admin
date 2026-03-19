import { useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../lib/types/auth";
import { logout as apiLogout, clearSession, STORAGE_KEYS } from "../lib/api/auth";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = STORAGE_KEYS.token;
const REFRESH_KEY = STORAGE_KEYS.refreshToken;
const USER_KEY = STORAGE_KEYS.user;

export function AuthProvider({ children }: { children: ReactNode }) {
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
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
    }
    return null;
  });
  const isLoading = false;

  const setAuth = (newToken: string, newUser: AuthUser, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    await apiLogout(refreshToken);
    clearSession();
    setToken(null);
    setUser(null);
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
