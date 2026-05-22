import { apiRequest } from './client';
import type { Payment } from './types';

export function payBooking(bookingId: string) {
  return apiRequest<Payment>(`/bookings/${bookingId}/pay`, {
    method: 'POST',
  });
}
