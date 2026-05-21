'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function HotelsPlaceholderPage() {
  return (
    <ProtectedRoute>
      <HotelsContent />
    </ProtectedRoute>
  );
}

function HotelsContent() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Hotels</h1>
      <p className="mt-2 text-gray-600">
        Hotel catalog (User Story 2) — you are signed in as{' '}
        <strong>{user?.email}</strong> ({user?.role}).
      </p>
      <div className="mt-6 flex gap-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-blue-600 hover:underline"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
