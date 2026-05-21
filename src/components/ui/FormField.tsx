import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

/**
 * Accessible text field: explicit <label htmlFor>, title, aria-label, and placeholder
 * (satisfies Microsoft Edge Tools axe/forms rules).
 */
export function FormField({
  id,
  label,
  hint,
  className = '',
  placeholder,
  ...inputProps
}: FormFieldProps) {
  const inputClassName =
    className ||
    'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={inputProps.name ?? id}
        title={label}
        aria-label={label}
        placeholder={placeholder ?? label}
        className={inputClassName}
        {...inputProps}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
