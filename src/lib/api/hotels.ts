import { apiRequest } from './client';
import { buildListQuery } from './query-params';
import type {
  Hotel,
  HotelCreateDto,
  HotelList,
  HotelUpdateDto,
  ListHotelsParams,
} from './types';

export function listHotels(params?: ListHotelsParams) {
  return apiRequest<HotelList>(`/hotels${buildListQuery(params)}`);
}

export function getHotel(id: string) {
  return apiRequest<Hotel>(`/hotels/${id}`);
}

export function createHotel(data: HotelCreateDto) {
  return apiRequest<Hotel>('/hotels', {
    method: 'POST',
    body: data,
  });
}

export function updateHotel(id: string, data: HotelUpdateDto) {
  return apiRequest<Hotel>(`/hotels/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export function deleteHotel(id: string) {
  return apiRequest<void>(`/hotels/${id}`, { method: 'DELETE' });
}
