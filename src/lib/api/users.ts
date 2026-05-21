import { apiRequest } from './client';
import type { CreateUserDto, Role, UpdateUserDto, User } from './types';

export function listUsers(role?: 'ADMIN' | 'HOTEL_MANAGER') {
  const query = role ? `?role=${role}` : '';
  return apiRequest<User[]>(`/users${query}`);
}

export function createUser(data: CreateUserDto) {
  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUser(id: string, data: UpdateUserDto) {
  return apiRequest<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type { Role };
