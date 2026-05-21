'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRedirectPath } from '@/lib/auth-routes';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        router.replace(getRedirectPath(user.role));
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <LoadingSpinner label="Loading…" />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <p className="text-gray-600">Redirecting…</p>
      {isAuthenticated && (
        <button
          type="button"
          onClick={logout}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Sign out
        </button>
      )}
    </main>
  );
}
