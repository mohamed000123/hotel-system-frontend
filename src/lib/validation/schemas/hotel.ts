import { z } from 'zod';
import { HOTEL_STARS_MAX, HOTEL_STARS_MIN } from '../limits';
import { trimmedRequiredString } from './common';

const hotelStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const hotelCreateSchema = z.object({
  name: trimmedRequiredString('Name'),
  city: trimmedRequiredString('City'),
  address: trimmedRequiredString('Address'),
  stars: z
    .number()
    .int('Star rating must be a whole number')
    .min(HOTEL_STARS_MIN, `Rating must be at least ${HOTEL_STARS_MIN}`)
    .max(HOTEL_STARS_MAX, `Rating cannot exceed ${HOTEL_STARS_MAX}`),
  status: hotelStatusSchema,
  timezone: z.string().trim().min(1, 'Timezone is required').default('UTC'),
});

export type HotelCreateFormValues = z.infer<typeof hotelCreateSchema>;

export const hotelUpdateSchema = z.object({
  name: trimmedRequiredString('Name'),
  city: trimmedRequiredString('City'),
  address: trimmedRequiredString('Address'),
  stars: z
    .number()
    .int('Star rating must be a whole number')
    .min(HOTEL_STARS_MIN, `Rating must be at least ${HOTEL_STARS_MIN}`)
    .max(HOTEL_STARS_MAX, `Rating cannot exceed ${HOTEL_STARS_MAX}`),
  status: hotelStatusSchema,
});

export type HotelUpdateFormValues = z.infer<typeof hotelUpdateSchema>;
