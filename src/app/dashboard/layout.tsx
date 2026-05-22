import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      allowedRoles={['SUPER_ADMIN', 'ADMIN', 'HOTEL_MANAGER']}
    >
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
