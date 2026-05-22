'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { Hotel, HotelCreateDto, HotelStatus } from '@/lib/api/types';
import { useCreateHotel, useUpdateHotel } from '@/lib/queries/use-hotels';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { FormField } from '@/components/ui/FormField';

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

  const [name, setName] = useState(hotel?.name ?? '');
  const [city, setCity] = useState(hotel?.city ?? '');
  const [address, setAddress] = useState(hotel?.address ?? '');
  const [stars, setStars] = useState(String(hotel?.stars ?? 3));
  const [status, setStatus] = useState<HotelStatus>(hotel?.status ?? 'ACTIVE');
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setCity(hotel.city);
      setAddress(hotel.address);
      setStars(String(hotel.stars));
      setStatus(hotel.status);
    }
  }, [hotel]);

  const mutation = isEdit ? updateMutation : createMutation;
  const mutationError =
    mutation.error instanceof ApiClientError
      ? mutation.error.message
      : mutation.error
        ? isEdit
          ? 'Failed to update hotel'
          : 'Failed to create hotel'
        : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const starsNum = Number(stars);
    if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
      return;
    }

    try {
      if (isEdit && hotel) {
        await updateMutation.mutateAsync({
          id: hotel.id,
          data: {
            name,
            city,
            address,
            stars: starsNum,
            status,
          },
        });
      } else {
        const payload: HotelCreateDto = {
          name,
          city,
          address,
          stars: starsNum,
          status,
          timezone: timezone.trim() || 'UTC',
        };
        await createMutation.mutateAsync(payload);
        setName('');
        setCity('');
        setAddress('');
        setStars('3');
        setStatus('ACTIVE');
        setTimezone('UTC');
      }
      onSuccess?.();
    } catch {
      /* surfaced via mutation */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="hotel-name"
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={fieldClass}
      />
      <FormField
        id="hotel-city"
        label="City"
        required
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className={fieldClass}
      />
      <FormField
        id="hotel-address"
        label="Address"
        required
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className={fieldClass}
      />
      <FormField
        id="hotel-stars"
        label="Star rating (1–5)"
        type="number"
        required
        min={1}
        max={5}
        value={stars}
        onChange={(e) => setStars(e.target.value)}
        className={fieldClass}
      />
      <div>
        <label htmlFor="hotel-status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="hotel-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as HotelStatus)}
          className={fieldClass}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      {!isEdit && (
        <FormField
          id="hotel-timezone"
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
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
  );
}
