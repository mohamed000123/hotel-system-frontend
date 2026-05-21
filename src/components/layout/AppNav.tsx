'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/api/types';

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/users', label: 'Admins', roles: ['SUPER_ADMIN'] },
  { href: '/staff/managers', label: 'Managers', roles: ['ADMIN'] },
  { href: '/hotels', label: 'Hotels', roles: ['SUPER_ADMIN', 'ADMIN', 'GUEST'] },
  { href: '/rooms', label: 'Rooms', roles: ['SUPER_ADMIN', 'ADMIN', 'HOTEL_MANAGER'] },
  { href: '/bookings/new', label: 'Book', roles: ['SUPER_ADMIN', 'ADMIN', 'HOTEL_MANAGER', 'GUEST'] },
  { href: '/dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'HOTEL_MANAGER'] },
];

function linkClass(active: boolean) {
  return active
    ? 'text-blue-600 font-medium'
    : 'text-gray-600 hover:text-gray-900';
}

export function AppNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role),
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <nav className="flex flex-wrap gap-4">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(pathname.startsWith(item.href))}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">
            {user.email}{' '}
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
              {user.role}
            </span>
          </span>
          <button
            type="button"
            onClick={logout}
            className="text-blue-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
