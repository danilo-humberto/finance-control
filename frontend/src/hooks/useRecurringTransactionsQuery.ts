import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactionById,
  getRecurringTransactions,
  updateRecurringTransaction,
} from '@/services/recurringTransactionsService';
import {
  type CreateRecurringTransactionPayload,
  type DeleteRecurringTransactionParams,
  type QueryRecurringTransactionsParams,
  type UpdateRecurringTransactionPayload,
} from '@/types/recurring-transaction';

const recurringStaleTime = 60 * 1000;

export function useRecurringTransactionsQuery(
  params?: QueryRecurringTransactionsParams,
) {
  return useQuery({
    queryKey: queryKeys.recurringTransactions.list(params),
    queryFn: () => getRecurringTransactions(params),
    staleTime: recurringStaleTime,
  });
}

export function useRecurringTransactionQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.recurringTransactions.detail(id ?? ''),
    queryFn: () => {
      if (!id) {
        throw new Error('Recurring transaction id is required.');
      }
      return getRecurringTransactionById(id);
    },
    enabled: Boolean(id),
    staleTime: recurringStaleTime,
  });
}

export function useCreateRecurringTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRecurringTransactionPayload) =>
      createRecurringTransaction(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.recurringTransactions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.creditCards.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        }),
      ]);
    },
  });
}

export function useUpdateRecurringTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRecurringTransactionPayload;
    }) => updateRecurringTransaction(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.recurringTransactions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.creditCards.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        }),
      ]);
    },
  });
}

export function useDeleteRecurringTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteRecurringTransactionParams) =>
      deleteRecurringTransaction(params),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.recurringTransactions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.creditCards.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        }),
      ]);
    },
  });
}
