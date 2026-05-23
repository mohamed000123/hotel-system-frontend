'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/context/ToastContext';
import { ApiClientError } from '@/lib/api/client';
import type { ListUsersParams } from '@/lib/api/types';
import { useCreateUser, useDeleteUser, useUsersList } from '@/lib/queries/use-users';
import {
  createAdminSchema,
  type CreateAdminFormValues,
} from '@/lib/validation/schemas';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormPasswordField } from '@/components/ui/HookFormPasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export default function AdminUsersPage() {
  const { confirm, showToast } = useToast();
  const [page, setPage] = useState(1);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const listParams = useMemo(
    (): ListUsersParams => ({ page, limit: 10, role: 'ADMIN' }),
    [page],
  );
  const { data, isPending, isError, error } = useUsersList(listParams);
  const admins = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  async function onSubmit(values: CreateAdminFormValues) {
    try {
      await createMutation.mutateAsync({
        email: values.email,
        password: values.password,
        role: 'ADMIN',
      });
      form.reset();
      showToast({
        title: 'Admin created',
        description: `${values.email} must change password on first sign-in.`,
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Failed to create admin',
        description:
          error instanceof ApiClientError ? error.message : 'Please try again.',
        variant: 'error',
      });
    }
  }

  async function handleDelete(id: string, email: string) {
    if (deletingAdminId) {
      return;
    }

    const approved = await confirm({
      title: `Remove admin "${email}"?`,
      description: 'They will no longer be able to sign in.',
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
    });
    if (!approved) {
      return;
    }

    try {
      setDeletingAdminId(id);
      await deleteMutation.mutateAsync(id);
      showToast({
        title: 'Admin deleted',
        description: `"${email}" has been removed.`,
        variant: 'warning',
      });
    } catch (error) {
      showToast({
        title: 'Failed to delete admin',
        description:
          error instanceof ApiClientError ? error.message : 'Please try again.',
        variant: 'error',
      });
    } finally {
      setDeletingAdminId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform administrators</h1>
      <p className="mt-1 text-sm text-gray-600">
        Create and manage Admin accounts only. Hotel Managers are managed at Staff → Managers.
      </p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Create admin</h2>
        <p className="mt-1 text-sm text-gray-500">
          The admin must set a new password on first sign-in (temporary password below).
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
              placeholder="admin@example.com"
              className={fieldClass}
            />
            <HookFormPasswordField
              name="password"
              label="Temporary password"
              placeholder="Create a strong password"
              className={fieldClass}
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              title="Create admin"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create admin'}
            </button>
          </form>
        </FormProvider>
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
                <button
                  type="button"
                  onClick={() => handleDelete(admin.id, admin.email)}
                  title={deletingAdminId === admin.id ? 'Deleting admin' : 'Delete admin'}
                  className="text-sm text-red-600 hover:underline"
                >
                  {deletingAdminId === admin.id ? 'Deleting…' : 'Delete'}
                </button>
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
