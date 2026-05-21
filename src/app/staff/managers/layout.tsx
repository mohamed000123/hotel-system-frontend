'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

export default function StaffManagersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
