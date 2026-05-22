/**
 * Strong password rules for registration and staff account creation.
 * Keep in sync with backend/src/common/password-policy.ts
 */
export const STRONG_PASSWORD_MIN_LENGTH = 8;

export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.';

export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isStrongPassword(password: string): boolean {
  return STRONG_PASSWORD_PATTERN.test(password);
}

/** Returns the validation error message, or null if the password is valid. */
export function validateNewPassword(password: string): string | null {
  if (!password.trim()) {
    return 'Password is required';
  }
  if (!isStrongPassword(password)) {
    return STRONG_PASSWORD_MESSAGE;
  }
  return null;
}
