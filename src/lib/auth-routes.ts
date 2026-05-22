import type { Role, User } from './api/types';

export const CHANGE_PASSWORD_PATH = '/account/change-password';

export function getRedirectPath(user: Pick<User, 'role' | 'mustChangePassword'>): string {
  if (user.mustChangePassword) {
    return CHANGE_PASSWORD_PATH;
  }

  switch (user.role) {
    case 'SUPER_ADMIN':
      return '/admin/users';
    case 'ADMIN':
      return '/hotels';
    case 'HOTEL_MANAGER':
      return '/rooms';
    case 'GUEST':
      return '/hotels';
    default:
      return '/login';
  }
}

export function roleHomePath(role: Role): string {
  return getRedirectPath({ role, mustChangePassword: false });
}
