'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ApiClientError } from '@/lib/api/client';
import type { Room, RoomCreateDto } from '@/lib/api/types';
import {
  ROOM_TYPE_OPTIONS,
  type RoomTypeLabel,
} from '@/lib/constants/room-types';
import { useCreateRoom, useUpdateRoom } from '@/lib/queries/use-rooms';
import {
  ROOM_CAPACITY_MAX,
  ROOM_CAPACITY_MIN,
  ROOM_PRICE_MAX,
  ROOM_PRICE_MIN,
} from '@/lib/validation/limits';
import { roomFormSchema, type RoomFormValues } from '@/lib/validation/schemas';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormSelect } from '@/components/ui/HookFormSelect';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const ROOM_TYPE_SELECT_OPTIONS = ROOM_TYPE_OPTIONS.map((type) => ({
  value: type,
  label: type,
}));

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

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomType: room?.roomType ?? ROOM_TYPE_OPTIONS[0],
      capacity: room?.capacity ?? 2,
      pricePerNight: room ? Number(room.pricePerNight) : (undefined as unknown as number),
      isAvailable: room?.isAvailable ?? true,
    },
    mode: 'onBlur',
  });

  const { register, reset } = form;

  useEffect(() => {
    if (room) {
      reset({
        roomType: room.roomType,
        capacity: room.capacity,
        pricePerNight: Number(room.pricePerNight),
        isAvailable: room.isAvailable,
      });
    }
  }, [room, reset]);

  const mutation = isEdit ? updateMutation : createMutation;
  const mutationError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? isEdit
          ? 'Failed to update room'
          : 'Failed to create room'
        : null;

  async function onSubmit(values: RoomFormValues) {
    try {
      if (isEdit && room) {
        await updateMutation.mutateAsync({
          id: room.id,
          hotelId,
          data: {
            roomType: values.roomType as RoomTypeLabel,
            capacity: values.capacity,
            pricePerNight: values.pricePerNight,
            isAvailable: values.isAvailable,
          },
        });
      } else {
        const payload: RoomCreateDto = {
          roomType: values.roomType as RoomTypeLabel,
          capacity: values.capacity,
          pricePerNight: values.pricePerNight,
          isAvailable: values.isAvailable,
        };
        await createMutation.mutateAsync({ hotelId, data: payload });
        reset({
          roomType: ROOM_TYPE_OPTIONS[0],
          capacity: 2,
          pricePerNight: undefined!,
          isAvailable: true,
        });
      }
      onSuccess?.();
    } catch {
      /* surfaced via mutation */
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <HookFormSelect
          name="roomType"
          label="Room type"
          options={ROOM_TYPE_SELECT_OPTIONS}
          includePlaceholder={false}
          className={fieldClass}
        />
        <HookFormField
          name="capacity"
          label="Capacity (guests)"
          type="number"
          required
          min={ROOM_CAPACITY_MIN}
          max={ROOM_CAPACITY_MAX}
          hint={`Between ${ROOM_CAPACITY_MIN} and ${ROOM_CAPACITY_MAX} guests`}
          className={fieldClass}
        />
        <HookFormField
          name="pricePerNight"
          label="Price per night"
          type="number"
          required
          min={ROOM_PRICE_MIN}
          max={ROOM_PRICE_MAX}
          step="0.01"
          hint={`Between $${ROOM_PRICE_MIN} and $${ROOM_PRICE_MAX}`}
          className={fieldClass}
        />
        <div className="flex items-center gap-2">
          <input
            id="isAvailable"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            {...register('isAvailable')}
          />
          <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
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
    </FormProvider>
  );
}
