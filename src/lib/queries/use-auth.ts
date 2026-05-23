'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import type { ChangePasswordDto, LoginDto, RegisterDto } from '../api/types';
import { queryKeys } from './query-keys';

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getMe,
    enabled,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => authApi.changePassword(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local auth state even if network request fails.
    }
    queryClient.setQueryData(queryKeys.auth.me(), null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.all });
  };
}
