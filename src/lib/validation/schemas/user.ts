import { z } from 'zod';
import { emailSchema, strongPasswordSchema, uuidSchema } from './common';

export const createAdminSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

export const createManagerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  hotelId: uuidSchema,
});

export type CreateManagerFormValues = z.infer<typeof createManagerSchema>;
