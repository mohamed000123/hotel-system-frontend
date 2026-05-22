'use client';

import { get, useFormContext } from 'react-hook-form';
import { PasswordField } from './PasswordField';

type HookFormPasswordFieldProps = {
  name: string;
  label: string;
  hint?: string;
  className?: string;
  placeholder?: string;
  autoComplete?: string;
};

export function HookFormPasswordField({
  name,
  label,
  ...rest
}: HookFormPasswordFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name)?.message as string | undefined;

  return (
    <PasswordField
      id={name}
      label={label}
      error={error}
      {...register(name)}
      {...rest}
    />
  );
}
