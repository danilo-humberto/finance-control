import { EmptyState } from '@/components/ui/EmptyState';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type MockInvoiceItem } from '@/mocks/financeMocks';
import { Receipt } from 'lucide-react';

import { InvoiceItem } from './InvoiceItem';

type InvoiceItemsListProps = {
  items: MockInvoiceItem[];
  total: number;
};

export function InvoiceItemsList({ items, total }: InvoiceItemsListProps) {
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

      {items.length > 0 ? (
        <ul className="overflow-hidden rounded-[1.15rem] border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(index > 0 && 'border-t border-app-border')}
            >
              <InvoiceItem item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Receipt aria-hidden="true" className="h-5 w-5" />}
          title="Nenhum item na fatura"
          description="Os lançamentos desta fatura aparecerão aqui."
        />
      )}
    </section>
  );
}
