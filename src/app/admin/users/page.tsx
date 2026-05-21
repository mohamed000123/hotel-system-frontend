'use client';

import { FormEvent, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { useCreateUser, useUsersList } from '@/lib/queries/use-users';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export default function AdminUsersPage() {
  const { data: admins, isPending, isError, error } = useUsersList('ADMIN');
  const createMutation = useCreateUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createError =
    createMutation.error instanceof ApiClientError
      ? createMutation.error.message
      : createMutation.error
        ? 'Failed to create admin'
        : null;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        email,
        password,
        role: 'ADMIN',
      });
      setEmail('');
      setPassword('');
    } catch {
      /* surfaced via mutation */
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform administrators</h1>
      <p className="mt-1 text-sm text-gray-600">
        Create and manage Admin accounts only. Hotel Managers are managed by Admins at
        Staff → Managers.
      </p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Create admin</h2>
        <form onSubmit={handleCreate} className="mt-4 max-w-md space-y-4">
          <FormField
            id="admin-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
          <FormField
            id="admin-password"
            label="Temporary password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
          {createError && <ErrorMessage message={createError} />}
          <button
            type="submit"
            disabled={createMutation.isPending}
            title="Create admin"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Existing admins</h2>
        {isPending && <LoadingSpinner className="mt-4" />}
        {isError && (
          <ErrorMessage
            className="mt-4"
            message={
              error instanceof ApiClientError
                ? error.message
                : 'Failed to load admins'
            }
          />
        )}
        {admins && admins.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">No admin accounts yet.</p>
        )}
        {admins && admins.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>{admin.email}</span>
                <span className="text-gray-500">
                  {admin.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString()
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
