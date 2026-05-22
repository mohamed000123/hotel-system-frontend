'use client';

import { ApiClientError } from '@/lib/api/client';
import type { Hotel, HotelStatus } from '@/lib/api/types';
import { useUpdateHotel } from '@/lib/queries/use-hotels';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function statusBadge(status: HotelStatus) {
  return status === 'ACTIVE' ? (
    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
      Active
    </span>
  ) : (
    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
      Inactive
    </span>
  );
}

interface HotelStatusControlProps {
  hotel: Pick<Hotel, 'id' | 'status' | 'name'>;
  /** When false, only the status badge is shown. */
  canToggle?: boolean;
  errorClassName?: string;
}

export function HotelStatusControl({
  hotel,
  canToggle = false,
  errorClassName,
}: HotelStatusControlProps) {
  const updateMutation = useUpdateHotel();

  const nextStatus: HotelStatus =
    hotel.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  const toggleLabel =
    hotel.status === 'ACTIVE' ? 'Mark inactive' : 'Mark active';

  async function handleToggle() {
    const action =
      hotel.status === 'ACTIVE' ? 'deactivate' : 'activate';
    if (
      !confirm(
        `${action === 'deactivate' ? 'Deactivate' : 'Activate'} "${hotel.name}"? ${
          action === 'deactivate'
            ? 'Guests will no longer see it for booking.'
            : 'It will appear in the catalog again.'
        }`,
      )
    ) {
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: hotel.id,
        data: { status: nextStatus },
      });
    } catch {
      /* surfaced below */
    }
  }

  const toggleError =
    updateMutation.error instanceof ApiClientError
      ? updateMutation.error.message
      : updateMutation.error
        ? 'Failed to update hotel status'
        : null;

  return (
    <div className={canToggle ? 'flex flex-col items-end gap-1' : undefined}>
      <div className="flex items-center gap-3">
        {statusBadge(hotel.status)}
        {canToggle && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={updateMutation.isPending}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating…' : toggleLabel}
          </button>
        )}
      </div>
      {toggleError && (
        <ErrorMessage className={errorClassName} message={toggleError} />
      )}
    </div>
  );
}
