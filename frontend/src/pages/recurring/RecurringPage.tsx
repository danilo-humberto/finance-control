import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { RecurringDeleteDialog } from '@/components/transactions/RecurringDeleteDialog';
import { useNewPurchaseDialog } from '@/hooks/useNewPurchaseDialog';
import {
  useDeleteRecurringTransactionMutation,
  useRecurringTransactionsQuery,
} from '@/hooks/useRecurringTransactionsQuery';
import { type RecurringTransaction } from '@/types/recurring-transaction';
import { RecurringDesktopView } from './RecurringDesktopView';
import {
  RecurringMobileView,
  type RecurringStatusFilter,
  type RecurringSummaryData,
} from './RecurringMobileView';

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data?.message) && typeof data.message[0] === 'string') {
      return data.message[0];
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function RecurringPage() {
  const navigate = useNavigate();
  const { openNewPurchaseDialog } = useNewPurchaseDialog();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecurringStatusFilter>('all');
  const [selectedRecurring, setSelectedRecurring] =
    useState<RecurringTransaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null);

  const recurringQuery = useRecurringTransactionsQuery();
  const deleteMutation = useDeleteRecurringTransactionMutation();

  const allItems = recurringQuery.data ?? [];
  const loading = recurringQuery.isPending;
  const loadError = recurringQuery.isError
    ? getApiErrorMessage(recurringQuery.error)
    : null;

  const summary = useMemo<RecurringSummaryData>(() => {
    let totalMonthly = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    allItems.forEach((item) => {
      if (item.isActive) {
        activeCount += 1;
        if (item.transactionType === 'EXPENSE') {
          totalMonthly += item.amount;
        }
      } else {
        inactiveCount += 1;
      }
    });

    return {
      totalMonthly,
      activeCount,
      inactiveCount,
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return allItems.filter((item) => {
      if (statusFilter === 'active' && !item.isActive) {
        return false;
      }
      if (statusFilter === 'inactive' && item.isActive) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const matchDescription = item.description
        .toLowerCase()
        .includes(normalizedQuery);
      const matchCategory =
        item.category?.name.toLowerCase().includes(normalizedQuery) ?? false;
      const matchCard =
        item.creditCard?.name.toLowerCase().includes(normalizedQuery) ?? false;

      return matchDescription || matchCategory || matchCard;
    });
  }, [allItems, searchTerm, statusFilter]);

  function handleNewRecurring() {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      openNewPurchaseDialog();
    } else {
      navigate('/transactions/new');
    }
  }

  function handleCancelClick(item: RecurringTransaction) {
    setSelectedRecurring(item);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete(includeCurrentMonth: boolean) {
    if (!selectedRecurring) {
      return;
    }

    try {
      setFeedbackMessage(null);
      await deleteMutation.mutateAsync({
        id: selectedRecurring.id,
        includeCurrentMonth,
      });
      setFeedbackMessage({
        tone: 'success',
        message: includeCurrentMonth
          ? 'Assinatura cancelada e cobrança do mês removida com sucesso.'
          : 'Assinatura cancelada. Cobranças futuras foram removidas.',
      });
      setSelectedRecurring(null);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    }
  }

  return (
    <>
      {feedbackMessage ? (
        <div className="mb-4">
          <AuthMessage tone={feedbackMessage.tone}>
            {feedbackMessage.message}
          </AuthMessage>
        </div>
      ) : null}

      <div className="lg:hidden">
        <RecurringMobileView
          items={filteredItems}
          loading={loading}
          loadError={loadError}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          summary={summary}
          onRetry={() => void recurringQuery.refetch()}
          onNewRecurring={handleNewRecurring}
          onCancelClick={handleCancelClick}
        />
      </div>

      <div className="hidden lg:block">
        <RecurringDesktopView
          items={filteredItems}
          loading={loading}
          loadError={loadError}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          summary={summary}
          onRetry={() => void recurringQuery.refetch()}
          onNewRecurring={handleNewRecurring}
          onCancelClick={handleCancelClick}
        />
      </div>

      <RecurringDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        transactionDescription={selectedRecurring?.description ?? 'Recorrência'}
        confirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
