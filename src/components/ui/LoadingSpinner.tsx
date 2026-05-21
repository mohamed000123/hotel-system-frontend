interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label = 'Loading…',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        aria-hidden="true"
      />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}
