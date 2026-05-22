'use client';

import { FormEvent, useMemo, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { ListUsersParams } from '@/lib/api/types';
import { useCreateUser, useUsersList } from '@/lib/queries/use-users';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { validateNewPassword } from '@/lib/validation/password';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const listParams = useMemo(
    (): ListUsersParams => ({ page, limit: 10, role: 'ADMIN' }),
    [page],
  );
  const { data, isPending, isError, error } = useUsersList(listParams);
  const admins = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const createMutation = useCreateUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const createError =
    createMutation.error instanceof ApiClientError
      ? createMutation.error.message
      : createMutation.error
        ? 'Failed to create admin'
        : null;
  const displayError = validationError ?? createError;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);
    const passwordError = validateNewPassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
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
        <p className="mt-1 text-sm text-gray-500">
          The admin must set a new password on first sign-in (temporary password below).
        </p>
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
          <PasswordField
            id="admin-password"
            label="Temporary password"
            required
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError(null);
            }}
            className={fieldClass}
          />
          {displayError && <ErrorMessage message={displayError} />}
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
        {!isPending && !isError && admins.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">No admin accounts yet.</p>
        )}
        {admins.length > 0 && (
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
        {data && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={data.total}
            limit={data.limit}
            itemLabel="admins"
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
