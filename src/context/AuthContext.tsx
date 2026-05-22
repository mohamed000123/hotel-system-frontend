'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = mounted && !!getStoredToken();
  const { data: me, isLoading, isError } = useMe(hasToken);
  const logoutFn = useLogout();

  const logout = useCallback(() => {
    logoutFn();
    router.replace('/login');
  }, [logoutFn, router]);

  useEffect(() => {
    if (!mounted) return;
    if (hasToken && !isLoading && !me && !isError) {
      logoutFn();
      return;
    }
    if (isError && hasToken) {
      logoutFn();
    }
  }, [mounted, isError, hasToken, isLoading, me, logoutFn]);

  const user = hasToken ? (me ?? null) : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: hasToken && !!user,
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
