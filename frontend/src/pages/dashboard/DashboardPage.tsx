import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { InvoiceCarousel } from '@/components/dashboard/InvoiceCarousel';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useAuth } from '@/hooks/useAuth';
import {
  getDashboardInvoices,
  getDashboardRecentTransactions,
} from '@/services/dashboardService';
import {
  type DashboardCurrentInvoice,
  type DashboardRecentTransaction,
} from '@/types/dashboard';

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

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<DashboardCurrentInvoice[]>([]);
  const [transactions, setTransactions] = useState<DashboardRecentTransaction[]>(
    [],
  );
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );

  const loadInvoices = useCallback(async () => {
    try {
      setLoadingInvoices(true);
      setInvoiceError(null);
      const dashboardInvoices = await getDashboardInvoices();
      setInvoices(dashboardInvoices);
    } catch (error) {
      setInvoices([]);
      setInvoiceError(getApiErrorMessage(error));
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      setTransactionsError(null);
      const recentTransactions = await getDashboardRecentTransactions();
      setTransactions(recentTransactions);
    } catch (error) {
      setTransactions([]);
      setTransactionsError(getApiErrorMessage(error));
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
    void loadTransactions();
  }, [loadInvoices, loadTransactions]);

  return (
    <div className="w-full space-y-5 sm:mx-auto sm:max-w-md">
      <DashboardHeader
        name={user?.displayName}
        email={user?.email}
        photoUrl={user?.photoURL}
      />
      <InvoiceCarousel
        invoices={invoices}
        loading={loadingInvoices}
        error={invoiceError}
        onRetry={() => void loadInvoices()}
        onAddCard={() => navigate('/credit-cards')}
      />
      <RecentTransactions
        transactions={transactions}
        loading={loadingTransactions}
        error={transactionsError}
        onRetry={() => void loadTransactions()}
      />
    </div>
  );
}
