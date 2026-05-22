'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { GuestBookingRow } from '@/components/bookings/GuestBookingRow';
import { ApiClientError } from '@/lib/api/client';
import type { BookingStatus, ListBookingsParams } from '@/lib/api/types';
import {
  useBookings,
  useCancelBooking,
  usePayBooking,
} from '@/lib/queries/use-bookings';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';

function mutationError(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

export default function MyBookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | BookingStatus>('');

  const listParams = useMemo((): ListBookingsParams => {
    const params: ListBookingsParams = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [page, statusFilter]);

  const { data, isPending, isError, error } = useBookings(listParams);
  const payMutation = usePayBooking();
  const cancelMutation = useCancelBooking();

  const bookings = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  async function handlePay(id: string) {
    try {
      await payMutation.mutateAsync(id);
    } catch {
      /* surfaced below */
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelMutation.mutateAsync(id);
    } catch {
      /* surfaced below */
    }
  }

  const actionError =
    payMutation.error || cancelMutation.error
      ? mutationError(
          payMutation.error ?? cancelMutation.error,
          'Action failed',
        )
      : null;

  return (
    <div>
      <h1 className="text-2xl font-bold">My reservations</h1>
      <p className="mt-1 text-sm text-gray-600">
        View your bookings, pay pending reservations, or cancel at least 24 hours
        before check-in (hotel local time).
      </p>

      <section className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="booking-status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="booking-status"
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
        </div>
        <Link
          href="/bookings/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Book a room
        </Link>
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
          <p className="text-sm text-gray-500">
            No reservations found.{' '}
            <Link href="/bookings/new" className="text-blue-600 hover:underline">
              Book a room
            </Link>
            .
          </p>
        )}
        {bookings.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {bookings.map((b) => (
              <GuestBookingRow
                key={b.id}
                booking={b}
                onPay={handlePay}
                onCancel={handleCancel}
                payPending={payMutation.isPending}
                cancelPending={cancelMutation.isPending}
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
        {actionError && <ErrorMessage className="mt-4" message={actionError} />}
      </section>
    </div>
  );
}
