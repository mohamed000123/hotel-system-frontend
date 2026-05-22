'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { HotelForm } from '@/components/hotels/HotelForm';
import { HotelStatusControl } from '@/components/hotels/HotelStatusControl';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import { useHotel } from '@/lib/queries/use-hotels';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ORG_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

function isOrgAdmin(role: string | undefined): boolean {
  return ORG_ADMIN_ROLES.includes(role as (typeof ORG_ADMIN_ROLES)[number]);
}

export default function HotelDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { user } = useAuth();
  const canManage = isOrgAdmin(user?.role);
  const [editing, setEditing] = useState(false);

  const { data: hotel, isPending, isError, error } = useHotel(id);

  if (!id) {
    return <ErrorMessage message="Invalid hotel id" />;
  }

  return (
    <div>
      <Link href="/hotels" className="text-sm text-blue-600 hover:underline">
        ← Back to hotels
      </Link>

      {isPending && <LoadingSpinner className="mt-6" />}
      {isError && (
        <ErrorMessage
          className="mt-6"
          message={
            error instanceof ApiClientError
              ? error.message
              : 'Failed to load hotel'
          }
        />
      )}

      {hotel && (
        <div className="mt-6">
          {!editing ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{hotel.name}</h1>
                  <p className="mt-1 text-gray-600">
                    {hotel.city} · {hotel.address}
                  </p>
                </div>
                <HotelStatusControl hotel={hotel} canToggle={canManage} />
              </div>

              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-gray-500">Star rating</dt>
                  <dd>{hotel.stars} stars</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Available rooms</dt>
                  <dd>{hotel.availableRoomCount ?? 0}</dd>
                </div>
              </dl>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-6 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Edit hotel
                </button>
              )}
            </>
          ) : (
            <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Edit hotel</h2>
              <div className="mt-4">
                <HotelForm
                  hotel={hotel}
                  onSuccess={() => setEditing(false)}
                  onCancel={() => setEditing(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
