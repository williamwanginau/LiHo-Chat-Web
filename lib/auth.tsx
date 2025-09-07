"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, LoginResponse, get, post, setAccessToken, setAuthTokenProvider } from './api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Provide token to axios from memory (preferred over reading localStorage every time)
  useEffect(() => {
    setAuthTokenProvider(() => token);
  }, [token]);

  const bootstrap = useCallback(async () => {
    // Load token from localStorage once on mount
    const local = typeof window !== 'undefined' ? window.localStorage.getItem('liho.accessToken') : null;
    if (!local) {
      setLoading(false);
      return;
    }
    setToken(local);
    try {
      const me = await get<AuthUser>('/auth/me');
      // When not authorized, backend returns {} or 401 depending on guard; handle both
      if (me && (me as Partial<AuthUser>).id) {
        setUser(me);
      } else {
        setToken(null);
        setAccessToken(null);
      }
    } catch {
      setToken(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await post<LoginResponse>('/auth/login', { email, password });
    setToken(res.accessToken);
    setAccessToken(res.accessToken);
    const me = await get<AuthUser>('/auth/me');
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, token, loading, login, logout }), [user, token, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

