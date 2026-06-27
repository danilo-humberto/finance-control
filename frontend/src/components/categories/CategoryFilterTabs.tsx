import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, LayoutGrid, type LucideIcon } from 'lucide-react';

export type CategoryFilter = 'all' | 'expense' | 'income';

type CategoryFilterTabsProps = {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
};

type FilterOption = {
  value: CategoryFilter;
  label: string;
  icon: LucideIcon;
};

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'Todas', icon: LayoutGrid },
  { value: 'expense', label: 'Despesas', icon: ArrowDown },
  { value: 'income', label: 'Receitas', icon: ArrowUp },
];

export function CategoryFilterTabs({
  value,
  onChange,
}: CategoryFilterTabsProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="tablist"
      aria-label="Filtrar categorias por tipo"
    >
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-2xl border px-2 text-[0.76rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              isActive
                ? 'border-brand-700/75 bg-brand-950/45 text-brand-400'
                : 'border-app-border bg-app-surface/70 text-app-muted hover:bg-app-elevated hover:text-app-text',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
