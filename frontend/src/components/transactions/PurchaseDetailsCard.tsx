import { type MockPurchaseFormDefaults } from '@/mocks/financeMocks';
import { CalendarDays, ChevronDown, DollarSign, Utensils, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

type PurchaseDetailsCardProps = {
  defaults: MockPurchaseFormDefaults;
};

const iconByName: Record<string, LucideIcon> = {
  Utensils,
};

export function PurchaseDetailsCard({ defaults }: PurchaseDetailsCardProps) {
  const CategoryIcon = iconByName[defaults.category.icon] ?? DollarSign;

  return (
    <section className="space-y-2" aria-labelledby="purchase-details-title">
      <h2 id="purchase-details-title" className="text-[0.94rem] font-semibold leading-tight">
        Detalhes
      </h2>

      <div className="space-y-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
        <PurchaseSelectRow
          label="Cartão"
          value={defaults.card.name}
          leading={
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: defaults.card.color }}
              aria-hidden="true"
            >
              {defaults.card.logo}
            </span>
          }
        />

        <PurchaseSelectRow
          label="Categoria"
          value={defaults.category.name}
          leading={<CategoryIcon aria-hidden="true" className="h-4 w-4 text-brand-400" />}
        />

        <PurchaseSelectRow
          label="Fatura"
          value={defaults.invoice.label}
          detail={defaults.invoice.closeDateLabel}
          leading={<CalendarDays aria-hidden="true" className="h-4 w-4 text-brand-400" />}
        />
      </div>
    </section>
  );
}

type PurchaseSelectRowProps = {
  label: string;
  value: string;
  detail?: string;
  leading: ReactNode;
};

function PurchaseSelectRow({ label, value, detail, leading }: PurchaseSelectRowProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[0.72rem] font-medium leading-none text-app-muted">{label}</p>
      <button
        type="button"
        className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-app-border bg-app-bg/35 px-3 text-left transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">{leading}</span>
        <span className="min-w-0 flex-1 truncate text-[0.8rem] font-semibold text-app-text">
          {value}
          {detail ? (
            <span className="ml-1 font-medium text-app-muted">({detail})</span>
          ) : null}
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
      </button>
    </div>
  );
}
