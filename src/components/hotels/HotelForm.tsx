'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { ApiClientError } from '@/lib/api/client';
import type { Hotel, HotelCreateDto } from '@/lib/api/types';
import { useCreateHotel, useUpdateHotel } from '@/lib/queries/use-hotels';
import {
  hotelCreateSchema,
  hotelUpdateSchema,
  type HotelCreateFormValues,
  type HotelUpdateFormValues,
} from '@/lib/validation/schemas';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormSelect } from '@/components/ui/HookFormSelect';

const fieldClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

interface HotelFormProps {
  hotel?: Hotel;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HotelForm({ hotel, onSuccess, onCancel }: HotelFormProps) {
  const isEdit = Boolean(hotel);
  const createMutation = useCreateHotel();
  const updateMutation = useUpdateHotel();

  const form = useForm<HotelCreateFormValues | HotelUpdateFormValues>({
    resolver: zodResolver(
      isEdit ? hotelUpdateSchema : hotelCreateSchema,
    ) as Resolver<HotelCreateFormValues | HotelUpdateFormValues>,
    defaultValues: isEdit
      ? {
          name: hotel?.name ?? '',
          city: hotel?.city ?? '',
          address: hotel?.address ?? '',
          stars: hotel?.stars ?? 3,
          status: hotel?.status ?? 'ACTIVE',
        }
      : {
          name: '',
          city: '',
          address: '',
          stars: 3,
          status: 'ACTIVE',
          timezone: 'UTC',
        },
    mode: 'onBlur',
  });

  const { reset } = form;

  useEffect(() => {
    if (hotel) {
      reset({
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        stars: hotel.stars,
        status: hotel.status,
      });
    }
  }, [hotel, reset]);

  const mutation = isEdit ? updateMutation : createMutation;
  const mutationError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? isEdit
          ? 'Failed to update hotel'
          : 'Failed to create hotel'
        : null;

  async function onSubmit(values: HotelCreateFormValues | HotelUpdateFormValues) {
    try {
      if (isEdit && hotel) {
        await updateMutation.mutateAsync({
          id: hotel.id,
          data: {
            name: values.name,
            city: values.city,
            address: values.address,
            stars: values.stars,
            status: values.status,
          },
        });
      } else {
        const createValues = values as HotelCreateFormValues;
        const payload: HotelCreateDto = {
          name: createValues.name,
          city: createValues.city,
          address: createValues.address,
          stars: createValues.stars,
          status: createValues.status,
          timezone: createValues.timezone?.trim() || 'UTC',
        };
        await createMutation.mutateAsync(payload);
        reset({
          name: '',
          city: '',
          address: '',
          stars: 3,
          status: 'ACTIVE',
          timezone: 'UTC',
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
        <HookFormField
          name="name"
          label="Name"
          required
          className={fieldClass}
        />
        <HookFormField
          name="city"
          label="City"
          required
          className={fieldClass}
        />
        <HookFormField
          name="address"
          label="Address"
          required
          className={fieldClass}
        />
        <HookFormField
          name="stars"
          label="Star rating (1–5)"
          type="number"
          required
          min={1}
          max={5}
          className={fieldClass}
        />
        <HookFormSelect
          name="status"
          label="Status"
          includePlaceholder={false}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
          className={fieldClass}
        />
        {!isEdit && (
          <HookFormField
            name="timezone"
            label="Timezone"
            placeholder="UTC"
            className={fieldClass}
          />
        )}
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
                : 'Create hotel'}
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
