'use client';

import { useAriaFieldState } from '@/lib/a11y/use-aria-field-state';
import { get, useFormContext } from 'react-hook-form';
import { useState } from 'react';

interface HookFormSelectOption {
  value: string;
  label: string;
}

interface HookFormSelectProps {
  name: string;
  label: string;
  options: HookFormSelectOption[];
  placeholder?: string;
  /** When false, no empty first option (required enum fields). Default true. */
  includePlaceholder?: boolean;
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export function HookFormSelect({
  name,
  label,
  options,
  placeholder = 'Select…',
  includePlaceholder = true,
  className = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2',
  disabled,
  onValueChange,
}: HookFormSelectProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name)?.message as string | undefined;
  const [selectEl, setSelectEl] = useState<HTMLSelectElement | null>(null);
  const { ref, ...registration } = register(name);

  useAriaFieldState(selectEl, {
    invalid: Boolean(error),
    describedById: error ? `${name}-error` : undefined,
  });

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        title={label}
        aria-label={label}
        disabled={disabled}
        className={`${className}${error ? ' border-red-500' : ''}`}
        ref={(node) => {
          setSelectEl(node);
          ref(node);
        }}
        {...registration}
        onChange={(e) => {
          registration.onChange(e);
          onValueChange?.(e.target.value);
        }}
      >
        {includePlaceholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
