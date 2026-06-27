import { type MockCategoriesSummary } from '@/mocks/financeMocks';
import { ArrowDown, ArrowUp, Tags, type LucideIcon } from 'lucide-react';

type CategoriesSummaryProps = {
  summary: MockCategoriesSummary;
};

type SummaryItem = {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: 'brand' | 'danger';
};

export function CategoriesSummary({ summary }: CategoriesSummaryProps) {
  const items: SummaryItem[] = [
    {
      label: 'Total',
      value: summary.total,
      helper: 'categorias',
      icon: Tags,
      tone: 'brand',
    },
    {
      label: 'Despesas',
      value: summary.expenses,
      helper: 'ativas',
      icon: ArrowDown,
      tone: 'danger',
    },
    {
      label: 'Receitas',
      value: summary.incomes,
      helper: 'ativas',
      icon: ArrowUp,
      tone: 'brand',
    },
  ];

  return (
    <section
      aria-label="Resumo de categorias"
      className="grid grid-cols-3 overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isDanger = item.tone === 'danger';

        return (
          <div
            key={item.label}
            className="min-w-0 border-app-border p-2.5 first:border-l-0 [&:not(:first-child)]:border-l"
          >
            <span
              className={
                isDanger
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400'
                  : 'flex h-8 w-8 items-center justify-center rounded-full bg-app-icon text-brand-400'
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>

            <p className="mt-2 text-[0.66rem] leading-3 text-app-muted">
              {item.label}
            </p>
            <p className="mt-1 text-[1rem] font-bold leading-5 text-app-text">
              {item.value}
            </p>
            <p className="text-[0.62rem] font-medium leading-3 text-app-muted">
              {item.helper}
            </p>
          </div>
        );
      })}
    </section>
  );
}
