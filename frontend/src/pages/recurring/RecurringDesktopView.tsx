import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Edit3,
  LoaderCircle,
  Plus,
  Repeat,
  Search,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { TransactionCategoryIcon } from '@/components/transactions/TransactionListItem';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type RecurringTransaction } from '@/types/recurring-transaction';
import {
  type RecurringStatusFilter,
  type RecurringSummaryData,
} from './RecurringMobileView';

type RecurringDesktopViewProps = {
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
  onEditClick: (item: RecurringTransaction) => void;
  onCancelClick: (item: RecurringTransaction) => void;
};

type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'brand' | 'success' | 'muted';
};

function DesktopSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'brand',
}: SummaryCardProps) {
  const iconClasses = {
    brand: 'bg-brand-500/15 text-brand-400',
    success: 'bg-emerald-500/15 text-emerald-400',
    muted: 'bg-app-elevated text-app-muted',
  };

  return (
    <article className="rounded-2xl border border-app-border bg-app-surface/60 p-5 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-app-muted">{title}</span>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            iconClasses[variant],
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-app-text">
        {value}
      </p>
      <p className="mt-1 text-xs text-app-muted">{description}</p>
    </article>
  );
}

const filterOptions: { label: string; value: RecurringStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativas', value: 'active' },
  { label: 'Canceladas', value: 'inactive' },
];

export function RecurringDesktopView({
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
  onEditClick,
  onCancelClick,
}: RecurringDesktopViewProps) {
  const { formatCurrency } = usePreferences();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-bold leading-tight text-app-text">
            Recorrências
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Gerencie despesas fixas, assinaturas e cobranças automáticas
          </p>
        </div>

        <Button
          type="button"
          onClick={onNewRecurring}
          leftIcon={<Plus aria-hidden="true" className="h-5 w-5" />}
          className="h-11 shrink-0 rounded-xl px-5"
        >
          Nova compra
        </Button>
      </header>

      {/* Summary Row */}
      <section
        aria-label="Resumo geral de recorrências"
        className="grid gap-4 md:grid-cols-3"
      >
        <DesktopSummaryCard
          title="Total mensal projetado"
          value={formatCurrency(summary.totalMonthly)}
          description="Soma de todas as assinaturas ativas"
          icon={Repeat}
          variant="brand"
        />
        <DesktopSummaryCard
          title="Assinaturas ativas"
          value={summary.activeCount}
          description="Cobranças com projeção contínua"
          icon={CheckCircle2}
          variant="success"
        />
        <DesktopSummaryCard
          title="Assinaturas encerradas"
          value={summary.inactiveCount}
          description="Recorrências canceladas"
          icon={XCircle}
          variant="muted"
        />
      </section>

      {/* Controls Bar */}
      <section
        aria-label="Filtros de recorrência"
        className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface/45 p-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            aria-label="Buscar recorrências"
            placeholder="Buscar por descrição, cartão ou categoria..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
            className="h-10 text-xs"
          />
        </div>

        <div className="flex rounded-xl border border-app-border bg-app-surface/60 p-1">
          {filterOptions.map((option) => {
            const isSelected = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors',
                  isSelected
                    ? 'bg-app-elevated text-brand-400 shadow-sm'
                    : 'text-app-muted hover:text-app-text',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Table or States */}
      {loading ? (
        <RecurringDesktopLoadingState />
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
        <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-surface/45 shadow-lg shadow-black/10">
          <table className="w-full min-w-[56rem] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[120px]" />
              <col className="w-[185px]" />
            </colgroup>
            <thead className="bg-app-elevated/40 text-xs text-app-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Assinatura</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Pagamento</th>
                <th className="px-4 py-3 font-semibold">Cobrança</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Valor</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const paymentLabel =
                  item.creditCard?.name ??
                  (item.paymentMethod === 'CREDIT_CARD' ? 'Cartão' : item.paymentMethod);
                return (
                  <tr
                    key={item.id}
                    className="border-t border-app-border transition-colors hover:bg-app-elevated/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <TransactionCategoryIcon
                          color={item.category?.color}
                          icon={item.category?.icon}
                          className="h-9 w-9"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-app-text">
                            {item.description}
                          </p>
                          <div className="mt-0.5">
                            <Badge
                              variant={item.isActive ? 'success' : 'muted'}
                              className="px-1.5 py-0 text-[0.62rem]"
                            >
                              {item.isActive ? 'Ativa' : 'Encerrada'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-app-muted">
                      <span className="truncate">
                        {item.category?.name ?? 'Geral'}
                        {item.subcategory?.name ? ` › ${item.subcategory.name}` : ''}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-app-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
                        <span className="truncate">{paymentLabel}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-app-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
                        Dia {item.billingDay}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-app-text whitespace-nowrap">
                      <div>
                        <span>{formatCurrency(item.amount)}</span>
                        <span className="block text-[0.7rem] font-normal text-app-muted">
                          / mês
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClick(item)}
                          className="h-8 px-2.5 text-xs text-app-muted hover:bg-app-elevated hover:text-app-text"
                          leftIcon={<Edit3 aria-hidden="true" className="h-3.5 w-3.5" />}
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelClick(item)}
                          className="h-8 px-2.5 text-xs text-red-400 hover:bg-danger-surface hover:text-red-300"
                          leftIcon={<Trash2 aria-hidden="true" className="h-3.5 w-3.5" />}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

function RecurringDesktopLoadingState() {
  return (
    <div className="space-y-3" aria-label="Carregando tabela de recorrências">
      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/45">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between border-b border-app-border/80 px-4 py-3.5 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-app-elevated" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 animate-pulse rounded-full bg-app-elevated" />
                <div className="h-2.5 w-16 animate-pulse rounded-full bg-app-elevated" />
              </div>
            </div>
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-3.5 w-16 animate-pulse rounded-full bg-app-elevated" />
          </div>
        ))}
      </div>
    </div>
  );
}
