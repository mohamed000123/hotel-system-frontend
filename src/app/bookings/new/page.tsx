'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form';
import { useToast } from '@/context/ToastContext';
import { ApiClientError } from '@/lib/api/client';
import { useHotels } from '@/lib/queries/use-hotels';
import { useCreateBooking, useQuoteBooking } from '@/lib/queries/use-bookings';
import { useRooms } from '@/lib/queries/use-rooms';
import { ROOM_CAPACITY_MAX } from '@/lib/validation/limits';
import {
  createBookingSchema,
  type BookingFormValues,
} from '@/lib/validation/schemas';
import { formatBookingMoney } from '@/components/bookings/booking-display';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HookFormField } from '@/components/ui/HookFormField';
import { HookFormSelect } from '@/components/ui/HookFormSelect';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function mutationError(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

export default function NewBookingPage() {
  const { showToast } = useToast();
  const [quote, setQuote] = useState<{ nights: number; totalAmount: number } | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(
      createBookingSchema(ROOM_CAPACITY_MAX),
    ) as Resolver<BookingFormValues>,
    defaultValues: {
      hotelId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      guestCount: 1,
    },
    mode: 'onBlur',
  });

  const { resetField, control } = form;
  const hotelId = useWatch({ control, name: 'hotelId' });
  const roomId = useWatch({ control, name: 'roomId' });
  const checkIn = useWatch({ control, name: 'checkIn' });
  const checkOut = useWatch({ control, name: 'checkOut' });

  const datesValid = Boolean(checkIn && checkOut && checkOut > checkIn);

  const { data: hotelsData, isPending: hotelsLoading } = useHotels({
    status: 'ACTIVE',
    limit: 100,
  });

  const { data: roomsData, isPending: roomsLoading } = useRooms(hotelId, {
    limit: 100,
    checkIn: datesValid ? checkIn : undefined,
    checkOut: datesValid ? checkOut : undefined,
  });

  const quoteMutation = useQuoteBooking();
  const createMutation = useCreateBooking();

  const hotels = hotelsData?.data ?? [];
  const rooms = useMemo(
    () => (roomsData?.data ?? []).filter((r) => r.isAvailable),
    [roomsData?.data],
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === roomId),
    [rooms, roomId],
  );

  const hotelOptions = hotels.map((h) => ({
    value: h.id,
    label: `${h.name} — ${h.city}`,
  }));

  const roomOptions = rooms.map((r) => ({
    value: r.id,
    label: `${r.roomType} — ${formatBookingMoney(r.pricePerNight)}/night — cap ${r.capacity}`,
  }));

  function resetQuote() {
    setQuote(null);
  }

  useEffect(() => {
    resetField('roomId');
    resetQuote();
  }, [hotelId, checkIn, checkOut, resetField]);

  function buildPayload(values: BookingFormValues) {
    if (selectedRoom && values.guestCount > selectedRoom.capacity) {
      form.setError('guestCount', {
        message: `Guest count cannot exceed room capacity (${selectedRoom.capacity})`,
      });
      return null;
    }
    return {
      hotelId: values.hotelId,
      roomId: values.roomId,
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      guestCount: values.guestCount,
    };
  }

  async function onGetQuote(values: BookingFormValues) {
    setFormError(null);
    resetQuote();
    const payload = buildPayload(values);
    if (!payload) return;

    try {
      const result = await quoteMutation.mutateAsync(payload);
      setQuote(result);
      showToast({
        title: 'Quote ready',
        description: `${result.nights} night(s), total ${formatBookingMoney(result.totalAmount)}.`,
        variant: 'info',
      });
    } catch (err) {
      setFormError(mutationError(err, 'Failed to get quote'));
      showToast({
        title: 'Failed to get quote',
        description: mutationError(err, 'Please try again.'),
        variant: 'error',
      });
    }
  }

  async function onCreateBooking(values: BookingFormValues) {
    if (!quote) return;
    setFormError(null);
    const payload = buildPayload(values);
    if (!payload) return;

    try {
      await createMutation.mutateAsync(payload);
      showToast({
        title: 'Booking created',
        description: 'Your reservation is pending payment.',
        variant: 'success',
      });
      setQuote(null);
      form.reset({
        hotelId: '',
        roomId: '',
        checkIn: '',
        checkOut: '',
        guestCount: 1,
      });
    } catch (err) {
      setFormError(mutationError(err, 'Failed to create booking'));
      showToast({
        title: 'Failed to create booking',
        description: mutationError(err, 'Please try again.'),
        variant: 'error',
      });
    }
  }

  const quoteError =
    quoteMutation.error && !formError
      ? mutationError(quoteMutation.error, 'Quote failed')
      : null;

  const createError =
    createMutation.error && !formError
      ? mutationError(createMutation.error, 'Failed to create booking')
      : null;

  const displayError = formError ?? quoteError ?? createError;

  return (
    <div>
      <h1 className="text-2xl font-bold">Book a room</h1>
      <p className="mt-1 text-sm text-gray-600">
        Get a quote, create a pending booking, then complete simulated payment to
        confirm.
      </p>

      <p className="mt-2 text-sm">
        <Link href="/bookings/my" className="text-blue-600 hover:underline">
          View my reservations
        </Link>
      </p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">New reservation</h2>

        {hotelsLoading && <LoadingSpinner className="mt-4" label="Loading hotels…" />}

        <FormProvider {...form}>
          <form className="mt-4 space-y-4" noValidate>
            <HookFormSelect
              name="hotelId"
              label="Hotel"
              placeholder="Select a hotel"
              options={hotelOptions}
              disabled={hotelsLoading}
            />

            {hotelId && (
              <div className="grid gap-4 sm:grid-cols-2">
                <HookFormField name="checkIn" label="Check-in" type="date" />
                <HookFormField name="checkOut" label="Check-out" type="date" />
              </div>
            )}

            {hotelId && checkIn && checkOut && !datesValid && (
              <p className="text-sm text-amber-700">
                Check-out must be after check-in before choosing a room.
              </p>
            )}

            {hotelId && datesValid && (
              <>
                {roomsLoading ? (
                  <LoadingSpinner className="mt-2" label="Loading rooms…" />
                ) : (
                  <HookFormSelect
                    name="roomId"
                    label="Room"
                    placeholder="Select a room"
                    options={roomOptions}
                    onValueChange={() => resetQuote()}
                  />
                )}
                {!roomsLoading && rooms.length === 0 && (
                  <p className="text-sm text-amber-700">
                    No rooms available for these dates. Try different check-in or
                    check-out dates.
                  </p>
                )}
              </>
            )}

            <HookFormField
              name="guestCount"
              label="Guests"
              type="number"
              min={1}
              max={selectedRoom?.capacity ?? ROOM_CAPACITY_MAX}
              className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2"
              onChange={() => resetQuote()}
            />

            {quote && (
              <div className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <p>
                  <span className="font-medium">{quote.nights}</span> night
                  {quote.nights !== 1 ? 's' : ''} · Total{' '}
                  <span className="font-medium">
                    {formatBookingMoney(quote.totalAmount)}
                  </span>
                </p>
              </div>
            )}

            {displayError && <ErrorMessage message={displayError} />}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={quoteMutation.isPending}
                onClick={form.handleSubmit(onGetQuote)}
                className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {quoteMutation.isPending ? 'Getting quote…' : 'Get quote'}
              </button>
              <button
                type="button"
                onClick={form.handleSubmit(onCreateBooking)}
                disabled={!quote || createMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Booking…' : 'Book (pending)'}
              </button>
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
