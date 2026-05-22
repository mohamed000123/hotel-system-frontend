import type { Booking } from '@/lib/api/types';
import {
  bookingStatusClass,
  bookingStatusLabel,
  formatBookingMoney,
} from './booking-display';

interface BookingViewRowProps {
  booking: Booking;
  roomLabel?: string;
}

export function BookingViewRow({ booking, roomLabel }: BookingViewRowProps) {
  return (
    <li className="px-4 py-3">
      <p className="font-medium">
        {booking.checkIn} → {booking.checkOut} · {booking.nights} night
        {booking.nights !== 1 ? 's' : ''}
      </p>
      <p className="text-sm text-gray-600">
        {roomLabel ? `${roomLabel} · ` : ''}
        {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''} ·{' '}
        {formatBookingMoney(booking.totalAmount)} ·{' '}
        <span className={bookingStatusClass(booking.status)}>
          {bookingStatusLabel(booking.status)}
        </span>
      </p>
    </li>
  );
}
