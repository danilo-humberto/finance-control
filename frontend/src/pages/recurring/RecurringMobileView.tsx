import { LoaderCircle, Plus, Repeat, Search, Trash2 } from 'lucide-react';

import { TransactionCategoryIcon } from '@/components/transactions/TransactionListItem';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type RecurringTransaction } from '@/types/recurring-transaction';

export type RecurringStatusFilter = 'all' | 'active' | 'inactive';

export type RecurringSummaryData = {
  totalMonthly: number;
  activeCount: number;
  inactiveCount: number;
};

type RecurringMobileViewProps = {
  items: RecurringTransaction[];
  loading: boolean;
  loadError: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: RecurringStatusFilter;
  onStatusFilterChange: (filter: RecurringStatusFilter) => void;
  summary: RecurringSummaryData;
  onRetry: () => void;
  onNewRecurring: () => void;
  onCancelClick: (item: RecurringTransaction) => void;
};

const filterTabs: { label: string; value: RecurringStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativas', value: 'active' },
  { label: 'Canceladas', value: 'inactive' },
];

export function RecurringMobileView({
  items,
  loading,
  loadError,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  summary,
  onRetry,
  onNewRecurring,
  onCancelClick,
}: RecurringMobileViewProps) {
  const { formatCurrency } = usePreferences();

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Recorrências
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Assinaturas e despesas fixas
          </p>
        </div>

        <button
          type="button"
          aria-label="Nova recorrência"
          onClick={onNewRecurring}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      {/* Summary Cards */}
      <section aria-label="Resumo de recorrências" className="grid grid-cols-2 gap-2.5">
        <article className="rounded-2xl border border-app-border bg-app-surface/75 p-3.5 shadow-lg shadow-black/15">
          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-app-muted">
            Total mensal ativo
          </p>
          <p className="mt-1 truncate text-base font-bold text-brand-400">
            {formatCurrency(summary.totalMonthly)}
          </p>
        </article>
        <article className="rounded-2xl border border-app-border bg-app-surface/75 p-3.5 shadow-lg shadow-black/15">
          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-app-muted">
            Assinaturas ativas
          </p>
          <p className="mt-1 text-base font-bold text-app-text">
            {summary.activeCount}
          </p>
        </article>
      </section>

      {/* Filter Tabs */}
      <div className="flex rounded-xl border border-app-border bg-app-surface/60 p-1">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusFilterChange(tab.value)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-app-elevated text-brand-400 shadow-sm'
                  : 'text-app-muted hover:text-app-text',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
        />
        <Input
          type="search"
          placeholder="Buscar recorrência..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 pl-9 text-xs"
        />
      </div>

      {/* Items List */}
      {loading ? (
        <RecurringMobileLoadingState />
      ) : loadError ? (
        <EmptyState
          title="Não foi possível carregar as recorrências"
          description={loadError}
          icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
          action={
            <Button type="button" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          }
        />
      ) : items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/60 shadow-lg shadow-black/15">
          {items.map((item) => {
            const paymentName = item.creditCard?.name ?? (item.paymentMethod === 'CREDIT_CARD' ? 'Cartão' : item.paymentMethod);
            return (
              <article
                key={item.id}
                className="grid min-h-[4.5rem] grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-app-border/80 p-3 last:border-b-0 hover:bg-app-elevated/25"
              >
                <TransactionCategoryIcon
                  color={item.category?.color}
                  icon={item.category?.icon}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-semibold text-app-text">
                      {item.description}
                    </h2>
                    <Badge
                      variant={item.isActive ? 'success' : 'muted'}
                      className="px-1.5 py-0 text-[0.6rem] leading-tight"
                    >
                      {item.isActive ? 'Ativa' : 'Encerrada'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[0.7rem] text-app-muted">
                    {item.category?.name ?? 'Geral'} • {paymentName} • Todo dia {item.billingDay}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-right">
                  <div>
                    <span className="block text-xs font-bold text-app-text">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="block text-[0.62rem] text-app-muted">
                      / mês
                    </span>
                  </div>

                  {item.isActive ? (
                    <button
                      type="button"
                      aria-label={`Cancelar recorrência ${item.description}`}
                      onClick={() => onCancelClick(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-app-muted transition-colors hover:bg-danger-surface hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma recorrência encontrada"
          description={
            searchTerm
              ? 'Tente buscar com outro termo ou filtro.'
              : 'Cadastre suas assinaturas e despesas fixas para projetá-las automaticamente.'
          }
          icon={<Repeat aria-hidden="true" className="h-5 w-5" />}
          action={
            <Button type="button" size="sm" onClick={onNewRecurring}>
              Nova recorrência
            </Button>
          }
        />
      )}
    </div>
  );
}

function RecurringMobileLoadingState() {
  return (
    <div className="space-y-2.5" aria-label="Carregando recorrências">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-app-border bg-app-surface/60 p-3"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-app-elevated" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-2.5 w-24 animate-pulse rounded-full bg-app-elevated" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded-full bg-app-elevated" />
        </div>
      ))}
    </div>
  );
}
