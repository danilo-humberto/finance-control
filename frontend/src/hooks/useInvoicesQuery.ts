import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelInstallment,
  markInstallmentAsPaid,
  reopenInstallment,
} from '@/services/installmentsService';
import { getInvoice } from '@/services/invoicesService';
import { queryKeys } from '@/lib/queryKeys';
import { type InvoiceFilters } from '@/types/invoice';

const invoiceStaleTime = 60 * 1000;

export type InstallmentAction = 'pay' | 'reopen' | 'cancel';

export function useInvoiceQuery(filters: InvoiceFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(filters),
    queryFn: () => getInvoice(filters),
    enabled,
    staleTime: invoiceStaleTime,
  });
}

export function useInstallmentActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      installmentId,
    }: {
      action: InstallmentAction;
      installmentId: string;
    }) => {
      if (action === 'pay') {
        return markInstallmentAsPaid(installmentId);
      }

      if (action === 'reopen') {
        return reopenInstallment(installmentId);
      }

      return cancelInstallment(installmentId);
    },
    onSuccess: async () => {
      await Promise.all([
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
