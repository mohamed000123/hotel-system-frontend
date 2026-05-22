import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as bookingsApi from '../api/bookings';
import * as paymentsApi from '../api/payments';
import type { BookingCreateDto, ListBookingsParams } from '../api/types';
import { queryKeys } from './query-keys';

export function useBookings(params?: ListBookingsParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params as Record<string, unknown>),
    queryFn: () => bookingsApi.listBookings(params),
  });
}

export function useQuoteBooking() {
  return useMutation({
    mutationFn: (data: BookingCreateDto) => bookingsApi.quoteBooking(data),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookingCreateDto) => bookingsApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function usePayBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => paymentsApi.payBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
