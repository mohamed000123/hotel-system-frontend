'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getStoredToken } from '@/lib/api/client';
import type { User } from '@/lib/api/types';
import { useLogout, useMe } from '@/lib/queries/use-auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = mounted && !!getStoredToken();
  const { data: user, isLoading, isError } = useMe(hasToken);
  const logoutFn = useLogout();

  const logout = useCallback(() => {
    logoutFn();
  }, [logoutFn]);

  useEffect(() => {
    if (isError && hasToken) {
      logout();
    }
  }, [isError, hasToken, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user && hasToken,
      isLoading: hasToken && isLoading,
      logout,
    }),
    [user, hasToken, isLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
