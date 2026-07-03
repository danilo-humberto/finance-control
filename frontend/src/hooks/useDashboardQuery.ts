import { useQuery } from '@tanstack/react-query';

import {
  getDashboardInvoices,
  getDashboardRecentTransactions,
} from '@/services/dashboardService';
import { queryKeys } from '@/lib/queryKeys';

const dashboardStaleTime = 60 * 1000;

export function useDashboardInvoicesQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.invoices(),
    queryFn: getDashboardInvoices,
    staleTime: dashboardStaleTime,
  });
}

export function useDashboardRecentTransactionsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.recentTransactions(),
    queryFn: getDashboardRecentTransactions,
    staleTime: dashboardStaleTime,
  });
}
