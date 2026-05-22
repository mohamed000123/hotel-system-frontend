'use client';

import { useAuth } from '@/context/AuthContext';
import { ApiClientError } from '@/lib/api/client';
import { useDashboardStats } from '@/lib/queries/use-dashboard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {description ? (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      ) : null}
    </article>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isPending, isError, error, refetch, isFetching } =
    useDashboardStats();

  const scopeLabel =
    user?.role === 'HOTEL_MANAGER'
      ? 'Metrics for your assigned hotel'
      : 'Organization-wide metrics';

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : error
        ? 'Failed to load dashboard metrics'
        : null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">{scopeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isPending ? (
        <div className="mt-8">
          <LoadingSpinner label="Loading dashboard metrics…" />
        </div>
      ) : null}

      {isError && errorMessage ? (
        <div className="mt-6">
          <ErrorMessage message={errorMessage} />
        </div>
      ) : null}

      {data ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total hotels"
            value={data.totalHotels}
            description={
              user?.role === 'HOTEL_MANAGER'
                ? 'Your assigned property'
                : 'All properties in the system'
            }
          />
          <StatCard
            label="Total bookings"
            value={data.totalBookings}
            description="All booking records in scope"
          />
          <StatCard
            label="Confirmed bookings"
            value={data.confirmedBookings}
            description="Paid and confirmed stays"
          />
          <StatCard
            label="Pending bookings"
            value={data.pendingBookings}
            description="Awaiting simulated payment"
          />
          <StatCard
            label="Revenue (confirmed)"
            value={formatCurrency(data.revenueTotal)}
            description="Sum of confirmed booking totals"
          />
        </section>
      ) : null}
    </div>
  );
}
