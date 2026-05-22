import { z } from 'zod';
import {
  emailSchema,
  loginPasswordSchema,
  passwordsMatchMessage,
  passwordsMatchRefine,
  strongPasswordSchema,
} from './common';

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(passwordsMatchRefine, {
    message: passwordsMatchMessage,
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Temporary password is required'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: passwordsMatchMessage,
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
