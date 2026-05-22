import type { Booking } from '@/lib/api/types';
import {
  bookingStatusClass,
  bookingStatusLabel,
  canShowGuestCancelButton,
  formatBookingMoney,
} from './booking-display';

interface GuestBookingRowProps {
  booking: Booking;
  onPay: (id: string) => void;
  onCancel: (id: string) => void;
  payPending: boolean;
  cancelPending: boolean;
}

export function GuestBookingRow({
  booking,
  onPay,
  onCancel,
  payPending,
  cancelPending,
}: GuestBookingRowProps) {
  const canCancel = canShowGuestCancelButton(booking);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="font-medium">
          {booking.checkIn} → {booking.checkOut} · {booking.nights} night
          {booking.nights !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-600">
          {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''} ·{' '}
          {formatBookingMoney(booking.totalAmount)} ·{' '}
          <span className={bookingStatusClass(booking.status)}>
            {bookingStatusLabel(booking.status)}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {booking.status === 'PENDING' && (
          <>
            <button
              type="button"
              onClick={() => onPay(booking.id)}
              disabled={payPending}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              {payPending ? 'Paying…' : 'Pay (simulate)'}
            </button>
            {canCancel ? (
              <button
                type="button"
                onClick={() => onCancel(booking.id)}
                disabled={cancelPending}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            ) : (
              <span className="text-xs text-gray-500">
                Cancel unavailable (less than 24h before check-in)
              </span>
            )}
          </>
        )}
        {booking.status === 'CONFIRMED' &&
          (canCancel ? (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              disabled={cancelPending}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          ) : (
            <span className="text-xs text-gray-500">
              Cancel unavailable (less than 24h before check-in)
            </span>
          ))}
      </div>
    </li>
  );
}
