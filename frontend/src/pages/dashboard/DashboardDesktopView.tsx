import {
  CalendarDays,
  CreditCard,
  DollarSign,
  FileText,
  LoaderCircle,
  Plus,
  Receipt,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import {
  type DashboardCurrentInvoice,
  type DashboardRecentTransaction,
} from '@/types/dashboard';

import { type DashboardPageData } from './useDashboardPageData';

type DashboardDesktopViewProps = DashboardPageData;

type SummaryCardProps = {
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  tone?: 'default' | 'success' | 'danger';
  title: string;
  value: string;
};

const maxPercent = 100;
const fallbackPaymentBadgeColors = [
  'bg-red-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-orange-500',
  'bg-emerald-500',
] as const;

function getFirstName(name?: string | null, email?: string | null) {
  const displayName = name?.trim() || email?.split('@')[0]?.trim() || '';

  return displayName.split(' ')[0] || 'Usuário';
}

function clampPercentage(value: number) {
  return Math.min(Math.max(Math.round(value), 0), maxPercent);
}

function parseDateLabel(value: string) {
  const [day, month, year] = value.split('/').map(Number);

  if (!day || !month || !year) {
    return Number.MAX_SAFE_INTEGER;
  }

  return new Date(year, month - 1, day).getTime();
}

function getNextInvoice(invoices: DashboardCurrentInvoice[]) {
  return [...invoices].sort(
    (firstInvoice, secondInvoice) =>
      parseDateLabel(firstInvoice.dueDate) -
      parseDateLabel(secondInvoice.dueDate),
  )[0];
}

function getInvoiceAmount(invoice: DashboardCurrentInvoice) {
  return invoice.openAmount || invoice.total;
}

function hexToRgba(color: string | null | undefined, alpha: number) {
  if (!color) {
    return undefined;
  }

  const normalizedColor = color.trim().replace('#', '');
  const hex =
    normalizedColor.length === 3
      ? normalizedColor
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalizedColor;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return undefined;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getCategoryPillStyle(color: string | null | undefined) {
  return {
    backgroundColor: hexToRgba(color, 0.16),
    borderColor: hexToRgba(color, 0.28),
    color: color || undefined,
  };
}

function getPaymentInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || '?';
}

function getPaymentBadgeClass(label: string) {
  const normalizedLabel = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalizedLabel.includes('santander')) {
    return 'bg-red-500';
  }

  if (normalizedLabel.includes('nubank')) {
    return 'bg-violet-500';
  }

  if (normalizedLabel.includes('itau')) {
    return 'bg-orange-500';
  }

  const colorIndex =
    Array.from(normalizedLabel).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % fallbackPaymentBadgeColors.length;

  return fallbackPaymentBadgeColors[colorIndex];
}

function formatSignedCurrency(
  value: number,
  formatCurrency: (value: number) => string,
) {
  if (value < 0) {
    return `-${formatCurrency(Math.abs(value))}`;
  }

  return `+${formatCurrency(value)}`;
}

export function DashboardDesktopView({
  invoices,
  invoiceError,
  invoicesLoading,
  onNewPurchase,
  onRetryInvoices,
  onRetryTransactions,
  transactions,
  transactionsError,
  transactionsLoading,
  userEmail,
  userName,
}: DashboardDesktopViewProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const firstName = getFirstName(userName, userEmail);
  const totalOpen = invoices.reduce(
    (total, invoice) => total + getInvoiceAmount(invoice),
    0,
  );
  const totalLimit = invoices.reduce((total, invoice) => total + invoice.limit, 0);
  const usedLimitPercentage =
    totalLimit > 0 ? clampPercentage((totalOpen / totalLimit) * 100) : 0;
  const nextInvoice = getNextInvoice(invoices);
  const recentTransactionsTotal = transactions.reduce(
    (total, transaction) => total + Math.abs(transaction.amount),
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-bold leading-tight text-app-text">
            Olá, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Aqui está o resumo da sua vida financeira.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            title="Filtro de período será ativado em uma etapa futura."
            className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-app-border bg-app-surface/70 px-4 text-sm font-medium text-app-muted"
          >
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            Período atual
          </button>

          <Button
            type="button"
            onClick={onNewPurchase}
            leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
            className="h-11 rounded-xl px-4"
          >
            Nova compra
          </Button>
        </div>
      </header>

      <section
        className="grid gap-4 xl:grid-cols-4"
        aria-label="Resumo financeiro"
      >
        <SummaryCard
          title="Total aberto"
          value={formatCurrency(totalOpen)}
          description={
            invoices.length > 0
              ? `${invoices.length} fatura${invoices.length === 1 ? '' : 's'} em aberto`
              : 'Nenhuma fatura aberta'
          }
          icon={DollarSign}
          loading={invoicesLoading}
        />
        <SummaryCard
          title="Limite utilizado"
          value={`${usedLimitPercentage}%`}
          description={`${formatCurrency(totalOpen)} de ${formatCurrency(totalLimit)}`}
          icon={CreditCard}
          loading={invoicesLoading}
        />
        <SummaryCard
          title="Próxima fatura"
          value={nextInvoice ? formatCurrency(getInvoiceAmount(nextInvoice)) : '--'}
          description={
            nextInvoice
              ? `${nextInvoice.cardName}, vencimento ${formatDateLabel(nextInvoice.dueDate)}`
              : 'Sem fatura carregada'
          }
          icon={FileText}
          loading={invoicesLoading}
          tone="success"
        />
        <SummaryCard
          title="Movimentações recentes"
          value={formatCurrency(recentTransactionsTotal)}
          description={`${transactions.length} lançamento${
            transactions.length === 1 ? '' : 's'
          } carregado${transactions.length === 1 ? '' : 's'}`}
          icon={Wallet}
          loading={transactionsLoading}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <RecentTransactionsDesktopTable
          error={transactionsError}
          loading={transactionsLoading}
          transactions={transactions}
          onRetry={onRetryTransactions}
        />
        <DashboardInvoicesPanel
          error={invoiceError}
          invoices={invoices}
          loading={invoicesLoading}
          onRetry={onRetryInvoices}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  description,
  icon: Icon,
  loading = false,
  tone = 'default',
  title,
  value,
}: SummaryCardProps) {
  return (
    <article className="min-h-[8.5rem] rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400',
            tone === 'danger' && 'bg-danger-surface text-danger-text',
            tone === 'success' && 'bg-success-surface text-success-text',
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-app-text">{title}</p>
          {loading ? (
            <div className="mt-4 h-7 w-32 animate-pulse rounded-full bg-app-elevated" />
          ) : (
            <strong className="mt-4 block truncate text-2xl font-bold leading-none text-app-text">
              {value}
            </strong>
          )}
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-app-muted">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

type RecentTransactionsDesktopTableProps = {
  error: string | null;
  loading: boolean;
  onRetry: () => void;
  transactions: DashboardRecentTransaction[];
};

function RecentTransactionsDesktopTable({
  error,
  loading,
  onRetry,
  transactions,
}: RecentTransactionsDesktopTableProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();

  return (
    <section
      className="rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15"
      aria-labelledby="dashboard-desktop-transactions-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="dashboard-desktop-transactions-title"
          className="text-base font-semibold text-app-text"
        >
          Últimas movimentações
        </h2>
        <Link
          to="/transactions"
          className="text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-app-border">
        {loading ? (
          <TransactionsTableSkeleton />
        ) : error ? (
          <EmptyState
            icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
            title="Não foi possível carregar as movimentações"
            description={error}
            action={
              <Button type="button" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            }
          />
        ) : transactions.length > 0 ? (
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-app-elevated/45 text-xs uppercase text-app-muted">
              <tr>
                <th className="w-[34%] px-4 py-3 font-semibold">Descrição</th>
                <th className="w-[20%] px-4 py-3 font-semibold">Categoria</th>
                <th className="w-[22%] px-4 py-3 font-semibold">
                  Cartão / Conta
                </th>
                <th className="w-[12%] px-4 py-3 font-semibold">Data</th>
                <th className="w-[12%] px-4 py-3 text-right font-semibold">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isIncome = transaction.transactionType === 'INCOME';

                return (
                  <tr
                    key={transaction.id}
                    className="border-t border-app-border transition-colors hover:bg-app-elevated/40"
                  >
                    <td className="min-w-0 px-4 py-3">
                      <Link
                        to="/transactions"
                        className="block truncate font-semibold text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {transaction.description}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex max-w-full items-center rounded-full border border-app-border bg-app-icon px-2.5 py-1 text-xs font-semibold text-brand-400"
                        style={getCategoryPillStyle(transaction.categoryColor)}
                      >
                        <span className="truncate">
                          {transaction.categoryName}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.paymentMethod === 'CREDIT_CARD' ? (
                        <span className="inline-flex max-w-full items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.66rem] font-bold leading-none text-white shadow-sm shadow-black/25',
                              getPaymentBadgeClass(transaction.paymentLabel),
                            )}
                          >
                            {getPaymentInitial(transaction.paymentLabel)}
                          </span>
                          <span className="truncate text-app-text">
                            {transaction.paymentLabel}
                          </span>
                        </span>
                      ) : (
                        <span className="block truncate text-app-muted">
                          {transaction.paymentLabel}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-app-muted">
                      {formatDateLabel(transaction.dateLabel)}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right font-semibold',
                        isIncome ? 'text-brand-400' : 'text-red-500',
                      )}
                    >
                      {formatSignedCurrency(transaction.amount, formatCurrency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<Receipt aria-hidden="true" className="h-5 w-5" />}
            title="Nenhuma movimentação ainda"
            description="Registre sua primeira compra para começar."
          />
        )}
      </div>
    </section>
  );
}

function TransactionsTableSkeleton() {
  return (
    <div aria-label="Carregando últimas movimentações">
      {[0, 1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="grid grid-cols-[2fr_1fr_1fr_0.75fr_0.75fr] gap-4 border-t border-app-border px-4 py-4 first:border-t-0"
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
  );
}

type DashboardInvoicesPanelProps = {
  error: string | null;
  invoices: DashboardCurrentInvoice[];
  loading: boolean;
  onRetry: () => void;
};

function DashboardInvoicesPanel({
  error,
  invoices,
  loading,
  onRetry,
}: DashboardInvoicesPanelProps) {
  return (
    <aside
      className="rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15"
      aria-labelledby="dashboard-desktop-invoices-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="dashboard-desktop-invoices-title"
          className="text-base font-semibold text-app-text"
        >
          Seus cartões e faturas
        </h2>
        <Link
          to="/invoices"
          className="text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <InvoicesPanelSkeleton />
        ) : error ? (
          <EmptyState
            icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
            title="Não foi possível carregar as faturas"
            description={error}
            action={
              <Button type="button" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            }
          />
        ) : invoices.length > 0 ? (
          invoices.map((invoice) => (
            <InvoicePanelItem key={invoice.id} invoice={invoice} />
          ))
        ) : (
          <EmptyState
            icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
            title="Nenhum cartão cadastrado"
            description="Cadastre um cartão para acompanhar suas faturas."
          />
        )}
      </div>
    </aside>
  );
}

function InvoicesPanelSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-app-border bg-app-bg/35 p-4"
        >
          <div className="h-4 w-32 animate-pulse rounded-full bg-app-elevated" />
          <div className="mt-4 h-6 w-28 animate-pulse rounded-full bg-app-elevated" />
          <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-app-elevated" />
        </div>
      ))}
    </>
  );
}

type InvoicePanelItemProps = {
  invoice: DashboardCurrentInvoice;
};

function InvoicePanelItem({ invoice }: InvoicePanelItemProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const amount = getInvoiceAmount(invoice);
  const progress = clampPercentage(invoice.usedPercentage);
  const invoiceUrl = `/invoices?creditCardId=${encodeURIComponent(
    invoice.creditCardId,
  )}&month=${invoice.month}&year=${invoice.year}`;

  return (
    <Link
      to={invoiceUrl}
      className="block rounded-xl border border-app-border bg-app-bg/35 p-4 transition-colors hover:bg-app-elevated/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg shadow-black/20"
          style={{ backgroundColor: invoice.cardColor }}
        >
          {invoice.cardLogo}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-app-text">
              {invoice.cardName}
            </h3>
            <span className="rounded-full bg-success-surface px-2 py-0.5 text-[0.68rem] font-semibold text-success-text">
              Aberta
            </span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            Vencimento {formatDateLabel(invoice.dueDate)}
          </p>
        </div>
      </div>

      <strong className="mt-4 block text-2xl font-bold leading-none text-app-text">
        {formatCurrency(amount)}
      </strong>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-brand-400">
          {progress}% utilizado
        </span>
        <span className="truncate text-app-muted">
          Limite: {formatCurrency(invoice.limit)}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-app-elevated"
        role="progressbar"
        aria-label={`Uso do limite do cartão ${invoice.cardName}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}
