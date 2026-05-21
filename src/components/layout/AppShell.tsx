'use client';

import { AppNav } from './AppNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </div>
  );
}
