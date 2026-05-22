'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { setStoredToken } from '../api/client';
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
      setStoredToken(response.accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (response) => {
      setStoredToken(response.accessToken);
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
  return () => {
    setStoredToken(null);
    queryClient.setQueryData(queryKeys.auth.me(), null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.all });
  };
}
