import { apiRequest } from './client';
import { buildListQuery } from './query-params';
import type {
  CreateUserDto,
  ListUsersParams,
  Role,
  UpdateUserDto,
  User,
  UserList,
} from './types';

export function listUsers(params?: ListUsersParams) {
  return apiRequest<UserList>(`/users${buildListQuery(params)}`);
}

export function createUser(data: CreateUserDto) {
  return apiRequest<User>('/users', {
    method: 'POST',
    body: data,
  });
}

export function updateUser(id: string, data: UpdateUserDto) {
  return apiRequest<User>(`/users/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export type { Role };
