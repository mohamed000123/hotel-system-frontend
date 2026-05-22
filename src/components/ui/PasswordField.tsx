import { forwardRef, type InputHTMLAttributes } from 'react';
import { FormField } from './FormField';
import { STRONG_PASSWORD_MESSAGE } from '@/lib/validation/password';

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ id, label, hint, error, className, ...inputProps }, ref) {
    return (
      <FormField
        ref={ref}
        id={id}
        label={label}
        type="password"
        autoComplete="new-password"
        hint={hint ?? STRONG_PASSWORD_MESSAGE}
        error={error}
        className={className}
        {...inputProps}
      />
    );
  },
);
