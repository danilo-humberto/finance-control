import { useQuery } from '@tanstack/react-query';

import { getTransactionById } from '@/services/transactionsService';
import { queryKeys } from '@/lib/queryKeys';

const transactionDetailStaleTime = 60 * 1000;

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
