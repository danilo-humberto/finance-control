import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import {
  useDashboardInvoicesQuery,
  useDashboardRecentTransactionsQuery,
} from '@/hooks/useDashboardQuery';

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(' ');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if (error.response?.status === 401) {
      return 'Sua sessão expirou. Entre novamente para acessar seu dashboard.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

export function useDashboardPageData() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const invoicesQuery = useDashboardInvoicesQuery();
  const recentTransactionsQuery = useDashboardRecentTransactionsQuery();

  const invoices = invoicesQuery.data ?? [];
  const transactions = recentTransactionsQuery.data ?? [];
  const invoiceError = invoicesQuery.isError
    ? getApiErrorMessage(invoicesQuery.error)
    : null;
  const transactionsError = recentTransactionsQuery.isError
    ? getApiErrorMessage(recentTransactionsQuery.error)
    : null;

  return {
    invoices,
    invoiceError,
    invoicesLoading: invoicesQuery.isPending,
    onAddCard: () => navigate('/credit-cards'),
    onNewPurchase: () => navigate('/transactions/new'),
    onRetryInvoices: () => void invoicesQuery.refetch(),
    onRetryTransactions: () => void recentTransactionsQuery.refetch(),
    photoUrl: user?.photoURL,
    transactions,
    transactionsError,
    transactionsLoading: recentTransactionsQuery.isPending,
    userEmail: user?.email,
    userName: user?.displayName,
  };
}

export type DashboardPageData = ReturnType<typeof useDashboardPageData>;
