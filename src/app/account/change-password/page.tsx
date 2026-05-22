'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import { getRedirectPath } from '@/lib/auth-routes';
import { useChangePassword } from '@/lib/queries/use-auth';
import { validateNewPassword } from '@/lib/validation/password';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const changeMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

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
  const displayError = validationError ?? apiError;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      const updated = await changeMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      router.replace(getRedirectPath(updated));
    } catch {
      /* surfaced via mutation */
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          id="current-password"
          label="Temporary password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <PasswordField
          id="new-password"
          label="New password"
          required
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (validationError) setValidationError(null);
          }}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <FormField
          id="confirm-new-password"
          label="Confirm new password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />

        {displayError && <ErrorMessage message={displayError} />}

        <button
          type="submit"
          disabled={changeMutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {changeMutation.isPending ? 'Saving…' : 'Save and continue'}
        </button>
      </form>

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
