import {
  CalendarDays,
  Check,
  ChevronsUpDown,
  CreditCard,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Receipt,
  Repeat,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { useId, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { type InvoiceFilterOption } from '@/components/invoices/InvoiceFilters';
import { type InvoiceSummaryData } from '@/components/invoices/InvoiceSummaryCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type InvoiceInstallment } from '@/types/invoice';

type InvoiceCategoryBreakdown = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
};

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

type InvoicesDesktopViewProps = {
  cardOptions: InvoiceFilterOption[];
  categoryBreakdown: InvoiceCategoryBreakdown[];
  categoryOptions: InvoiceFilterOption[];
  feedbackMessage: FeedbackMessage;
  filteredTotal: number;
  invoice: InvoiceSummaryData;
  items: InvoiceInstallment[];
  loading: boolean;
  loadError: string | null;
  monthOptions: InvoiceFilterOption[];
  selectedCardId: string;
  selectedCategoryId: string;
  selectedMonthId: string;
  onCardChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onItemActionClick: (item: InvoiceInstallment) => void;
  onMonthChange: (value: string) => void;
  onNewPurchase: () => void;
  onRetry: () => void;
  isPayDisabled?: boolean;
  isPaying?: boolean;
  onPayInvoice?: () => void;
};

type DesktopFilterConfig = {
  ariaLabel: string;
  emptyMessage: string;
  icon: LucideIcon;
  label: string;
  onChange: (value: string) => void;
  options: InvoiceFilterOption[];
  searchPlaceholder: string;
  value: string;
};

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function InvoicesDesktopView({
  cardOptions,
  categoryBreakdown,
  categoryOptions,
  feedbackMessage,
  filteredTotal,
  invoice,
  items,
  loading,
  loadError,
  monthOptions,
  selectedCardId,
  selectedCategoryId,
  selectedMonthId,
  onCardChange,
  onCategoryChange,
  onItemActionClick,
  onMonthChange,
  onNewPurchase,
  onRetry,
  isPayDisabled = false,
  isPaying = false,
  onPayInvoice,
}: InvoicesDesktopViewProps) {
  const filters: DesktopFilterConfig[] = [
    {
      label: 'Mês da fatura',
      ariaLabel: 'Filtrar fatura por mês',
      icon: CalendarDays,
      options: monthOptions,
      searchPlaceholder: 'Buscar mês...',
      emptyMessage: 'Nenhum mês encontrado.',
      value: selectedMonthId,
      onChange: onMonthChange,
    },
    {
      label: 'Cartão',
      ariaLabel: 'Filtrar fatura por cartão',
      icon: CreditCard,
      options: cardOptions,
      searchPlaceholder: 'Buscar cartão...',
      emptyMessage: 'Nenhum cartão encontrado.',
      value: selectedCardId,
      onChange: onCardChange,
    },
    {
      label: 'Categoria da tabela',
      ariaLabel: 'Filtrar itens da fatura por categoria',
      icon: Tag,
      options: categoryOptions,
      searchPlaceholder: 'Buscar categoria...',
      emptyMessage: 'Nenhuma categoria encontrada.',
      value: selectedCategoryId,
      onChange: onCategoryChange,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-bold leading-tight text-app-text">
            Faturas
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Acompanhe seus gastos por fatura
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onPayInvoice ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isPayDisabled}
              loading={isPaying}
              onClick={onPayInvoice}
              leftIcon={<CreditCard aria-hidden="true" className="h-4 w-4" />}
              className="h-11 shrink-0 rounded-xl px-4"
            >
              {isPayDisabled && items.length > 0 && items.every((i) => i.status === 'PAID')
                ? 'Fatura já paga'
                : 'Marcar fatura como paga'}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onNewPurchase}
            leftIcon={<Plus aria-hidden="true" className="h-5 w-5" />}
            className="h-11 shrink-0 rounded-xl px-5"
          >
            Nova compra
          </Button>
        </div>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <section
        aria-label="Filtros da fatura"
        className="grid grid-cols-3 gap-3 rounded-2xl border border-app-border bg-app-surface/45 p-4 shadow-lg shadow-black/10"
      >
        {filters.map((filter) => (
          <DesktopFilterCombobox key={filter.ariaLabel} config={filter} />
        ))}
      </section>

      {loading ? (
        <InvoicesDesktopLoadingState />
      ) : loadError ? (
        <EmptyState
          icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
          title="Não foi possível carregar a fatura"
          description={loadError}
          action={
            <Button type="button" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          }
        />
      ) : (
        <>
          <section
            aria-label="Visão analítica da fatura"
            className="grid gap-6 xl:grid-cols-12"
          >
            <InvoiceUsagePanel invoice={invoice} />
            <CategoryBreakdownPanel categories={categoryBreakdown} />
          </section>

          <InvoiceItemsTable
            items={items}
            filteredTotal={filteredTotal}
            categoryFilterActive={Boolean(selectedCategoryId)}
            onItemActionClick={onItemActionClick}
            onNewPurchase={onNewPurchase}
          />
        </>
      )}
    </div>
  );
}

function DesktopFilterCombobox({ config }: { config: DesktopFilterConfig }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const Icon = config.icon;
  const disabled = config.options.every((option) => !option.id);
  const selectedOption = config.options.find(
    (option) => option.id === config.value,
  );

  return (
    <div className="min-w-0">
      <span className="mb-2 block text-xs font-medium text-app-muted">
        {config.label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={config.ariaLabel}
            disabled={disabled}
            className={cn(
              'flex h-11 w-full min-w-0 items-center rounded-xl border border-app-border bg-app-bg/45 px-3 text-left text-sm font-medium text-app-text transition-colors',
              'hover:bg-app-elevated/40 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <Icon
              aria-hidden="true"
              className="mr-3 h-4 w-4 shrink-0 text-app-muted"
            />
            <span className="min-w-0 flex-1 truncate">
              {selectedOption?.label ?? 'Selecionar'}
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="ml-3 h-4 w-4 shrink-0 text-app-muted"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder={config.searchPlaceholder} />
            <CommandList id={listId}>
              <CommandEmpty>{config.emptyMessage}</CommandEmpty>
              <CommandGroup>
                {config.options.map((option) => {
                  const selected = option.id === config.value;

                  return (
                    <CommandItem
                      key={option.id || `${config.ariaLabel}-all`}
                      value={option.id || `${config.ariaLabel}-all`}
                      keywords={[option.label]}
                      onSelect={() => {
                        config.onChange(option.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        aria-hidden="true"
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0 text-brand-400',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="min-w-0 truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function InvoiceUsagePanel({ invoice }: { invoice: InvoiceSummaryData }) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const hasLimit = invoice.limit > 0;
  const availableAmount = invoice.limit - invoice.total;
  const exceeded = hasLimit && availableAmount < 0;
  const visualUsedAmount = hasLimit
    ? Math.min(Math.max(invoice.total, 0), invoice.limit)
    : 0;
  const remainingAmount = hasLimit
    ? Math.max(invoice.limit - visualUsedAmount, 0)
    : 1;
  const chartData = hasLimit
    ? [
        {
          name: 'Utilizado',
          value: visualUsedAmount,
          color: exceeded ? 'rgb(var(--color-danger))' : '#31d667',
        },
        {
          name: 'Disponível',
          value: remainingAmount,
          color: 'rgb(var(--color-bg-elevated))',
        },
      ]
    : [
        {
          name: 'Limite não informado',
          value: 1,
          color: 'rgb(var(--color-bg-elevated))',
        },
      ];
  const usageLabel = hasLimit
    ? `${Math.max(invoice.usedPercentage, 0)}% utilizado`
    : 'Limite não informado';

  return (
    <article className="rounded-2xl border border-app-border bg-app-surface/60 p-6 shadow-lg shadow-black/15 xl:col-span-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg shadow-black/20"
          style={{ backgroundColor: invoice.cardColor }}
          aria-hidden="true"
        >
          {invoice.cardLogo}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-app-text">
            {invoice.cardName}
          </h2>
          <p className={cn("mt-1 text-xs font-medium", invoice.status === 'PAID' ? "text-emerald-400" : "text-brand-400")}>
            {invoice.status === 'PAID' ? 'Fatura paga' : 'Fatura aberta'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_10rem] items-center gap-5">
        <div className="min-w-0">
          <p className="text-sm text-app-muted">Total da fatura</p>
          <strong className="mt-2 block truncate text-3xl font-bold leading-none text-app-text">
            {formatCurrency(invoice.total)}
          </strong>
          <p
            className={cn(
              'mt-3 text-sm font-semibold text-brand-400',
              exceeded && 'text-danger-text',
            )}
          >
            {usageLabel}
          </p>
        </div>

        <div
          className="relative h-40 w-40"
          role="img"
          aria-label={
            hasLimit
              ? `Uso do limite do cartão: ${usageLabel}`
              : 'Uso do limite do cartão: limite não informado'
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="88%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive="auto"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <strong
              className={cn(
                'text-2xl font-bold text-app-text',
                exceeded && 'text-danger-text',
              )}
            >
              {hasLimit ? `${Math.max(invoice.usedPercentage, 0)}%` : '-'}
            </strong>
            <span className="mt-1 text-[0.7rem] text-app-muted">
              {hasLimit ? 'utilizado' : 'sem limite'}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-app-border pt-5">
        <SummaryDetail
          label="Limite"
          value={hasLimit ? formatCurrency(invoice.limit) : 'Não informado'}
        />
        <SummaryDetail
          label={exceeded ? 'Limite excedido' : 'Disponível'}
          value={
            hasLimit
              ? formatCurrency(Math.abs(availableAmount))
              : 'Não informado'
          }
          danger={exceeded}
        />
        <SummaryDetail
          label="Vencimento"
          value={formatDateLabel(invoice.dueDate)}
        />
        <SummaryDetail
          label="Fechamento"
          value={formatDateLabel(invoice.closingDate)}
        />
      </dl>
    </article>
  );
}

function SummaryDetail({
  danger = false,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-app-muted">{label}</dt>
      <dd
        className={cn(
          'mt-1 truncate text-sm font-semibold text-app-text',
          danger && 'text-danger-text',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function CategoryBreakdownPanel({
  categories,
}: {
  categories: InvoiceCategoryBreakdown[];
}) {
  const { formatCurrency } = usePreferences();
  const chartHeight = Math.max(256, categories.length * 52);

  const renderCategoryLabel = ({
    height,
    index,
    width,
    x,
    y,
  }: LabelProps) => {
    const category = typeof index === 'number' ? categories[index] : undefined;

    if (!category || x == null || y == null || width == null || height == null) {
      return <g />;
    }

    const labelX = Number(x) + Number(width) + 10;
    const labelY = Number(y) + Number(height) / 2;

    return (
      <text
        x={labelX}
        y={labelY}
        dominantBaseline="middle"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        <tspan
          fill="rgb(var(--color-text-secondary))"
          fontSize={11}
        >
          {percentageFormatter.format(category.percentage)}%
        </tspan>
        <tspan
          dx={12}
          fill="rgb(var(--color-text-primary))"
          fontSize={11}
          fontWeight={600}
        >
          {formatCurrency(category.amount)}
        </tspan>
      </text>
    );
  };

  return (
    <article className="rounded-2xl border border-app-border bg-app-surface/60 p-6 shadow-lg shadow-black/15 xl:col-span-7">
      <div>
        <h2 className="text-base font-semibold text-app-text">
          Gastos por categoria
        </h2>
        <p className="mt-1 text-xs leading-5 text-app-muted">
          Participação de cada categoria no total da fatura
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="mt-5">
          <div
            style={{ height: chartHeight }}
            role="img"
            aria-label="Gráfico horizontal de gastos por categoria"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                data={categories}
                layout="vertical"
                margin={{ top: 4, right: 164, bottom: 4, left: 0 }}
              >
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={88}
                  tick={{
                    fill: 'rgb(var(--color-text-secondary))',
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  cursor={{ fill: 'rgb(var(--color-bg-elevated) / 0.35)' }}
                  contentStyle={{
                    background: 'rgb(var(--color-bg-secondary))',
                    border: '1px solid rgb(var(--color-border))',
                    borderRadius: 12,
                    color: 'rgb(var(--color-text-primary))',
                  }}
                  labelStyle={{ color: 'rgb(var(--color-text-primary))' }}
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    'Total',
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="#31d667"
                  maxBarSize={18}
                  radius={[0, 6, 6, 0]}
                  isAnimationActive="auto"
                >
                  <LabelList content={renderCategoryLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="sr-only" aria-label="Valores por categoria">
            {categories.map((category) => (
              <li key={category.id}>
                {category.name}:{' '}
                {percentageFormatter.format(category.percentage)}%,{' '}
                {formatCurrency(category.amount)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-app-border bg-app-bg/25 px-6 text-center">
          <div>
            <Receipt aria-hidden="true" className="mx-auto h-6 w-6 text-app-muted" />
            <p className="mt-3 text-sm font-semibold text-app-text">
              Nenhum gasto para analisar
            </p>
            <p className="mt-1 text-xs leading-5 text-app-muted">
              A distribuição aparecerá quando a fatura tiver compras.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function InvoiceItemsTable({
  categoryFilterActive,
  filteredTotal,
  items,
  onItemActionClick,
  onNewPurchase,
}: {
  categoryFilterActive: boolean;
  filteredTotal: number;
  items: InvoiceInstallment[];
  onItemActionClick: (item: InvoiceInstallment) => void;
  onNewPurchase: () => void;
}) {
  const { formatCurrency, formatDateLabel } = usePreferences();

  return (
    <section className="space-y-3" aria-labelledby="desktop-invoice-items-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="desktop-invoice-items-title"
            className="text-base font-semibold text-app-text"
          >
            Itens da fatura
          </h2>
          <p className="mt-1 text-xs text-app-muted">
            {items.length} {items.length === 1 ? 'compra' : 'compras'}
            {categoryFilterActive ? ' na categoria selecionada' : ''}
          </p>
        </div>

        <p className="shrink-0 text-sm text-app-muted">
          {categoryFilterActive ? 'Subtotal' : 'Total'}:{' '}
          <strong className="text-app-text">
            {formatCurrency(filteredTotal)}
          </strong>
        </p>
      </div>

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/45 shadow-lg shadow-black/10">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[39%] xl:w-[29%]" />
              <col className="hidden w-[20%] xl:table-column" />
              <col className="w-[19%] xl:w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[20%] xl:w-[16%]" />
              <col className="w-[8%] xl:w-[5%]" />
            </colgroup>
            <thead className="bg-app-elevated/40 text-xs text-app-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Compra</th>
                <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                  Categoria
                </th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Parcela</th>
                <th className="px-4 py-3 text-right font-semibold">Valor</th>
                <th className="px-3 py-3 text-right font-semibold">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-app-border transition-colors hover:bg-app-elevated/30"
                >
                  <td className="px-4 py-3">
                    <p className="truncate font-semibold text-app-text">
                      {item.description}
                    </p>
                    <p className="mt-1 truncate text-xs text-app-muted xl:hidden">
                      {item.category.name}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-app-muted xl:table-cell">
                    <span className="block truncate">{item.category.name}</span>
                  </td>
                  <td className="px-4 py-3 text-app-muted">
                    <time dateTime={item.transaction.purchaseDate}>
                      {formatDateLabel(
                        formatIsoDateToBr(item.transaction.purchaseDate),
                      )}
                    </time>
                  </td>
                  <td className="px-4 py-3 text-app-muted">
                    <div className="flex items-center gap-2">
                      <span>{item.transaction.recurringTransactionId ? (<span className="inline-flex items-center gap-1 font-medium text-brand-400"><Repeat aria-hidden="true" className="h-3.5 w-3.5" />Recorrente</span>) : item.totalInstallments > 1 ? `${item.installmentNumber}/${item.totalInstallments}` : 'À vista'}</span>
                      <Badge variant={item.status === 'PAID' ? 'success' : 'muted'} className="text-[0.62rem] px-1.5 py-0 leading-tight">
                        {item.status === 'PAID' ? 'Paga' : 'Aberta'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-app-text">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`Abrir ações de ${item.description}`}
                      onClick={() => onItemActionClick(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Receipt aria-hidden="true" className="h-5 w-5" />}
          title={
            categoryFilterActive
              ? 'Nenhuma compra nesta categoria'
              : 'Nenhum item nesta fatura'
          }
          description={
            categoryFilterActive
              ? 'Escolha outra categoria ou remova o filtro.'
              : 'As compras lançadas para este mês aparecerão aqui.'
          }
          action={
            categoryFilterActive ? undefined : (
              <Button type="button" size="sm" onClick={onNewPurchase}>
                Nova compra
              </Button>
            )
          }
        />
      )}
    </section>
  );
}

function InvoicesDesktopLoadingState() {
  return (
    <div className="space-y-6" aria-label="Carregando fatura">
      <section className="grid gap-6 xl:grid-cols-12">
        {[5, 7].map((columns) => (
          <div
            key={columns}
            className={cn(
              'min-h-[22rem] animate-pulse rounded-2xl border border-app-border bg-app-surface/45',
              columns === 5 ? 'xl:col-span-5' : 'xl:col-span-7',
            )}
          />
        ))}
      </section>

      <section className="space-y-3">
        <div className="h-5 w-36 animate-pulse rounded-full bg-app-elevated" />
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/45">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="grid min-h-[4.25rem] grid-cols-[minmax(0,1fr)_8rem_6rem_8rem_3rem] items-center gap-4 border-t border-app-border px-4 first:border-t-0"
            >
              {[0, 1, 2, 3, 4].map((column) => (
                <div
                  key={column}
                  className="h-3 animate-pulse rounded-full bg-app-elevated"
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatIsoDateToBr(value: string) {
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
