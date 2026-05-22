interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  itemLabel,
  onPageChange,
}: PaginationControlsProps) {
  if (total <= limit) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center gap-4 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="text-blue-600 hover:underline disabled:text-gray-400"
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {page} of {totalPages} ({total} {itemLabel})
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="text-blue-600 hover:underline disabled:text-gray-400"
      >
        Next
      </button>
    </div>
  );
}
