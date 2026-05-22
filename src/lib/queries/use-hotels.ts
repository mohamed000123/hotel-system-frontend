import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as hotelsApi from '../api/hotels';
import type { HotelCreateDto, HotelUpdateDto, ListHotelsParams } from '../api/types';
import { queryKeys } from './query-keys';

export function useHotels(params?: ListHotelsParams) {
  return useQuery({
    queryKey: queryKeys.hotels.list((params ?? {}) as Record<string, unknown>),
    queryFn: () => hotelsApi.listHotels(params),
  });
}

export function useHotel(id: string) {
  return useQuery({
    queryKey: queryKeys.hotels.detail(id),
    queryFn: () => hotelsApi.getHotel(id),
    enabled: Boolean(id),
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HotelCreateDto) => hotelsApi.createHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HotelUpdateDto }) =>
      hotelsApi.updateHotel(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hotels.detail(variables.id),
      });
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hotelsApi.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
    },
  });
}
