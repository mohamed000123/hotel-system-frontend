import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

export default function NewBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['GUEST']}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
