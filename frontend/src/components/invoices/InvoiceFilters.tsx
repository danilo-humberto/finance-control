import { cn } from '@/lib/utils';
import { type MockInvoiceFilters } from '@/mocks/financeMocks';
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  Tag,
  type LucideIcon,
} from 'lucide-react';

type InvoiceFiltersProps = {
  filters: MockInvoiceFilters;
};

type FilterOption = {
  label: string;
  icon: LucideIcon;
  ariaLabel: string;
};

export function InvoiceFilters({ filters }: InvoiceFiltersProps) {
  const options: FilterOption[] = [
    {
      label: filters.monthLabel,
      icon: CalendarDays,
      ariaLabel: 'Filtrar por mês',
    },
    {
      label: filters.cardLabel,
      icon: CreditCard,
      ariaLabel: 'Filtrar por cartão',
    },
    {
      label: filters.categoryLabel,
      icon: Tag,
      ariaLabel: 'Filtrar por categoria',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-[1fr_0.95fr_1.55fr]">
      {options.map((option, index) => {
        const Icon = option.icon;

        return (
          <button
            key={option.ariaLabel}
            type="button"
            aria-label={option.ariaLabel}
            className={cn(
              'flex h-9 min-w-0 items-center gap-1.5 rounded-xl border border-app-border bg-app-surface/70 px-2.5 text-[0.68rem] font-medium text-app-text shadow-sm shadow-black/10 transition-colors',
              'hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              index === 2 && 'col-span-2 min-[380px]:col-span-1',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
            <span className="min-w-0 flex-1 truncate text-left">{option.label}</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
          </button>
        );
      })}
    </div>
  );
}
