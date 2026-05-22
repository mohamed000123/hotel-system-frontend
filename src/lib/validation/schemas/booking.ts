import { z } from 'zod';
import { ROOM_CAPACITY_MAX, ROOM_CAPACITY_MIN } from '../limits';
const dateStringSchema = z
  .string()
  .min(1, 'Date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date');

const hotelIdSchema = z.string().min(1, 'Select a hotel').uuid('Select a hotel');
const roomIdSchema = z.string().min(1, 'Select a room').uuid('Select a room');

export function createBookingSchema(maxGuestCount = ROOM_CAPACITY_MAX) {
  return z
    .object({
      hotelId: hotelIdSchema,
      roomId: roomIdSchema,
      checkIn: dateStringSchema,
      checkOut: dateStringSchema,
      guestCount: z
        .number()
        .int('Guest count must be a whole number')
        .min(ROOM_CAPACITY_MIN, `At least ${ROOM_CAPACITY_MIN} guest`)
        .max(
          maxGuestCount,
          `Guest count cannot exceed ${maxGuestCount}`,
        ),
    })
    .refine((data) => data.checkOut > data.checkIn, {
      message: 'Check-out must be after check-in',
      path: ['checkOut'],
    });
}

export type BookingFormValues = z.output<ReturnType<typeof createBookingSchema>>;
