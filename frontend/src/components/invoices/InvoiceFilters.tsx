import { cn } from '@/lib/utils';
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export type InvoiceFilterOption = {
  id: string;
  label: string;
};

type InvoiceFiltersProps = {
  monthOptions: InvoiceFilterOption[];
  cardOptions: InvoiceFilterOption[];
  categoryOptions: InvoiceFilterOption[];
  selectedMonthId: string;
  selectedCardId: string;
  selectedCategoryId: string;
  onMonthChange: (value: string) => void;
  onCardChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

type FilterSelectConfig = {
  value: string;
  options: InvoiceFilterOption[];
  icon: LucideIcon;
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function InvoiceFilters({
  monthOptions,
  cardOptions,
  categoryOptions,
  selectedMonthId,
  selectedCardId,
  selectedCategoryId,
  onMonthChange,
  onCardChange,
  onCategoryChange,
}: InvoiceFiltersProps) {
  const options: FilterSelectConfig[] = [
    {
      value: selectedMonthId,
      options: monthOptions,
      icon: CalendarDays,
      ariaLabel: 'Filtrar por mês',
      onChange: onMonthChange,
    },
    {
      value: selectedCardId,
      options: cardOptions,
      icon: CreditCard,
      ariaLabel: 'Filtrar por cartão',
      disabled: cardOptions.length === 0,
      onChange: onCardChange,
    },
    {
      value: selectedCategoryId,
      options: categoryOptions,
      icon: Tag,
      ariaLabel: 'Filtrar por categoria',
      onChange: onCategoryChange,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option, index) => (
        <InvoiceFilterSelect
          key={option.ariaLabel}
          config={option}
          className={index === 2 ? 'col-span-2' : ''}
        />
      ))}
    </div>
  );
}

type InvoiceFilterSelectProps = {
  config: FilterSelectConfig;
  className?: string;
};

function InvoiceFilterSelect({ config, className }: InvoiceFilterSelectProps) {
  const Icon = config.icon;
  const selectedOption = config.options.find(
    (option) => option.id === config.value,
  );

  return (
    <label
      className={cn(
        'relative flex h-9 min-w-0 items-center gap-1.5 rounded-xl border border-app-border bg-app-surface/70 px-2.5 text-[0.68rem] font-medium text-app-text shadow-sm shadow-black/10 transition-colors',
        'hover:bg-app-elevated focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500',
        config.disabled && 'opacity-60',
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
      <span className="min-w-0 flex-1 truncate text-left">
        {selectedOption?.label ?? 'Selecione'}
      </span>
      <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
      <select
        aria-label={config.ariaLabel}
        value={config.value}
        disabled={config.disabled}
        onChange={(event) => config.onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {config.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
