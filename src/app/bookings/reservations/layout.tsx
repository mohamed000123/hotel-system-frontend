'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['HOTEL_MANAGER']}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
