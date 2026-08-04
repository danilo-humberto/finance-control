import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { InvoiceCarousel } from '@/components/dashboard/InvoiceCarousel';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
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

  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

export function DashboardPage() {
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

  return (
    <div className="w-full space-y-5 sm:mx-auto sm:max-w-md">
      <DashboardHeader
        name={user?.displayName}
        email={user?.email}
        photoUrl={user?.photoURL}
      />
      <InvoiceCarousel
        invoices={invoices}
        loading={invoicesQuery.isPending}
        error={invoiceError}
        onRetry={() => void invoicesQuery.refetch()}
        onAddCard={() => navigate('/credit-cards')}
      />
      <RecentTransactions
        transactions={transactions}
        loading={recentTransactionsQuery.isPending}
        error={transactionsError}
        onRetry={() => void recentTransactionsQuery.refetch()}
      />
    </div>
  );
}
