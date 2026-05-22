'use client';

import { useMemo, useState } from 'react';
import { BookingViewRow } from '@/components/bookings/BookingViewRow';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import type { BookingStatus, ListBookingsParams } from '@/lib/api/types';
import { useBookings } from '@/lib/queries/use-bookings';
import { useRooms } from '@/lib/queries/use-rooms';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';

export default function ReservationsPage() {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? '';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | BookingStatus>('');

  const listParams = useMemo((): ListBookingsParams => {
    const params: ListBookingsParams = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [page, statusFilter]);

  const { data, isPending, isError, error } = useBookings(listParams);
  const { data: roomsData } = useRooms(hotelId, { page: 1, limit: 200 });

  const roomLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const room of roomsData?.data ?? []) {
      map.set(room.id, room.roomType);
    }
    return map;
  }, [roomsData?.data]);

  const bookings = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  if (!hotelId) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Reservations</h1>
        <ErrorMessage
          className="mt-4"
          message="Your account is not assigned to a hotel. Contact an administrator."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Reservations</h1>
      <p className="mt-1 text-sm text-gray-600">
        All reservations for your hotel. Read-only — guests manage payment and
        cancellation.
      </p>

      <section className="mt-6">
        <label
          htmlFor="reservation-status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="reservation-status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as '' | BookingStatus);
            setPage(1);
          }}
          className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </section>

      <section className="mt-8">
        {isPending && <LoadingSpinner label="Loading reservations…" />}
        {isError && (
          <ErrorMessage
            className="mt-4"
            message={
              error instanceof ApiClientError
                ? error.message
                : 'Failed to load reservations'
            }
          />
        )}
        {!isPending && !isError && bookings.length === 0 && (
          <p className="text-sm text-gray-500">No reservations found.</p>
        )}
        {bookings.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {bookings.map((b) => (
              <BookingViewRow
                key={b.id}
                booking={b}
                roomLabel={roomLabels.get(b.roomId)}
              />
            ))}
          </ul>
        )}
        {data && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={data.total}
            limit={data.limit}
            itemLabel="reservations"
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
