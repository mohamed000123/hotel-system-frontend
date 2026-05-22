'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { BookingCreateDto } from '@/lib/api/types';
import { useHotels } from '@/lib/queries/use-hotels';
import { useCreateBooking, useQuoteBooking } from '@/lib/queries/use-bookings';
import { useRooms } from '@/lib/queries/use-rooms';
import { formatBookingMoney } from '@/components/bookings/booking-display';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function mutationError(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

export default function NewBookingPage() {
  const [hotelId, setHotelId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [quote, setQuote] = useState<{ nights: number; totalAmount: number } | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const { data: hotelsData, isPending: hotelsLoading } = useHotels({
    status: 'ACTIVE',
    limit: 100,
  });

  const { data: roomsData, isPending: roomsLoading } = useRooms(hotelId, {
    limit: 100,
  });

  const quoteMutation = useQuoteBooking();
  const createMutation = useCreateBooking();

  const hotels = hotelsData?.data ?? [];
  const rooms = roomsData?.data ?? [];

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === roomId),
    [rooms, roomId],
  );

  const bookingPayload = useMemo((): BookingCreateDto | null => {
    if (!hotelId || !roomId || !checkIn || !checkOut) return null;
    return { hotelId, roomId, checkIn, checkOut, guestCount };
  }, [hotelId, roomId, checkIn, checkOut, guestCount]);

  const canSubmit = Boolean(bookingPayload && quote);

  function resetQuote() {
    setQuote(null);
  }

  function handleHotelChange(nextHotelId: string) {
    setHotelId(nextHotelId);
    setRoomId('');
    resetQuote();
  }

  async function handleGetQuote(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    resetQuote();

    if (!bookingPayload) {
      setFormError('Select a hotel, room, and valid dates');
      return;
    }

    if (selectedRoom && guestCount > selectedRoom.capacity) {
      setFormError(
        `Guest count cannot exceed room capacity (${selectedRoom.capacity})`,
      );
      return;
    }

    try {
      const result = await quoteMutation.mutateAsync(bookingPayload);
      setQuote(result);
    } catch (err) {
      setFormError(mutationError(err, 'Failed to get quote'));
    }
  }

  async function handleCreateBooking() {
    if (!bookingPayload) return;
    setFormError(null);

    try {
      await createMutation.mutateAsync(bookingPayload);
      setQuote(null);
      setCheckIn('');
      setCheckOut('');
      setGuestCount(1);
      setRoomId('');
    } catch (err) {
      setFormError(mutationError(err, 'Failed to create booking'));
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

        <form onSubmit={handleGetQuote} className="mt-4 space-y-4">
          <div>
            <label htmlFor="hotel" className="block text-sm font-medium text-gray-700">
              Hotel
            </label>
            <select
              id="hotel"
              value={hotelId}
              onChange={(e) => handleHotelChange(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a hotel</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.city}
                </option>
              ))}
            </select>
          </div>

          {hotelId && (
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                Room
              </label>
              {roomsLoading ? (
                <LoadingSpinner className="mt-2" label="Loading rooms…" />
              ) : (
                <select
                  id="room"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    resetQuote();
                  }}
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a room</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomType} — {formatBookingMoney(r.pricePerNight)}/night — cap{' '}
                      {r.capacity}
                    </option>
                  ))}
                </select>
              )}
              {!roomsLoading && rooms.length === 0 && (
                <p className="mt-1 text-sm text-amber-700">
                  No available rooms for this hotel.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="check-in"
                className="block text-sm font-medium text-gray-700"
              >
                Check-in
              </label>
              <input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  resetQuote();
                }}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor="check-out"
                className="block text-sm font-medium text-gray-700"
              >
                Check-out
              </label>
              <input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  resetQuote();
                }}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="guests"
              className="block text-sm font-medium text-gray-700"
            >
              Guests
            </label>
            <input
              id="guests"
              type="number"
              min={1}
              max={selectedRoom?.capacity ?? 99}
              value={guestCount}
              onChange={(e) => {
                setGuestCount(Number(e.target.value));
                resetQuote();
              }}
              required
              className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

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
              type="submit"
              disabled={quoteMutation.isPending || !bookingPayload}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
            >
              {quoteMutation.isPending ? 'Getting quote…' : 'Get quote'}
            </button>
            <button
              type="button"
              onClick={handleCreateBooking}
              disabled={!canSubmit || createMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Booking…' : 'Book (pending)'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
