import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/users';
import type { CreateUserDto, UpdateUserDto } from '../api/types';
import { queryKeys } from './query-keys';

export function useUsersList(role?: 'ADMIN' | 'HOTEL_MANAGER') {
  return useQuery({
    queryKey: queryKeys.users.list(role),
    queryFn: () => usersApi.listUsers(role),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
