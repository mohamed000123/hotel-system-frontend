/** Shared API types aligned with specs/001-hotel-booking-system/contracts/openapi.yaml */

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
  createdAt?: string;
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

export interface HotelList {
  data: Hotel[];
  page: number;
  limit: number;
  total: number;
}

export interface Room {
  id: string;
  hotelId: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
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
}

export interface BookingQuote {
  nights: number;
  totalAmount: number;
}

export interface DashboardStats {
  totalHotels: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenueTotal: number;
}
