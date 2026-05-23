'use client';

import { ApiClientError } from '@/lib/api/client';
import type { Hotel, HotelStatus } from '@/lib/api/types';
import { useUpdateHotel } from '@/lib/queries/use-hotels';
import { useToast } from '@/context/ToastContext';

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
}

export function HotelStatusControl({
  hotel,
  canToggle = false,
}: HotelStatusControlProps) {
  const updateMutation = useUpdateHotel();
  const { confirm, showToast } = useToast();

  const nextStatus: HotelStatus =
    hotel.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  const toggleLabel =
    hotel.status === 'ACTIVE' ? 'Mark inactive' : 'Mark active';

  async function handleToggle() {
    const action =
      hotel.status === 'ACTIVE' ? 'deactivate' : 'activate';
    const approved = await confirm({
      title: `${action === 'deactivate' ? 'Deactivate' : 'Activate'} "${hotel.name}"?`,
      description:
        action === 'deactivate'
          ? 'Guests will no longer see it for booking.'
          : 'It will appear in the catalog again.',
      confirmLabel: action === 'deactivate' ? 'Deactivate' : 'Activate',
      cancelLabel: 'Cancel',
    });
    if (!approved) {
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: hotel.id,
        data: { status: nextStatus },
      });
      showToast({
        title: `Hotel ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`,
        description: `"${hotel.name}" is now ${nextStatus.toLowerCase()}.`,
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Failed to update hotel status',
        description:
          error instanceof ApiClientError ? error.message : 'Please try again.',
        variant: 'error',
      });
    }
  }

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
    </div>
  );
}
