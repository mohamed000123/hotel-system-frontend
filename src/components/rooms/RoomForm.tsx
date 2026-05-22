'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { Room, RoomCreateDto } from '@/lib/api/types';
import { useCreateRoom, useUpdateRoom } from '@/lib/queries/use-rooms';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

interface RoomFormProps {
  hotelId: string;
  room?: Room;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoomForm({ hotelId, room, onSuccess, onCancel }: RoomFormProps) {
  const isEdit = Boolean(room);
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();

  const [roomType, setRoomType] = useState(room?.roomType ?? '');
  const [capacity, setCapacity] = useState(String(room?.capacity ?? 2));
  const [pricePerNight, setPricePerNight] = useState(
    room ? String(room.pricePerNight) : '',
  );
  const [isAvailable, setIsAvailable] = useState(room?.isAvailable ?? true);

  useEffect(() => {
    if (room) {
      setRoomType(room.roomType);
      setCapacity(String(room.capacity));
      setPricePerNight(String(room.pricePerNight));
      setIsAvailable(room.isAvailable);
    }
  }, [room]);

  const mutation = isEdit ? updateMutation : createMutation;
  const mutationError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? isEdit
          ? 'Failed to update room'
          : 'Failed to create room'
        : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const capacityNum = Number(capacity);
    const priceNum = Number(pricePerNight);
    if (
      !Number.isInteger(capacityNum) ||
      capacityNum < 1 ||
      Number.isNaN(priceNum) ||
      priceNum < 0
    ) {
      return;
    }

    try {
      if (isEdit && room) {
        await updateMutation.mutateAsync({
          id: room.id,
          hotelId,
          data: {
            roomType,
            capacity: capacityNum,
            pricePerNight: priceNum,
            isAvailable,
          },
        });
      } else {
        const payload: RoomCreateDto = {
          roomType,
          capacity: capacityNum,
          pricePerNight: priceNum,
          isAvailable,
        };
        await createMutation.mutateAsync({ hotelId, data: payload });
        setRoomType('');
        setCapacity('2');
        setPricePerNight('');
        setIsAvailable(true);
      }
      onSuccess?.();
    } catch {
      /* surfaced via mutation */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="room-type"
        label="Room type"
        required
        value={roomType}
        onChange={(e) => setRoomType(e.target.value)}
        placeholder="e.g. Standard, Deluxe"
        className={fieldClass}
      />
      <FormField
        id="room-capacity"
        label="Capacity (guests)"
        type="number"
        required
        min={1}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className={fieldClass}
      />
      <FormField
        id="room-price"
        label="Price per night"
        type="number"
        required
        min={0}
        step="0.01"
        value={pricePerNight}
        onChange={(e) => setPricePerNight(e.target.value)}
        className={fieldClass}
      />
      <div className="flex items-center gap-2">
        <input
          id="room-available"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="room-available" className="text-sm font-medium text-gray-700">
          Available for booking
        </label>
      </div>
      {mutationError && <ErrorMessage message={mutationError} />}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save changes'
              : 'Add room'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
