import { z } from 'zod';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_PATTERN,
} from '../password';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required');

export const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .regex(STRONG_PASSWORD_PATTERN, STRONG_PASSWORD_MESSAGE);

export const uuidSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .uuid('Enter a valid ID');

export const trimmedRequiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

export function passwordsMatchRefine<T extends { password: string; confirmPassword: string }>(
  data: T,
) {
  return data.password === data.confirmPassword;
}

export const passwordsMatchMessage = 'Passwords do not match';
