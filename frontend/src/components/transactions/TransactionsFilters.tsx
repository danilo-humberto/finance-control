import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type TransactionFilter = 'all' | 'income' | 'expense' | 'card' | 'pix';

type TransactionsFiltersProps = {
  searchTerm: string;
  activeFilter: TransactionFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: TransactionFilter) => void;
  onAdvancedFiltersClick: () => void;
};

type FilterOption = {
  value: TransactionFilter;
  label: string;
  icon: LucideIcon;
};

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'Todas', icon: LayoutGrid },
  { value: 'income', label: 'Entradas', icon: ArrowUp },
  { value: 'expense', label: 'Saídas', icon: ArrowDown },
  { value: 'card', label: 'Cartão', icon: CreditCard },
  { value: 'pix', label: 'PIX', icon: Wallet },
];

export function TransactionsFilters({
  searchTerm,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onAdvancedFiltersClick,
}: TransactionsFiltersProps) {
  return (
    <section className="space-y-3" aria-label="Filtros de movimentações">
      <div className="grid grid-cols-[1fr_auto] gap-2.5">
        <Input
          aria-label="Buscar movimentação"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar movimentação"
          leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          className="h-10 rounded-2xl bg-app-surface/75 text-[0.8rem]"
        />

        <button
          type="button"
          aria-label="Abrir filtros avançados"
          onClick={onAdvancedFiltersClick}
          className="flex h-10 items-center gap-1.5 rounded-2xl border border-app-border bg-app-surface/75 px-3 text-[0.76rem] font-semibold text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <SlidersHorizontal
            aria-hidden="true"
            className="h-4 w-4 text-brand-400"
          />
          <span>Filtros</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === activeFilter;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={cn(
                'flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl border px-3 text-[0.76rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive
                  ? 'border-brand-700/75 bg-brand-950/45 text-brand-400'
                  : 'border-app-border bg-app-surface/70 text-app-muted hover:bg-app-elevated hover:text-app-text',
              )}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
