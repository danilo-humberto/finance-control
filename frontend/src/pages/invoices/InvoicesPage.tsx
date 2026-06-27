import { InvoiceFilters } from '@/components/invoices/InvoiceFilters';
import { InvoiceItemsList } from '@/components/invoices/InvoiceItemsList';
import { InvoiceSummaryCard } from '@/components/invoices/InvoiceSummaryCard';
import { Button } from '@/components/ui/Button';
import {
  mockInvoiceFilters,
  mockInvoiceItems,
  mockInvoiceSummary,
} from '@/mocks/financeMocks';
import { CreditCard, SlidersHorizontal } from 'lucide-react';

export function InvoicesPage() {
  const invoiceItems = mockInvoiceItems.filter(
    (item) => item.invoiceId === mockInvoiceSummary.id,
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.48rem] font-bold leading-tight text-app-text">
            Fatura
          </h1>
          <p className="mt-1 text-[0.86rem] leading-5 text-app-muted">
            Acompanhe seus gastos por fatura
          </p>
        </div>

        <button
          type="button"
          aria-label="Abrir filtros da fatura"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-800/60 bg-app-icon text-brand-400 shadow-lg shadow-brand-950/25 transition-colors hover:bg-brand-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <div className="space-y-3">
        <InvoiceSummaryCard invoice={mockInvoiceSummary} />

        <div className="flex justify-center gap-3" aria-label="Indicador de cartoes">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          <span className="h-2 w-2 rounded-full bg-app-elevated" />
          <span className="h-2 w-2 rounded-full bg-app-elevated" />
        </div>
      </div>

      <InvoiceFilters filters={mockInvoiceFilters} />

      <InvoiceItemsList items={invoiceItems} total={mockInvoiceSummary.total} />

      <Button
        type="button"
        size="lg"
        leftIcon={<CreditCard aria-hidden="true" className="h-4 w-4" />}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.92rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
      >
        Marcar fatura como paga
      </Button>
    </div>
  );
}
