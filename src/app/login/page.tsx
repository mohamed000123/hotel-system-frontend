'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import { getRedirectPath } from '@/lib/auth-routes';
import { useLogin, useRegister } from '@/lib/queries/use-auth';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@/lib/validation/schemas';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormPasswordField } from '@/components/ui/HookFormPasswordField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function AuthFormPanel({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isLogin = mode === 'login';
  const submitRef = useRef<HTMLButtonElement>(null);

  const form = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin
      ? { email: '', password: '' }
      : { email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const activeMutation = isLogin ? loginMutation : registerMutation;
  const apiError =
    activeMutation.error instanceof ApiClientError
      ? activeMutation.error.message
      : activeMutation.error
        ? 'Request failed'
        : null;

  useEffect(() => {
    const btn = submitRef.current;
    if (!btn) return;
    if (activeMutation.isPending) {
      btn.setAttribute('aria-busy', 'true');
      btn.setAttribute('aria-label', 'Submitting, please wait');
    } else {
      btn.removeAttribute('aria-busy');
      btn.setAttribute(
        'aria-label',
        isLogin ? 'Sign in' : 'Create account',
      );
    }
  }, [activeMutation.isPending, isLogin]);

  async function onSubmit(values: LoginFormValues | RegisterFormValues) {
    try {
      const response = isLogin
        ? await loginMutation.mutateAsync({
            email: values.email,
            password: values.password,
          })
        : await registerMutation.mutateAsync({
            email: values.email,
            password: values.password,
          });
      router.replace(getRedirectPath(response.user));
    } catch {
      /* error surfaced via mutation state */
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        aria-labelledby="auth-form-title"
        noValidate
      >
        <HookFormField
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />

        {isLogin ? (
          <HookFormField
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
          />
        ) : (
          <HookFormPasswordField
            name="password"
            label="Password"
            placeholder="Create a strong password"
          />
        )}

        {!isLogin && (
          <HookFormField
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />
        )}

        {apiError && <ErrorMessage message={apiError} />}

        <button
          ref={submitRef}
          type="submit"
          disabled={activeMutation.isPending}
          aria-label="Sign in"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activeMutation.isPending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </FormProvider>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
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

        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2
              id="auth-form-title"
              className="text-xl font-semibold text-slate-900"
            >
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>

          <div
            className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
            role="group"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              title="Sign in"
              onClick={() => setMode('login')}
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
              onClick={() => setMode('register')}
              className={`rounded-lg py-2.5 text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          <AuthFormPanel key={mode} mode={mode} />
        </div>
      </div>
    </main>
  );
}
