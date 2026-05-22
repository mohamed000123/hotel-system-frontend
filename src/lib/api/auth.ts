import { apiRequest } from './client';
import type {
  AuthResponse,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  User,
} from './types';

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

export function changePassword(data: ChangePasswordDto) {
  return apiRequest<User>('/auth/change-password', {
    method: 'POST',
    body: data,
  });
}
