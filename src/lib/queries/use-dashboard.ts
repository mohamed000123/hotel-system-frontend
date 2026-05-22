import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard';
import { queryKeys } from './query-keys';

const DASHBOARD_STALE_MS = 30_000;

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.getDashboardStats(),
    staleTime: DASHBOARD_STALE_MS,
  });
}
