import { apiRequest } from './client';
import { buildListQuery } from './query-params';
import type {
  Booking,
  BookingCreateDto,
  BookingList,
  BookingQuote,
  ListBookingsParams,
} from './types';

export function quoteBooking(data: BookingCreateDto) {
  return apiRequest<BookingQuote>('/bookings/quote', {
    method: 'POST',
    body: data,
  });
}

export function createBooking(data: BookingCreateDto) {
  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    body: data,
  });
}

export function listBookings(params?: ListBookingsParams) {
  return apiRequest<BookingList>(`/bookings${buildListQuery(params)}`);
}

export function cancelBooking(id: string) {
  return apiRequest<Booking>(`/bookings/${id}/cancel`, {
    method: 'POST',
  });
}
