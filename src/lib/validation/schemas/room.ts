import { z } from 'zod';
import { ROOM_TYPE_OPTIONS } from '@/lib/constants/room-types';
import {
  ROOM_CAPACITY_MAX,
  ROOM_CAPACITY_MIN,
  ROOM_PRICE_MAX,
  ROOM_PRICE_MIN,
} from '../limits';

const roomTypeSchema = z.enum(
  ROOM_TYPE_OPTIONS as unknown as [string, ...string[]],
  { message: 'Select a room type' },
);

export const roomFormSchema = z.object({
  roomType: roomTypeSchema,
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .min(ROOM_CAPACITY_MIN, `Capacity must be between ${ROOM_CAPACITY_MIN} and ${ROOM_CAPACITY_MAX}`)
    .max(ROOM_CAPACITY_MAX, `Capacity must be between ${ROOM_CAPACITY_MIN} and ${ROOM_CAPACITY_MAX}`),
  pricePerNight: z
    .number()
    .refine((n) => Number.isFinite(n), 'Price per night is required')
    .min(ROOM_PRICE_MIN, `Price per night must be between ${ROOM_PRICE_MIN} and ${ROOM_PRICE_MAX}`)
    .max(ROOM_PRICE_MAX, `Price per night must be between ${ROOM_PRICE_MIN} and ${ROOM_PRICE_MAX}`),
  isAvailable: z.boolean(),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;
