'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiClientError } from '@/lib/api/client';
import { getRedirectPath } from '@/lib/auth-routes';
import { useChangePassword } from '@/lib/queries/use-auth';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/validation/schemas';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormPasswordField } from '@/components/ui/HookFormPasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const changeMutation = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!isLoading && user && !user.mustChangePassword) {
      router.replace(getRedirectPath(user));
    }
  }, [isLoading, isAuthenticated, user, router]);

  const apiError =
    changeMutation.error instanceof ApiClientError
      ? changeMutation.error.message
      : changeMutation.error
        ? 'Failed to update password'
        : null;

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      const updated = await changeMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      showToast({
        title: 'Password updated',
        description: 'Your new password has been saved.',
        variant: 'success',
      });
      router.replace(getRedirectPath(updated));
    } catch (error) {
      showToast({
        title: 'Failed to update password',
        description:
          error instanceof ApiClientError ? error.message : 'Please try again.',
        variant: 'error',
      });
    }
  }

  if (isLoading || !user) {
    return <LoadingSpinner label="Loading…" />;
  }

  if (!user.mustChangePassword) {
    return <LoadingSpinner label="Redirecting…" />;
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Set your password</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your account was created with a temporary password. Choose a new password
        to continue — you only need to do this once.
      </p>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          <HookFormField
            name="currentPassword"
            label="Temporary password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <HookFormPasswordField
            name="newPassword"
            label="New password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <HookFormField
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />

          {apiError && <ErrorMessage message={apiError} />}

          <button
            type="submit"
            disabled={changeMutation.isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {changeMutation.isPending ? 'Saving…' : 'Save and continue'}
          </button>
        </form>
      </FormProvider>

      <button
        type="button"
        onClick={logout}
        className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
      >
        Sign out
      </button>
    </div>
  );
}
