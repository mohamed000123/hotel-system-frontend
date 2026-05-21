interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  title = 'Something went wrong',
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}
      role="alert"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
