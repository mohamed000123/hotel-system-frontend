import type { Role } from './api/types';

export function getRedirectPath(role: Role): string {
  switch (role) {
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
