import { FormField } from './FormField';
import type { InputHTMLAttributes } from 'react';
import { STRONG_PASSWORD_MESSAGE } from '@/lib/validation/password';

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export function PasswordField({
  id,
  label,
  className,
  ...inputProps
}: PasswordFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      type="password"
      autoComplete="new-password"
      hint={STRONG_PASSWORD_MESSAGE}
      className={className}
      {...inputProps}
    />
  );
}
