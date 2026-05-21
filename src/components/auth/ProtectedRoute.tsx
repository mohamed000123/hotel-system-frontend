'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/api/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const roleDenied =
    isAuthenticated &&
    user &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner label="Checking session…" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roleDenied) {
    return (
      <main className="mx-auto max-w-lg p-8">
        <ErrorMessage message="You do not have permission to view this page." />
      </main>
    );
  }

  return <>{children}</>;
}
