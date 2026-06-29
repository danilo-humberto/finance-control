import { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { TransactionGroup } from '@/components/transactions/TransactionGroup';
import {
  type TransactionListItemData,
} from '@/components/transactions/TransactionListItem';
import {
  TransactionsFilters,
  type TransactionFilter,
} from '@/components/transactions/TransactionsFilters';
import {
  TransactionsSummary,
  type TransactionsSummaryData,
} from '@/components/transactions/TransactionsSummary';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from '@/services/transactionsService';
import {
  type CreateTransactionPayload,
  type PaymentMethod,
  type Transaction,
  type TransactionFilters as ApiTransactionFilters,
  type TransactionsPaginationMeta,
} from '@/types/transaction';
import {
  Copy,
  CreditCard,
  Edit3,
  LayoutGrid,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

type TransactionGroupData = {
  key: 'today' | 'yesterday' | 'week' | 'older';
  label: string;
  transactions: TransactionListItemData[];
};

const groupOrder: TransactionGroupData['key'][] = [
  'today',
  'yesterday',
  'week',
  'older',
];
const transactionsPageSize = 20;

const paymentMethodLabel: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Cartão',
  DEBIT: 'Débito',
  CASH: 'Dinheiro',
  PIX: 'Pix',
  OTHER: 'Outro',
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

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
      return 'Sua sessão expirou. Entre novamente para acessar suas movimentações.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

function getTransactionsSummary(
  transactions: Transaction[],
): TransactionsSummaryData {
  const income = transactions
    .filter((transaction) => transaction.transactionType === 'INCOME')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.transactionType === 'EXPENSE')
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

function getFilterParams(activeFilter: TransactionFilter): ApiTransactionFilters {
  if (activeFilter === 'income') {
    return { transactionType: 'INCOME' };
  }

  if (activeFilter === 'expense') {
    return { transactionType: 'EXPENSE' };
  }

  if (activeFilter === 'card') {
    return { paymentMethod: 'CREDIT_CARD' };
  }

  if (activeFilter === 'pix') {
    return { paymentMethod: 'PIX' };
  }

  return {};
}

function parseDate(value: string) {
  const [date] = value.split('T');
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return startOfDay(firstDate).getTime() === startOfDay(secondDate).getTime();
}

function getGroupKey(date: Date): TransactionGroupData['key'] {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);
  const dayDiff = Math.round(
    (today.getTime() - targetDate.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return 'today';
  }

  if (dayDiff === 1) {
    return 'yesterday';
  }

  if (dayDiff > 1 && dayDiff <= 7) {
    return 'week';
  }

  return 'older';
}

function getGroupLabel(key: TransactionGroupData['key']) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (key === 'today') {
    return `Hoje, ${formatLongDate(today)}`;
  }

  if (key === 'yesterday') {
    return `Ontem, ${formatLongDate(yesterday)}`;
  }

  if (key === 'week') {
    return 'Esta semana';
  }

  return 'Anteriores';
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
}

function formatDateLabel(value: string) {
  const date = parseDate(value);

  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}/${date.getFullYear()}`;
}

function getTimeLabel(transaction: Transaction) {
  if (transaction.createdAt) {
    const createdAt = new Date(transaction.createdAt);
    const purchaseDate = parseDate(transaction.purchaseDate);

    if (isSameDay(createdAt, purchaseDate)) {
      return createdAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  return formatDateLabel(transaction.purchaseDate);
}

function getPaymentLabel(transaction: Transaction) {
  if (transaction.creditCard?.name) {
    return transaction.creditCard.name;
  }

  return paymentMethodLabel[transaction.paymentMethod] ?? transaction.paymentMethod;
}

function toListItem(transaction: Transaction): TransactionListItemData {
  return {
    id: transaction.id,
    description: transaction.description,
    categoryName: transaction.category?.name ?? 'Categoria',
    categoryIcon: transaction.category?.icon,
    categoryColor: transaction.category?.color,
    paymentLabel: getPaymentLabel(transaction),
    amount: Math.abs(transaction.amount),
    transactionType: transaction.transactionType,
    timeLabel: getTimeLabel(transaction),
  };
}

function transactionMatchesSearch(transaction: Transaction, searchTerm: string) {
  const normalizedSearch = normalizeText(searchTerm);

  if (!normalizedSearch) {
    return true;
  }

  return (
    normalizeText(transaction.description).includes(normalizedSearch) ||
    normalizeText(transaction.category?.name ?? '').includes(normalizedSearch) ||
    normalizeText(getPaymentLabel(transaction)).includes(normalizedSearch)
  );
}

function groupTransactions(transactions: Transaction[]) {
  const groupedTransactions = new Map<
    TransactionGroupData['key'],
    TransactionListItemData[]
  >();

  for (const transaction of transactions) {
    const groupKey = getGroupKey(parseDate(transaction.purchaseDate));
    const currentTransactions = groupedTransactions.get(groupKey) ?? [];
    groupedTransactions.set(groupKey, [...currentTransactions, toListItem(transaction)]);
  }

  return groupOrder
    .map((groupKey) => ({
      key: groupKey,
      label: getGroupLabel(groupKey),
      transactions: groupedTransactions.get(groupKey) ?? [],
    }))
    .filter((group) => group.transactions.length > 0);
}

function toIsoDate(value: string) {
  return value.split('T')[0];
}

function buildDuplicatePayload(transaction: Transaction): CreateTransactionPayload {
  if (!transaction.categoryId) {
    throw new Error('Não foi possível duplicar: categoria ausente.');
  }

  if (
    transaction.paymentMethod === 'CREDIT_CARD' &&
    (!transaction.creditCardId ||
      !transaction.invoiceStartMonth ||
      !transaction.invoiceStartYear)
  ) {
    throw new Error('Não foi possível duplicar: dados da fatura ausentes.');
  }

  return {
    description: `${transaction.description} (cópia)`,
    amount: transaction.amount,
    transactionType: transaction.transactionType,
    paymentMethod: transaction.paymentMethod,
    purchaseDate: toIsoDate(transaction.purchaseDate),
    categoryId: transaction.categoryId,
    ...(transaction.creditCardId
      ? { creditCardId: transaction.creditCardId }
      : {}),
    installmentsCount: transaction.installmentsCount || 1,
    ...(transaction.invoiceStartMonth
      ? { invoiceStartMonth: transaction.invoiceStartMonth }
      : {}),
    ...(transaction.invoiceStartYear
      ? { invoiceStartYear: transaction.invoiceStartYear }
      : {}),
    ...(transaction.notes?.trim() ? { notes: transaction.notes.trim() } : {}),
  };
}

function TransactionsLoadingState() {
  return (
    <div className="space-y-4" aria-label="Carregando movimentações">
      {[0, 1].map((group) => (
        <section key={group} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded-full bg-app-elevated" />
          <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid min-h-[4.35rem] grid-cols-[2.5rem_minmax(0,1fr)_5.75rem] items-center gap-2.5 border-b border-app-border/80 px-2.5 py-2.5 last:border-b-0"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-app-elevated" />
                <div className="min-w-0 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded-full bg-app-elevated" />
                  <div className="h-2.5 w-40 animate-pulse rounded-full bg-app-elevated" />
                </div>
                <div className="ml-auto h-3 w-16 animate-pulse rounded-full bg-app-elevated" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paginationMeta, setPaginationMeta] =
    useState<TransactionsPaginationMeta>({
      total: 0,
      page: 1,
      limit: transactionsPageSize,
      totalPages: 0,
    });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] =
    useState<FeedbackMessage>(null);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transactionMatchesSearch(transaction, searchTerm),
      ),
    [searchTerm, transactions],
  );

  const summary = useMemo(
    () => getTransactionsSummary(filteredTransactions),
    [filteredTransactions],
  );

  const transactionGroups = useMemo(
    () => groupTransactions(filteredTransactions),
    [filteredTransactions],
  );
  const hasMoreTransactions = paginationMeta.page < paginationMeta.totalPages;

  const loadTransactions = useCallback(async (page = 1) => {
    const isFirstPage = page === 1;

    try {
      if (isFirstPage) {
        setLoading(true);
        setLoadError(null);
      } else {
        setLoadingMore(true);
        setFeedbackMessage(null);
      }

      const loadedTransactions = await getTransactions({
        ...getFilterParams(activeFilter),
        page,
        limit: transactionsPageSize,
      });

      setPaginationMeta(loadedTransactions.meta);
      setTransactions((currentTransactions) => {
        if (isFirstPage) {
          return loadedTransactions.items;
        }

        const currentIds = new Set(
          currentTransactions.map((transaction) => transaction.id),
        );

        return [
          ...currentTransactions,
          ...loadedTransactions.items.filter(
            (transaction) => !currentIds.has(transaction.id),
          ),
        ];
      });
    } catch (error) {
      if (isFirstPage) {
        setTransactions([]);
        setPaginationMeta({
          total: 0,
          page: 1,
          limit: transactionsPageSize,
          totalPages: 0,
        });
        setLoadError(getApiErrorMessage(error));
      } else {
        setFeedbackMessage({
          tone: 'error',
          message: getApiErrorMessage(error),
        });
      }
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [activeFilter]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  function handleCreateClick() {
    navigate('/transactions/new');
  }

  function handleMenuClick(transactionItem: TransactionListItemData) {
    const transaction = transactions.find(
      (currentTransaction) => currentTransaction.id === transactionItem.id,
    );

    if (!transaction) {
      return;
    }

    setSelectedTransaction(transaction);
    setActionSheetOpen(true);
  }

  function handleEditClick() {
    setFeedbackMessage({
      tone: 'info',
      message: 'Edição de movimentação ainda não disponível nesta tela.',
    });
  }

  async function handleDuplicateClick() {
    if (!selectedTransaction) {
      return;
    }

    try {
      setDuplicating(true);
      setFeedbackMessage(null);
      await createTransaction(buildDuplicatePayload(selectedTransaction));
      setFeedbackMessage({
        tone: 'success',
        message: 'Movimentação duplicada com sucesso.',
      });
      await loadTransactions();
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setDuplicating(false);
      setSelectedTransaction(null);
    }
  }

  function handleDeleteClick() {
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedTransaction) {
      return;
    }

    try {
      setDeleting(true);
      setFeedbackMessage(null);
      await deleteTransaction(selectedTransaction.id);
      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== selectedTransaction.id,
        ),
      );
      setPaginationMeta((currentMeta) => {
        const total = Math.max(currentMeta.total - 1, 0);

        return {
          ...currentMeta,
          total,
          totalPages: Math.ceil(total / currentMeta.limit),
        };
      });
      setFeedbackMessage({
        tone: 'success',
        message: 'Movimentação excluída com sucesso.',
      });
      setSelectedTransaction(null);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Movimentações
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Todas as suas entradas e saídas
          </p>
        </div>

        <button
          type="button"
          aria-label="Nova compra"
          onClick={handleCreateClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <TransactionsSummary summary={summary} />

      <TransactionsFilters
        searchTerm={searchTerm}
        activeFilter={activeFilter}
        onSearchChange={setSearchTerm}
        onFilterChange={setActiveFilter}
        onAdvancedFiltersClick={() => setFiltersSheetOpen(true)}
      />

      {loading ? (
        <TransactionsLoadingState />
      ) : loadError ? (
        <EmptyState
          title="Não foi possível carregar as movimentações"
          description={loadError}
          icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
          action={
            <Button type="button" size="sm" onClick={() => void loadTransactions()}>
              Tentar novamente
            </Button>
          }
        />
      ) : transactionGroups.length > 0 ? (
        <div className="space-y-4">
          {transactionGroups.map((group) => (
            <TransactionGroup
              key={group.key}
              label={group.label}
              transactions={group.transactions}
              onMenuClick={handleMenuClick}
            />
          ))}

          {hasMoreTransactions ? (
            <Button
              type="button"
              variant="secondary"
              className="h-10 w-full rounded-2xl border-brand-800/65 bg-brand-950/25 text-[0.8rem] font-semibold text-brand-400 hover:bg-brand-900/45"
              disabled={loadingMore}
              onClick={() => void loadTransactions(paginationMeta.page + 1)}
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais'}
            </Button>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma movimentação encontrada"
          description="Registre sua primeira compra para começar."
          icon={<Search aria-hidden="true" className="h-5 w-5" />}
          action={
            <Button type="button" size="sm" onClick={handleCreateClick}>
              Nova compra
            </Button>
          }
        />
      )}

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={selectedTransaction ? selectedTransaction.description : 'Movimentação'}
        actions={[
          {
            label: 'Editar movimentação',
            description: 'A edição será liberada em um fluxo próprio',
            icon: Edit3,
            onClick: handleEditClick,
          },
          {
            label: duplicating
              ? 'Duplicando movimentação...'
              : 'Duplicar movimentação',
            description: 'Criar uma nova movimentação com os mesmos dados',
            icon: Copy,
            onClick: () => void handleDuplicateClick(),
          },
          {
            label: 'Excluir movimentação',
            description: 'Remover esta movimentação',
            icon: Trash2,
            variant: 'danger',
            onClick: handleDeleteClick,
          },
        ]}
      />

      <ActionSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        title="Filtros"
        actions={[
          {
            label: 'Todas as movimentações',
            description: 'Remover filtro rápido',
            icon: LayoutGrid,
            onClick: () => setActiveFilter('all'),
          },
          {
            label: 'Somente cartão',
            description: 'Ver pagamentos por cartão',
            icon: CreditCard,
            onClick: () => setActiveFilter('card'),
          },
          {
            label: 'Somente PIX',
            description: 'Ver pagamentos por PIX',
            icon: Wallet,
            onClick: () => setActiveFilter('pix'),
          },
        ]}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir movimentação"
        description="Tem certeza que deseja excluir esta movimentação?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        confirming={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
