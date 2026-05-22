import { apiRequest } from './client';
import { buildListQuery } from './query-params';
import type {
  PaginationParams,
  Room,
  RoomCreateDto,
  RoomList,
  RoomUpdateDto,
} from './types';

export function listRooms(hotelId: string, params?: PaginationParams) {
  return apiRequest<RoomList>(
    `/hotels/${hotelId}/rooms${buildListQuery(params)}`,
  );
}

export function createRoom(hotelId: string, data: RoomCreateDto) {
  return apiRequest<Room>(`/hotels/${hotelId}/rooms`, {
    method: 'POST',
    body: data,
  });
}

export function updateRoom(id: string, data: RoomUpdateDto) {
  return apiRequest<Room>(`/rooms/${id}`, {
    method: 'PATCH',
    body: data,
  });
}
