'use client';

import { useState } from 'react';
import { RoomForm } from '@/components/rooms/RoomForm';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import type { Room } from '@/lib/api/types';
import { useHotel } from '@/lib/queries/use-hotels';
import { useRooms, useUpdateRoom } from '@/lib/queries/use-rooms';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';

function availabilityBadge(available: boolean) {
  return available ? (
    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
      Available
    </span>
  ) : (
    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
      Unavailable
    </span>
  );
}

export default function RoomsPage() {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? '';
  const { data: hotel } = useHotel(hotelId);

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { data, isPending, isError, error } = useRooms(hotelId, {
    page,
    limit: 10,
  });

  const updateMutation = useUpdateRoom();

  const rooms = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  async function toggleAvailability(room: Room) {
    try {
      await updateMutation.mutateAsync({
        id: room.id,
        hotelId: room.hotelId,
        data: { isAvailable: !room.isAvailable },
      });
    } catch {
      /* surfaced below */
    }
  }

  const toggleError =
    updateMutation.error instanceof ApiClientError
      ? updateMutation.error.message
      : updateMutation.error
        ? 'Failed to update room'
        : null;

  if (!hotelId) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Rooms</h1>
        <ErrorMessage
          className="mt-4"
          message="Your account is not assigned to a hotel. Contact an administrator."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Rooms</h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage room inventory for your assigned hotel.
      </p>

      {hotel?.name && (
        <p className="mt-4 text-sm text-gray-600">
          Managing inventory for <strong>{hotel.name}</strong>
        </p>
      )}

      <section className="mt-6">
        {!showCreate && !editingRoom ? (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Add room
          </button>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold">
              {editingRoom ? 'Edit room' : 'New room'}
            </h2>
            <div className="mt-4 max-w-md">
              <RoomForm
                hotelId={hotelId}
                room={editingRoom ?? undefined}
                onSuccess={() => {
                  setShowCreate(false);
                  setEditingRoom(null);
                }}
                onCancel={() => {
                  setShowCreate(false);
                  setEditingRoom(null);
                }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="mt-8">
        {isPending && <LoadingSpinner className="mt-4" />}
        {isError && (
          <ErrorMessage
            className="mt-4"
            message={
              error instanceof ApiClientError
                ? error.message
                : 'Failed to load rooms'
            }
          />
        )}
        {!isPending && !isError && rooms.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            No rooms yet. Add a room type with capacity and nightly price.
          </p>
        )}
        {rooms.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {rooms.map((room) => (
              <li
                key={room.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{room.roomType}</p>
                  <p className="text-sm text-gray-600">
                    Sleeps {room.capacity} · ${room.pricePerNight.toFixed(2)}
                    /night
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {availabilityBadge(room.isAvailable)}
                  <button
                    type="button"
                    onClick={() => toggleAvailability(room)}
                    disabled={updateMutation.isPending}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {room.isAvailable ? 'Mark unavailable' : 'Mark available'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setEditingRoom(room);
                    }}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {toggleError && <ErrorMessage className="mt-4" message={toggleError} />}
        {data && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={data.total}
            limit={data.limit}
            itemLabel="rooms"
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
