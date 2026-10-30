import { isAxiosError } from 'axios';
import { Edit3, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionSheet } from '@/components/modals/ActionSheet';
import { RecurringFormDialog } from '@/components/recurring/RecurringFormDialog';
import { RecurringFormSheet } from '@/components/recurring/RecurringFormSheet';
import { RecurringDeleteDialog } from '@/components/transactions/RecurringDeleteDialog';
import { useToast } from '@/contexts/ToastContext';
import { useNewPurchaseDialog } from '@/hooks/useNewPurchaseDialog';
import {
  useDeleteRecurringTransactionMutation,
  useRecurringTransactionsQuery,
  useUpdateRecurringTransactionMutation,
} from '@/hooks/useRecurringTransactionsQuery';
import {
  type RecurringTransaction,
  type UpdateRecurringTransactionPayload,
} from '@/types/recurring-transaction';
import { RecurringDesktopView } from './RecurringDesktopView';
import {
  RecurringMobileView,
  type RecurringStatusFilter,
  type RecurringSummaryData,
} from './RecurringMobileView';

const desktopMediaQuery = '(min-width: 1024px)';

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
  const { toast } = useToast();
  const { openNewPurchaseDialog } = useNewPurchaseDialog();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecurringStatusFilter>('all');
  const [selectedRecurring, setSelectedRecurring] =
    useState<RecurringTransaction | null>(null);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringTransaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    window.matchMedia(desktopMediaQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);

    function handleViewportChange(event: MediaQueryListEvent) {
      setEditDialogOpen(false);
      setActionSheetOpen(false);
      setIsDesktopViewport(event.matches);
    }

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  const recurringQuery = useRecurringTransactionsQuery();
  const deleteMutation = useDeleteRecurringTransactionMutation();
  const updateMutation = useUpdateRecurringTransactionMutation();

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

  function handleActionMenuClick(item: RecurringTransaction) {
    setSelectedRecurring(item);
    setActionSheetOpen(true);
  }

  function handleEditClick(item: RecurringTransaction) {
    setEditingRecurring(item);
    setEditSubmitError(null);
    setEditDialogOpen(true);
  }

  function handleCancelClick(item: RecurringTransaction) {
    setSelectedRecurring(item);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmUpdate(payload: UpdateRecurringTransactionPayload) {
    if (!editingRecurring) {
      return;
    }

    try {
      setEditSubmitError(null);
      await updateMutation.mutateAsync({
        id: editingRecurring.id,
        payload,
      });
      setEditDialogOpen(false);
      setEditingRecurring(null);
      toast.edit('Recorrência atualizada com sucesso.');
    } catch (error) {
      const message = getApiErrorMessage(error);
      setEditSubmitError(message);
      toast.error(message);
    }
  }

  async function handleConfirmDelete(includeCurrentMonth: boolean) {
    if (!selectedRecurring) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        id: selectedRecurring.id,
        includeCurrentMonth,
      });
      toast.delete(
        includeCurrentMonth
          ? 'Recorrência excluída e cobrança do mês removida com sucesso.'
          : 'Recorrência excluída com sucesso.',
      );
      setSelectedRecurring(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <>
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
          onActionMenuClick={handleActionMenuClick}
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
          onEditClick={handleEditClick}
          onCancelClick={handleCancelClick}
        />
      </div>

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={selectedRecurring?.description ?? 'Recorrência'}
        actions={[
          {
            label: 'Editar recorrência',
            description: 'Alterar valor, categoria ou dia de cobrança',
            icon: Edit3,
            onClick: () => {
              if (selectedRecurring) {
                handleEditClick(selectedRecurring);
              }
            },
          },
          {
            label: 'Excluir recorrência',
            description: selectedRecurring?.isActive
              ? 'Encerrar cobranças e projeções futuras'
              : 'Excluir permanentemente do sistema',
            icon: Trash2,
            variant: 'danger' as const,
            onClick: () => {
              setDeleteDialogOpen(true);
            },
          },
        ]}
      />

      {isDesktopViewport ? (
        <RecurringFormDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditingRecurring(null);
              setEditSubmitError(null);
            }
          }}
          recurringTransaction={editingRecurring}
          onSubmit={handleConfirmUpdate}
          submitting={updateMutation.isPending}
          submitError={editSubmitError}
        />
      ) : (
        <RecurringFormSheet
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditingRecurring(null);
              setEditSubmitError(null);
            }
          }}
          recurringTransaction={editingRecurring}
          onSubmit={handleConfirmUpdate}
          submitting={updateMutation.isPending}
          submitError={editSubmitError}
        />
      )}

      <RecurringDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        transactionDescription={selectedRecurring?.description ?? 'Recorrência'}
        confirming={deleteMutation.isPending}
        isInactive={selectedRecurring ? !selectedRecurring.isActive : false}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
