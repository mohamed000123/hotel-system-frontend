'use client';

import { useAriaFieldState } from '@/lib/a11y/use-aria-field-state';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

/**
 * Accessible text field: explicit <label htmlFor>, title, aria-label, and placeholder
 * (satisfies Microsoft Edge Tools axe/forms rules).
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    {
      id,
      label,
      hint,
      error,
      className = '',
      placeholder,
      'aria-invalid': ariaInvalidProp,
      'aria-describedby': ariaDescribedByProp,
      ...inputProps
    },
    forwardedRef,
  ) {
    const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);
    const hasError = Boolean(error);
    const invalid =
      ariaInvalidProp === true ||
      ariaInvalidProp === 'true' ||
      (ariaInvalidProp == null && hasError);
    const describedById =
      ariaDescribedByProp ??
      (hasError ? `${id}-error` : hint ? `${id}-hint` : undefined);

    useAriaFieldState(inputEl, { invalid, describedById });

    const inputClassName =
      className ||
      'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

    function setRef(node: HTMLInputElement | null) {
      setInputEl(node);
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    }

    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          ref={setRef}
          id={id}
          name={inputProps.name ?? id}
          title={label}
          aria-label={label}
          placeholder={placeholder ?? label}
          className={`${inputClassName}${hasError ? ' border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          {...inputProps}
        />
        {hint && !error && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
