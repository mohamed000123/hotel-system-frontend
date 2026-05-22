'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ApiClientError } from '@/lib/api/client';
import type { ListUsersParams } from '@/lib/api/types';
import { useCreateUser, useDeleteUser, useUsersList } from '@/lib/queries/use-users';
import {
  createManagerSchema,
  type CreateManagerFormValues,
} from '@/lib/validation/schemas';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormPasswordField } from '@/components/ui/HookFormPasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export default function StaffManagersPage() {
  const [page, setPage] = useState(1);
  const listParams = useMemo(
    (): ListUsersParams => ({ page, limit: 10, role: 'HOTEL_MANAGER' }),
    [page],
  );
  const { data, isPending, isError, error } = useUsersList(listParams);
  const managers = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const form = useForm<CreateManagerFormValues>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: { email: '', password: '', hotelId: '' },
    mode: 'onBlur',
  });

  const createError =
    createMutation.error instanceof ApiClientError
      ? createMutation.error.message
      : createMutation.error
        ? 'Failed to create manager'
        : null;

  const deleteError =
    deleteMutation.error instanceof ApiClientError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? 'Failed to delete manager'
        : null;

  async function handleDelete(id: string, email: string) {
    if (
      !confirm(
        `Remove manager "${email}"? They will no longer be able to sign in.`,
      )
    ) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      /* surfaced below */
    }
  }

  async function onSubmit(values: CreateManagerFormValues) {
    try {
      await createMutation.mutateAsync({
        email: values.email,
        password: values.password,
        role: 'HOTEL_MANAGER',
        hotelId: values.hotelId,
      });
      form.reset();
    } catch {
      /* surfaced via mutation */
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Hotel managers</h1>
      <p className="mt-1 text-sm text-gray-600">
        Super Admin and Admin can create, update, and remove Hotel Manager accounts. Each hotel may
        have only one manager — assign a hotel by ID (hotel picker coming once the catalog
        is implemented).
      </p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Create manager</h2>
        <p className="mt-1 text-sm text-gray-500">
          The manager must set a new password on first sign-in (temporary password below).
        </p>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 max-w-md space-y-4"
            noValidate
          >
            <HookFormField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="manager@example.com"
              className={fieldClass}
            />
            <HookFormPasswordField
              name="password"
              label="Temporary password"
              placeholder="Create a strong password"
              className={fieldClass}
            />
            <HookFormField
              name="hotelId"
              label="Hotel ID (UUID)"
              type="text"
              placeholder="Hotel UUID from database"
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
        </FormProvider>
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
        {!isPending && !isError && managers.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">No managers yet.</p>
        )}
        {managers.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {managers.map((manager) => (
              <li
                key={manager.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{manager.email}</p>
                  <p className="text-gray-500">
                    Hotel: {manager.hotelId ?? '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(manager.id, manager.email)}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {deleteError && <ErrorMessage className="mt-4" message={deleteError} />}
        {data && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={data.total}
            limit={data.limit}
            itemLabel="managers"
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
