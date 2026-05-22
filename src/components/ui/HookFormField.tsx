'use client';

import { get, useFormContext } from 'react-hook-form';
import { FormField, type FormFieldProps } from './FormField';

type HookFormFieldProps = Omit<FormFieldProps, 'id' | 'error'> & {
  name: string;
};

export function HookFormField({ name, label, type, ...rest }: HookFormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name)?.message as string | undefined;

  return (
    <FormField
      id={name}
      label={label}
      type={type}
      error={error}
      {...register(name, {
        valueAsNumber: type === 'number',
      })}
      {...rest}
    />
  );
}
