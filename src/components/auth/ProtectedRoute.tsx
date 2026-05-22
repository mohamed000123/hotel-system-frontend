'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CHANGE_PASSWORD_PATH } from '@/lib/auth-routes';
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
  const pathname = usePathname();

  const roleDenied =
    isAuthenticated &&
    user &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (
      !isLoading &&
      user?.mustChangePassword &&
      pathname !== CHANGE_PASSWORD_PATH
    ) {
      router.replace(CHANGE_PASSWORD_PATH);
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  if (isLoading) {
    return <LoadingSpinner label="Checking session…" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
    return <LoadingSpinner label="Redirecting…" />;
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
