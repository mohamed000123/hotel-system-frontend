import type { Booking } from '@/lib/api/types';

export function formatBookingMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function bookingStatusLabel(status: Booking['status']) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export function canShowGuestCancelButton(booking: Booking): boolean {
  if (booking.cancellable !== undefined) {
    return booking.cancellable;
  }
  const checkInMs = new Date(`${booking.checkIn}T00:00:00.000Z`).getTime();
  const msUntilCheckIn = checkInMs - Date.now();
  return (
    msUntilCheckIn >= 24 * 60 * 60 * 1000 &&
    (booking.status === 'PENDING' || booking.status === 'CONFIRMED')
  );
}

export function bookingStatusClass(status: Booking['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'text-green-700';
    case 'PENDING':
      return 'text-amber-700';
    default:
      return 'text-gray-500';
  }
}
