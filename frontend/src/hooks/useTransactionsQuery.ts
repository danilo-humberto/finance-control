import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteTransaction,
  getTransactionById,
  getTransactions,
} from '@/services/transactionsService';
import { queryKeys } from '@/lib/queryKeys';
import {
  type PaginatedTransactionsResponse,
  type TransactionFilters,
} from '@/types/transaction';

export const transactionsPageSize = 20;

const transactionsStaleTime = 60 * 1000;
const transactionDetailStaleTime = 60 * 1000;

export function useTransactionsInfiniteQuery(filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: ({ pageParam }) =>
      getTransactions({
        ...filters,
        page: pageParam,
        limit: transactionsPageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    staleTime: transactionsStaleTime,
  });
}

export function useTransactionQuery(transactionId?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId ?? ''),
    queryFn: () => {
      if (!transactionId) {
        throw new Error('Transaction id is required.');
      }

      return getTransactionById(transactionId);
    },
    enabled: Boolean(transactionId),
    staleTime: transactionDetailStaleTime,
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, deletedTransactionId) => {
      queryClient.setQueriesData<
        InfiniteData<PaginatedTransactionsResponse, number>
      >(
        { queryKey: queryKeys.transactions.lists() },
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          const transactionWasRemoved = currentData.pages.some((page) =>
            page.items.some(
              (transaction) => transaction.id === deletedTransactionId,
            ),
          );

          if (!transactionWasRemoved) {
            return currentData;
          }

          const currentTotal = currentData.pages[0]?.meta.total ?? 0;
          const total = Math.max(currentTotal - 1, 0);

          return {
            ...currentData,
            pages: currentData.pages.map((page) => ({
              ...page,
              items: page.items.filter(
                (transaction) => transaction.id !== deletedTransactionId,
              ),
              meta: {
                ...page.meta,
                total,
                totalPages: Math.ceil(total / page.meta.limit),
              },
            })),
          };
        },
      );
      queryClient.removeQueries({
        queryKey: queryKeys.transactions.detail(deletedTransactionId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creditCards.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      });
    },
  });
}
