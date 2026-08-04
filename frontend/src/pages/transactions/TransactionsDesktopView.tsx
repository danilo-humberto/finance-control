import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  CreditCard,
  Edit3,
  LayoutGrid,
  LoaderCircle,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useState, type FocusEvent, type KeyboardEvent } from 'react';

import { AuthMessage } from '@/components/auth/AuthMessage';
import {
  TransactionCategoryIcon,
  type TransactionListItemData,
} from '@/components/transactions/TransactionListItem';
import { type TransactionFilter } from '@/components/transactions/TransactionsFilters';
import { type TransactionsSummaryData } from '@/components/transactions/TransactionsSummary';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';

export type DesktopTransactionGroup = {
  key: 'today' | 'yesterday' | 'week' | 'older';
  label: string;
  transactions: TransactionListItemData[];
};

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

type TransactionsDesktopViewProps = {
  activeFilter: TransactionFilter;
  feedbackMessage: FeedbackMessage;
  groups: DesktopTransactionGroup[];
  hasMoreTransactions: boolean;
  loadError: string | null;
  loading: boolean;
  loadingMore: boolean;
  searchTerm: string;
  summary: TransactionsSummaryData;
  onAdvancedFiltersClick: () => void;
  onCreateClick: () => void;
  onDeleteTransaction: (transaction: TransactionListItemData) => void;
  onEditTransaction: (transaction: TransactionListItemData) => void;
  onFilterChange: (filter: TransactionFilter) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
};

type SummaryItem = {
  icon: LucideIcon;
  label: string;
  tone: 'income' | 'expense' | 'balance';
  value: number;
};

type FilterOption = {
  icon: LucideIcon;
  label: string;
  value: TransactionFilter;
};

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'Todas', icon: LayoutGrid },
  { value: 'income', label: 'Entradas', icon: ArrowUp },
  { value: 'expense', label: 'Saídas', icon: ArrowDown },
  { value: 'card', label: 'Cartão', icon: CreditCard },
  { value: 'pix', label: 'PIX', icon: Wallet },
];

export function TransactionsDesktopView({
  activeFilter,
  feedbackMessage,
  groups,
  hasMoreTransactions,
  loadError,
  loading,
  loadingMore,
  searchTerm,
  summary,
  onAdvancedFiltersClick,
  onCreateClick,
  onDeleteTransaction,
  onEditTransaction,
  onFilterChange,
  onLoadMore,
  onRetry,
  onSearchChange,
}: TransactionsDesktopViewProps) {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-bold leading-tight text-app-text">
            Movimentações
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Todas as suas entradas e saídas
          </p>
        </div>

        <Button
          type="button"
          onClick={onCreateClick}
          leftIcon={<Plus aria-hidden="true" className="h-5 w-5" />}
          className="h-11 shrink-0 rounded-xl px-5"
        >
          Nova compra
        </Button>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <DesktopTransactionsSummary summary={summary} />

      <DesktopTransactionsFilters
        activeFilter={activeFilter}
        searchTerm={searchTerm}
        onAdvancedFiltersClick={onAdvancedFiltersClick}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
      />

      {loading ? (
        <DesktopTransactionsLoadingState />
      ) : loadError ? (
        <EmptyState
          title="Não foi possível carregar as movimentações"
          description={loadError}
          icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
          action={
            <Button type="button" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          }
        />
      ) : groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <DesktopTransactionGroupSection
              key={group.key}
              group={group}
              onDeleteTransaction={onDeleteTransaction}
              onEditTransaction={onEditTransaction}
            />
          ))}

          {hasMoreTransactions ? (
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full rounded-xl text-brand-400"
              loading={loadingMore}
              onClick={onLoadMore}
              leftIcon={<ChevronDown aria-hidden="true" className="h-4 w-4" />}
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
            <Button type="button" size="sm" onClick={onCreateClick}>
              Nova compra
            </Button>
          }
        />
      )}
    </div>
  );
}

function DesktopTransactionsSummary({
  summary,
}: {
  summary: TransactionsSummaryData;
}) {
  const { formatCurrency } = usePreferences();
  const items: SummaryItem[] = [
    { label: 'Entradas', value: summary.income, icon: ArrowUp, tone: 'income' },
    { label: 'Saídas', value: summary.expense, icon: ArrowDown, tone: 'expense' },
    { label: 'Saldo', value: summary.balance, icon: Wallet, tone: 'balance' },
  ];

  return (
    <section
      aria-label="Resumo de movimentações"
      className="grid grid-cols-3 overflow-hidden rounded-2xl border border-app-border bg-app-surface/55 shadow-lg shadow-black/15"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isDanger = item.tone === 'expense' || (item.tone === 'balance' && item.value < 0);

        return (
          <article
            key={item.label}
            className="flex min-h-28 items-center gap-4 border-l border-app-border px-6 py-5 first:border-l-0"
          >
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400',
                item.tone === 'expense' && 'bg-red-500/20 text-red-400',
              )}
            >
              <Icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-app-muted">{item.label}</p>
              <p
                className={cn(
                  'mt-2 truncate text-xl font-bold text-brand-400',
                  isDanger && 'text-red-400',
                )}
              >
                {formatCurrency(Math.abs(item.value))}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function DesktopTransactionsFilters({
  activeFilter,
  searchTerm,
  onAdvancedFiltersClick,
  onFilterChange,
  onSearchChange,
}: Pick<
  TransactionsDesktopViewProps,
  | 'activeFilter'
  | 'searchTerm'
  | 'onAdvancedFiltersClick'
  | 'onFilterChange'
  | 'onSearchChange'
>) {
  return (
    <section className="space-y-4" aria-label="Filtros de movimentações">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <label className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-app-muted"
          />
          <input
            type="search"
            aria-label="Buscar movimentação"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar movimentação"
            className="h-12 w-full rounded-2xl border border-app-border bg-app-surface/55 pl-12 pr-4 text-sm text-app-text outline-none transition-colors placeholder:text-app-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>

        <Button
          type="button"
          variant="secondary"
          onClick={onAdvancedFiltersClick}
          leftIcon={
            <SlidersHorizontal
              aria-hidden="true"
              className="h-4 w-4 text-brand-400"
            />
          }
          className="h-12 rounded-2xl px-5"
        >
          Filtros
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === activeFilter;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onFilterChange(option.value)}
              className={cn(
                'inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive
                  ? 'border-brand-600 bg-brand-950/45 text-brand-400'
                  : 'border-app-border bg-app-surface/40 text-app-muted hover:bg-app-elevated hover:text-app-text',
              )}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DesktopTransactionGroupSection({
  group,
  onDeleteTransaction,
  onEditTransaction,
}: {
  group: DesktopTransactionGroup;
  onDeleteTransaction: (transaction: TransactionListItemData) => void;
  onEditTransaction: (transaction: TransactionListItemData) => void;
}) {
  return (
    <section className="space-y-3" aria-labelledby={`desktop-group-${group.key}`}>
      <h2
        id={`desktop-group-${group.key}`}
        className="text-base font-semibold text-app-text"
      >
        {group.label}
      </h2>
      <div className="overflow-visible rounded-2xl border border-app-border bg-app-surface/45 shadow-lg shadow-black/10">
        {group.transactions.map((transaction) => (
          <DesktopTransactionRow
            key={transaction.id}
            transaction={transaction}
            onDelete={() => onDeleteTransaction(transaction)}
            onEdit={() => onEditTransaction(transaction)}
          />
        ))}
      </div>
    </section>
  );
}

function DesktopTransactionRow({
  transaction,
  onDelete,
  onEdit,
}: {
  transaction: TransactionListItemData;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  const isIncome = transaction.transactionType === 'INCOME';

  function handleMenuBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setMenuOpen(false);
    }
  }

  function handleEdit() {
    setMenuOpen(false);
    onEdit();
  }

  function handleDelete() {
    setMenuOpen(false);
    onDelete();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  }

  return (
    <article className="grid min-h-[5.25rem] grid-cols-[3rem_minmax(0,1fr)_5.5rem_7.5rem_2rem] items-center gap-4 border-b border-app-border/80 px-4 py-3 transition-colors last:border-b-0 hover:bg-app-elevated/25 xl:grid-cols-[3rem_minmax(0,1fr)_10rem_5.5rem_7.5rem_2rem]">
      <TransactionCategoryIcon
        color={transaction.categoryColor}
        icon={transaction.categoryIcon}
        className="h-11 w-11"
      />

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-app-text">
          {transaction.description}
        </h3>
        <p className="mt-1 truncate text-xs text-app-muted">
          {transaction.categoryName} • {transaction.paymentLabel}
        </p>
      </div>

      <div className="hidden min-w-0 items-center gap-2 text-sm text-app-muted xl:flex">
        <CreditCard aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="truncate">{transaction.paymentLabel}</span>
      </div>

      <time className="text-right text-xs text-app-muted">
        {formatDateLabel(transaction.timeLabel)}
      </time>

      <p
        className={cn(
          'truncate text-right text-sm font-semibold',
          isIncome ? 'text-brand-400' : 'text-red-400',
        )}
      >
        {isIncome ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
      </p>

      <div
        className="relative flex justify-end"
        onBlur={handleMenuBlur}
        onKeyDown={handleMenuKeyDown}
      >
        <button
          type="button"
          aria-label={`Abrir ações de ${transaction.description}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-lg p-1.5 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <MoreVertical aria-hidden="true" className="h-4 w-4" />
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-app-border bg-app-surface p-1.5 shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={handleEdit}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Edit3 aria-hidden="true" className="h-4 w-4 text-brand-400" />
              Editar movimentação
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-danger-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Excluir movimentação
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DesktopTransactionsLoadingState() {
  return (
    <div className="space-y-6" aria-label="Carregando movimentações">
      {[0, 1].map((group) => (
        <section key={group} className="space-y-3">
          <div className="h-5 w-36 animate-pulse rounded-full bg-app-elevated" />
          <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/45">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid min-h-[5.25rem] grid-cols-[3rem_minmax(0,1fr)_10rem_5.5rem_7.5rem_2rem] items-center gap-4 border-b border-app-border/80 px-4 py-3 last:border-b-0"
              >
                <div className="h-11 w-11 animate-pulse rounded-full bg-app-elevated" />
                {[0, 1, 2, 3].map((column) => (
                  <div
                    key={column}
                    className="h-3 animate-pulse rounded-full bg-app-elevated"
                  />
                ))}
                <div className="h-4 w-4 animate-pulse rounded-full bg-app-elevated" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
