/** Shared API types aligned with specs/001-hotel-booking-system/contracts/openapi.yaml */

import type { RoomTypeLabel } from '@/lib/constants/room-types';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'HOTEL_MANAGER' | 'GUEST';
export type HotelStatus = 'ACTIVE' | 'INACTIVE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type StaffRole = 'ADMIN' | 'HOTEL_MANAGER';

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  hotelId?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedList<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface UserList extends PaginatedList<User> {}

export interface ListUsersParams extends PaginationParams {
  role?: StaffRole;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: StaffRole;
  hotelId?: string;
}

export interface UpdateUserDto {
  role?: StaffRole;
  hotelId?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number;
  status: HotelStatus;
  availableRoomCount?: number;
}

export interface HotelList extends PaginatedList<Hotel> {}

export interface HotelCreateDto {
  name: string;
  city: string;
  address: string;
  stars: number;
  status: HotelStatus;
  timezone?: string;
}

export interface HotelUpdateDto {
  name?: string;
  city?: string;
  address?: string;
  stars?: number;
  status?: HotelStatus;
  timezone?: string;
}

export interface ListHotelsParams extends PaginationParams {
  q?: string;
  status?: HotelStatus;
}

export interface Room {
  id: string;
  hotelId: string;
  roomType: RoomTypeLabel;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
}

export interface RoomList extends PaginatedList<Room> {}

export interface RoomCreateDto {
  roomType: RoomTypeLabel;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
}

export interface RoomUpdateDto {
  roomType?: RoomTypeLabel;
  capacity?: number;
  pricePerNight?: number;
  isAvailable?: boolean;
}

export interface ListRoomsParams extends PaginationParams {
  checkIn?: string;
  checkOut?: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  nights: number;
  totalAmount: number;
  status: BookingStatus;
  /** Guest list: cancel allowed only ≥24h before check-in (hotel timezone). */
  cancellable?: boolean;
}

export interface BookingList extends PaginatedList<Booking> {}

export interface ListBookingsParams extends PaginationParams {
  status?: BookingStatus;
  hotelId?: string;
}

export interface BookingCreateDto {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export interface BookingQuote {
  nights: number;
  totalAmount: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'COMPLETED';
  completedAt: string;
}

export interface DashboardStats {
  totalHotels: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenueTotal: number;
}
