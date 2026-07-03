import {
  type InvoiceFilters,
} from '@/types/invoice';
import {
  type TransactionFilters,
} from '@/types/transaction';

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
  creditCards: {
    all: ['creditCards'] as const,
    list: () => [...queryKeys.creditCards.all, 'list'] as const,
    withUsage: () => [...queryKeys.creditCards.all, 'withUsage'] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    detail: (filters: InvoiceFilters) =>
      [...queryKeys.invoices.all, filters] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
    list: (filters?: TransactionFilters) =>
      [...queryKeys.transactions.all, 'list', filters ?? {}] as const,
  },
} as const;
