'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import { getRedirectPath } from '@/lib/auth-routes';
import { useLogin, useRegister } from '@/lib/queries/use-auth';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { validateNewPassword } from '@/lib/validation/password';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeMutation = mode === 'login' ? loginMutation : registerMutation;
  const isPending = activeMutation.isPending;
  const apiError =
    activeMutation.error instanceof ApiClientError
      ? activeMutation.error.message
      : activeMutation.error
        ? 'Request failed'
        : null;
  const displayError = validationError ?? apiError;

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(getRedirectPath(user));
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || (isAuthenticated && user)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading your session…" />
      </main>
    );
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setValidationError(null);
    if (next === 'login') {
      setConfirmPassword('');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (mode === 'register') {
      const passwordError = validateNewPassword(password);
      if (passwordError) {
        setValidationError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
    }

    try {
      const response =
        mode === 'login'
          ? await loginMutation.mutateAsync({ email, password })
          : await registerMutation.mutateAsync({ email, password });
      router.replace(getRedirectPath(response.user));
    } catch {
      /* error surfaced via mutation state */
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
            <svg
              className="h-7 w-7 text-indigo-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5M4.5 21V9.75A2.25 2.25 0 016.75 7.5h10.5A2.25 2.25 0 0119.5 9.75V21M8.25 21v-4.5a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21M12 7.5V3.75m0 0L9.75 6m2.25-2.25L14.25 6"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
            Hotel Booking
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2
              id="auth-form-title"
              className="text-xl font-semibold text-slate-900"
            >
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>

          {/* Mode toggle — buttons (not form inputs) to satisfy axe/forms */}
          <div
            className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
            role="group"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              title="Sign in"
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2.5 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              title="Register"
              onClick={() => switchMode('register')}
              className={`rounded-lg py-2.5 text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            aria-labelledby="auth-form-title"
          >
            <FormField
              id="email"
              label="Email address"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode === 'login' ? (
              <FormField
                id="password"
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            ) : (
              <PasswordField
                id="password"
                label="Password"
                required
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError(null);
                }}
              />
            )}

            {mode === 'register' && (
              <FormField
                id="confirmPassword"
                label="Confirm password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationError) setValidationError(null);
                }}
              />
            )}

            {displayError && <ErrorMessage message={displayError} />}

            {isPending ? (
              <button
                type="submit"
                disabled
                aria-label="Submitting, please wait"
                aria-busy="true"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
                Please wait…
              </button>
            ) : (
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
