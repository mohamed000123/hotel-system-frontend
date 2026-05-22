import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as roomsApi from '../api/rooms';
import type {
  ListRoomsParams,
  RoomCreateDto,
  RoomUpdateDto,
} from '../api/types';
import { queryKeys } from './query-keys';

export function useRooms(hotelId: string, params?: ListRoomsParams) {
  const hasDateRange = Boolean(params?.checkIn && params?.checkOut);
  return useQuery({
    queryKey: [
      ...queryKeys.rooms.byHotel(hotelId),
      params ?? {},
    ] as const,
    queryFn: () => roomsApi.listRooms(hotelId, params),
    enabled:
      Boolean(hotelId) &&
      ((!params?.checkIn && !params?.checkOut) || hasDateRange),
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hotelId,
      data,
    }: {
      hotelId: string;
      data: RoomCreateDto;
    }) => roomsApi.createRoom(hotelId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.byHotel(variables.hotelId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      hotelId,
      data,
    }: {
      id: string;
      hotelId: string;
      data: RoomUpdateDto;
    }) => roomsApi.updateRoom(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.byHotel(variables.hotelId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
    },
  });
}
