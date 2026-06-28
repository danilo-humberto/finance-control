import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type InvoiceInstallment } from '@/types/invoice';
import { LoaderCircle, Receipt } from 'lucide-react';

import { InvoiceItem } from './InvoiceItem';

type InvoiceItemsListProps = {
  items: InvoiceInstallment[];
  total: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNewPurchase: () => void;
  onItemActionClick: (item: InvoiceInstallment) => void;
};

export function InvoiceItemsList({
  items,
  total,
  loading,
  error,
  onRetry,
  onNewPurchase,
  onItemActionClick,
}: InvoiceItemsListProps) {
  const { formatCurrency } = usePreferences();

  return (
    <section className="space-y-2" aria-labelledby="invoice-items-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="invoice-items-title" className="text-[0.94rem] font-semibold leading-tight">
          Itens da fatura
        </h2>

        <p className="shrink-0 rounded-full bg-app-surface/80 px-2 py-1 text-[0.68rem] font-medium text-app-text">
          Total:{' '}
          <span className="font-semibold text-brand-400">
            {formatCurrency(total)}
          </span>
        </p>
      </div>

      {loading ? (
        <InvoiceItemsLoadingState />
      ) : error ? (
        <EmptyState
          icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
          title="Não foi possível carregar a fatura"
          description={error}
          action={
            <Button type="button" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          }
        />
      ) : items.length > 0 ? (
        <ul className="overflow-hidden rounded-[1.15rem] border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(index > 0 && 'border-t border-app-border')}
            >
              <InvoiceItem item={item} onActionClick={onItemActionClick} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Receipt aria-hidden="true" className="h-5 w-5" />}
          title="Nenhum item nesta fatura"
          description="As compras lançadas para este mês aparecerão aqui."
          action={
            <Button type="button" size="sm" onClick={onNewPurchase}>
              Nova compra
            </Button>
          }
        />
      )}
    </section>
  );
}

function InvoiceItemsLoadingState() {
  return (
    <ul
      className="overflow-hidden rounded-[1.15rem] border border-app-border bg-app-surface/75 shadow-lg shadow-black/15"
      aria-label="Carregando itens da fatura"
    >
      {[0, 1, 2, 3].map((item, index) => (
        <li
          key={item}
          className={cn(
            'flex min-h-[3.8rem] items-center gap-2.5 px-2.5 py-2',
            index > 0 && 'border-t border-app-border',
          )}
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-app-elevated" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-32 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-2.5 w-40 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-app-elevated" />
          </div>
          <div className="h-3 w-14 animate-pulse rounded-full bg-app-elevated" />
        </li>
      ))}
    </ul>
  );
}
