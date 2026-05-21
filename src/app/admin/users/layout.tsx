'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
