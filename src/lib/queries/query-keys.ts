export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (role?: string) => [...queryKeys.users.all, 'list', role ?? 'all'] as const,
  },
  hotels: {
    all: ['hotels'] as const,
    lists: () => [...queryKeys.hotels.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.hotels.lists(), params] as const,
    details: () => [...queryKeys.hotels.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.hotels.details(), id] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    byHotel: (hotelId: string) => [...queryKeys.rooms.all, hotelId] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.bookings.lists(), params ?? {}] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },
};
