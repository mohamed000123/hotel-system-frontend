import { apiRequest } from './client';
import type { AuthResponse, LoginDto, RegisterDto, User } from './types';

export function register(data: RegisterDto) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export function login(data: LoginDto) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export function getMe() {
  return apiRequest<User>('/auth/me');
}
