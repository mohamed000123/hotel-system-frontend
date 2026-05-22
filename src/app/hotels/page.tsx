'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HotelForm } from '@/components/hotels/HotelForm';
import { HotelStatusControl } from '@/components/hotels/HotelStatusControl';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import type { HotelStatus, ListHotelsParams } from '@/lib/api/types';
import { useDeleteHotel, useHotels } from '@/lib/queries/use-hotels';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginationControls } from '@/components/ui/PaginationControls';

const ORG_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

function isOrgAdmin(role: string | undefined): boolean {
  return ORG_ADMIN_ROLES.includes(role as (typeof ORG_ADMIN_ROLES)[number]);
}

export default function HotelsPage() {
  const { user } = useAuth();
  const canManage = isOrgAdmin(user?.role);
  const deleteMutation = useDeleteHotel();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | HotelStatus>('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const listParams = useMemo((): ListHotelsParams => {
    const params: ListHotelsParams = { page, limit: 10 };
    if (search.trim()) params.q = search.trim();
    if (canManage && statusFilter) {
      params.status = statusFilter;
    } else if (!canManage) {
      params.status = 'ACTIVE';
    }
    return params;
  }, [page, search, statusFilter, canManage]);

  const { data, isPending, isError, error } = useHotels(listParams);

  const hotels = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      /* surfaced below */
    }
  }

  const deleteError =
    deleteMutation.error instanceof ApiClientError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? 'Failed to delete hotel'
        : null;

  return (
    <div>
      <h1 className="text-2xl font-bold">Hotels</h1>
      <p className="mt-1 text-sm text-gray-600">
        {canManage
          ? 'Create, search, and manage the hotel catalog. Activate or deactivate hotels to control guest visibility.'
          : 'Browse active hotels available for booking.'}
      </p>

      <section className="mt-6 flex flex-wrap gap-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="hotel-search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            id="hotel-search"
            type="search"
            placeholder="Name or city"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        {canManage && (
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as '' | HotelStatus);
                setPage(1);
              }}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </section>

      {canManage && (
        <section className="mt-6">
          {!showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Add hotel
            </button>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold">New hotel</h2>
              <div className="mt-4 max-w-md">
                <HotelForm
                  onSuccess={() => setShowCreate(false)}
                  onCancel={() => setShowCreate(false)}
                />
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        {isPending && <LoadingSpinner className="mt-4" />}
        {isError && (
          <ErrorMessage
            className="mt-4"
            message={
              error instanceof ApiClientError
                ? error.message
                : 'Failed to load hotels'
            }
          />
        )}
        {!isPending && !isError && hotels.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            No hotels found. Try adjusting your search
            {canManage ? ' or create a new hotel.' : '.'}
          </p>
        )}
        {hotels.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {hotels.map((hotel) => (
              <li
                key={hotel.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/hotels/${hotel.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {hotel.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {hotel.city} · {hotel.stars}★ ·{' '}
                    {hotel.availableRoomCount ?? 0} rooms available
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <HotelStatusControl
                    hotel={hotel}
                    canToggle={canManage}
                  />
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDelete(hotel.id, hotel.name)}
                      disabled={deleteMutation.isPending}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {deleteError && <ErrorMessage className="mt-4" message={deleteError} />}
        {data && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={data.total}
            limit={data.limit}
            itemLabel="hotels"
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
