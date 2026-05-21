'use client';

import { FormEvent, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { useCreateUser, useUsersList } from '@/lib/queries/use-users';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export default function StaffManagersPage() {
  const { data: managers, isPending, isError, error } =
    useUsersList('HOTEL_MANAGER');
  const createMutation = useCreateUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotelId, setHotelId] = useState('');

  const createError =
    createMutation.error instanceof ApiClientError
      ? createMutation.error.message
      : createMutation.error
        ? 'Failed to create manager'
        : null;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        email,
        password,
        role: 'HOTEL_MANAGER',
        hotelId,
      });
      setEmail('');
      setPassword('');
      setHotelId('');
    } catch {
      /* surfaced via mutation */
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Hotel managers</h1>
      <p className="mt-1 text-sm text-gray-600">
        Any Admin can create and manage Hotel Manager accounts. Assign a hotel by
        ID (hotel picker coming once the catalog is implemented).
      </p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Create manager</h2>
        <form onSubmit={handleCreate} className="mt-4 max-w-md space-y-4">
          <FormField
            id="manager-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="manager@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
          <FormField
            id="manager-password"
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
          <FormField
            id="manager-hotel-id"
            label="Hotel ID (UUID)"
            type="text"
            required
            placeholder="Hotel UUID from database"
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            className={fieldClass}
          />
          {createError && <ErrorMessage message={createError} />}
          <button
            type="submit"
            disabled={createMutation.isPending}
            title="Create manager"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create manager'}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Existing managers</h2>
        {isPending && <LoadingSpinner className="mt-4" />}
        {isError && (
          <ErrorMessage
            className="mt-4"
            message={
              error instanceof ApiClientError
                ? error.message
                : 'Failed to load managers'
            }
          />
        )}
        {managers && managers.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">No managers yet.</p>
        )}
        {managers && managers.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {managers.map((manager) => (
              <li
                key={manager.id}
                className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between"
              >
                <span>{manager.email}</span>
                <span className="text-gray-500">
                  Hotel: {manager.hotelId ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
