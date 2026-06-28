import { Badge } from '@/components/ui/Badge';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type DashboardCurrentInvoice } from '@/types/dashboard';
import { ChevronRight, MoreHorizontal, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';

type CurrentInvoiceCardProps = {
  invoice: DashboardCurrentInvoice;
};

const statusLabel: Record<DashboardCurrentInvoice['status'], string> = {
  OPEN: 'Aberta',
  PAID: 'Paga',
  CANCELED: 'Cancelada',
};

const statusVariant: Record<
  DashboardCurrentInvoice['status'],
  'default' | 'success' | 'danger'
> = {
  OPEN: 'default',
  PAID: 'success',
  CANCELED: 'danger',
};

export function CurrentInvoiceCard({ invoice }: CurrentInvoiceCardProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const progress = Math.min(Math.max(invoice.usedPercentage, 0), 100);

  return (
    <article className="w-[min(19rem,calc(100vw-5.5rem))] shrink-0 snap-start rounded-2xl border border-brand-800/65 bg-[radial-gradient(circle_at_top_left,rgba(49,214,103,0.12),transparent_43%),#141517] p-3.5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg shadow-black/25"
            style={{ backgroundColor: invoice.cardColor }}
            aria-hidden="true"
          >
            {invoice.cardLogo}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-app-text">
                {invoice.cardName}
              </h3>
              <Badge
                variant={statusVariant[invoice.status]}
                className="px-1.5 py-0 text-[0.6rem]"
              >
                {statusLabel[invoice.status]}
              </Badge>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label={`Mais opções da fatura ${invoice.cardName}`}
          className="rounded-full p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-[0.82rem] text-app-muted">
        Vencimento dia {formatDateLabel(invoice.dueDate)}
      </p>

      <strong className="mt-2.5 block text-[1.72rem] font-bold leading-tight tracking-normal text-app-text">
        {formatCurrency(invoice.total)}
      </strong>

      <div className="mt-3 flex items-center justify-between gap-3 text-[0.68rem]">
        <span className="font-medium text-brand-400">{progress}% utilizado</span>
        <span className="text-app-muted">
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

      <Link
        to="/invoices"
        className={cn(
          'mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-app-border bg-brand-950/35 px-3 text-[0.82rem] font-semibold text-app-text transition-colors',
          'hover:border-brand-700/70 hover:bg-app-icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        )}
      >
        <ScanLine aria-hidden="true" className="h-4 w-4 text-brand-400" />
        Ver fatura
        <ChevronRight aria-hidden="true" className="ml-auto h-5 w-5 text-brand-400" />
      </Link>
    </article>
  );
}
