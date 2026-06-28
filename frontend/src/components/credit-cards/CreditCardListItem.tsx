import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

import {
  CreditCardPreview,
  type CreditCardPreviewData,
} from './CreditCardPreview';

export type CreditCardListItemData = CreditCardPreviewData & {
  limit: number;
  used: number;
  currentInvoiceTotal: number;
  dueDateLabel: string;
  closingDay: number;
  dueDay: number;
};

type CreditCardListItemProps = {
  card: CreditCardListItemData;
  onMenuClick: (card: CreditCardListItemData) => void;
};

export function CreditCardListItem({
  card,
  onMenuClick,
}: CreditCardListItemProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const usedPercentage =
    card.limit > 0 ? Math.floor((card.used / card.limit) * 100) : 0;
  const progress = Math.min(Math.max(usedPercentage, 0), 100);

  return (
    <article className="grid grid-cols-[5.75rem_1fr] gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
      <CreditCardPreview card={card} />

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[0.92rem] font-semibold leading-5 text-app-text">
              {card.name}
            </h3>
          </div>

          <button
            type="button"
            aria-label={`Mais acoes do cartao ${card.name}`}
            onClick={() => onMenuClick(card)}
            className="shrink-0 rounded-full p-1 text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_5rem] gap-2">
          <div className="min-w-0">
            <p className="text-[0.66rem] leading-3 text-app-muted">Fatura atual</p>
            <p className="truncate text-[0.98rem] font-bold leading-5 text-app-text">
              {formatCurrency(card.currentInvoiceTotal)}
            </p>
            <p className="truncate text-[0.66rem] leading-3 text-app-muted">
              Vencimento {formatDateLabel(card.dueDateLabel)}
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-[0.6rem] leading-3 text-app-muted">Limite</p>
            <p className="truncate text-[0.7rem] font-semibold leading-3 text-app-text">
              {formatCurrency(card.limit)}
            </p>
            <p className="mt-0.5 text-[0.6rem] leading-3 text-app-muted">Utilizado</p>
            <p className="truncate text-[0.7rem] font-semibold leading-3 text-brand-400">
              {formatCurrency(card.used)}
            </p>
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <div
            className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-app-elevated"
            role="progressbar"
            aria-label={`Uso do limite do cartao ${card.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className={cn(
                'h-full rounded-full',
                progress > 0 ? 'bg-brand-500' : 'bg-transparent',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-7 text-right text-[0.66rem] font-medium text-brand-400">
            {progress}%
          </span>
        </div>
      </div>
    </article>
  );
}
