import {
  type InvoiceFilters,
} from '@/types/invoice';
import {
  type QueryRecurringTransactionsParams,
} from '@/types/recurring-transaction';
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
  dashboard: {
    all: ['dashboard'] as const,
    invoices: () => [...queryKeys.dashboard.all, 'invoices'] as const,
    recentTransactions: () =>
      [...queryKeys.dashboard.all, 'recentTransactions'] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    detail: (filters: InvoiceFilters) =>
      [...queryKeys.invoices.all, filters] as const,
  },
  recurringTransactions: {
    all: ['recurringTransactions'] as const,
    lists: () => [...queryKeys.recurringTransactions.all, 'list'] as const,
    list: (params?: QueryRecurringTransactionsParams) =>
      [...queryKeys.recurringTransactions.all, 'list', params ?? {}] as const,
    detail: (id: string) =>
      [...queryKeys.recurringTransactions.all, 'detail', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: TransactionFilters) =>
      [...queryKeys.transactions.all, 'list', filters ?? {}] as const,
  },
} as const;
