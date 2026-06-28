import { Badge } from '@/components/ui/Badge';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type InstallmentStatus } from '@/types/invoice';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Info,
  MoreHorizontal,
} from 'lucide-react';

export type InvoiceSummaryData = {
  cardName: string;
  cardLogo: string;
  cardColor: string;
  status: InstallmentStatus;
  dueDate: string;
  closingDate: string;
  total: number;
  limit: number;
  openAmount: number;
  paidAmount: number;
  usedPercentage: number;
};

type InvoiceSummaryCardProps = {
  invoice: InvoiceSummaryData;
};

const statusLabel: Record<InstallmentStatus, string> = {
  OPEN: 'Aberta',
  PAID: 'Paga',
  CANCELED: 'Cancelada',
};

const statusVariant: Record<
  InstallmentStatus,
  'default' | 'success' | 'danger'
> = {
  OPEN: 'default',
  PAID: 'success',
  CANCELED: 'danger',
};

export function InvoiceSummaryCard({ invoice }: InvoiceSummaryCardProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const progress = Math.min(Math.max(invoice.usedPercentage, 0), 100);

  return (
    <article className="rounded-2xl border border-brand-800/65 bg-[radial-gradient(circle_at_top_left,rgba(49,214,103,0.12),transparent_46%),linear-gradient(135deg,rgba(12,25,20,0.94),rgba(12,15,17,0.98))] p-3 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-lg shadow-black/25"
            style={{ backgroundColor: invoice.cardColor }}
            aria-hidden="true"
          >
            {invoice.cardLogo}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[0.92rem] font-semibold leading-none text-app-text">
              {invoice.cardName}
            </h2>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-app-text" />
            <Badge
              variant={statusVariant[invoice.status]}
              className="ml-0.5 px-1.5 py-0 text-[0.58rem]"
            >
              {statusLabel[invoice.status]}
            </Badge>
          </div>
        </div>

        <button
          type="button"
          aria-label={`Mais opções da fatura ${invoice.cardName}`}
          className="rounded-full p-1 text-app-text transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="text-[0.72rem] leading-4 text-app-muted">Vencimento</p>
          <p className="mt-0.5 truncate text-[1rem] font-bold leading-tight text-brand-400">
            {formatDateLabel(invoice.dueDate)}
          </p>
        </div>

        <div className="min-w-0 border-l border-app-border pl-3">
          <p className="text-[0.72rem] leading-4 text-app-muted">
            Fechamento
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="truncate text-[0.82rem] font-semibold leading-tight text-app-text">
              {formatDateLabel(invoice.closingDate)}
            </p>
            <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-app-muted" />
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-app-border pt-3">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.72rem] leading-4 text-app-muted">Total da fatura</p>
            <strong className="mt-1 block truncate text-[1.54rem] font-bold leading-tight text-app-text">
              {formatCurrency(invoice.total)}
            </strong>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[0.72rem] leading-4 text-app-muted">Limite</p>
            <p className="mt-1 text-[0.82rem] font-semibold leading-tight text-brand-400">
              {formatCurrency(invoice.limit)}
            </p>
          </div>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-app-elevated"
          role="progressbar"
          aria-label={`Uso do limite do cartão ${invoice.cardName}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-[0.68rem] font-medium text-brand-400">
          {progress}% utilizado
        </p>
      </div>

      <button
        type="button"
        className={cn(
          'mt-3.5 flex h-9 w-full items-center gap-2 rounded-xl bg-brand-950/55 px-3 text-left text-[0.76rem] font-semibold text-app-text transition-colors',
          'hover:bg-brand-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        )}
      >
        <BarChart3 aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-400" />
        <span className="min-w-0 flex-1 truncate">
          Aberto: {formatCurrency(invoice.openAmount)} • Pago:{' '}
          {formatCurrency(invoice.paidAmount)}
        </span>
        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-400" />
      </button>
    </article>
  );
}
