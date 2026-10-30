import { ArrowDown, ArrowUp, Tags, type LucideIcon } from 'lucide-react';

export type CategoriesSummaryData = {
  total: number;
  expenses: number;
  incomes: number;
  subcategoriesTotal?: number;
};

type CategoriesSummaryProps = {
  summary: CategoriesSummaryData;
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
      helper:
        summary.subcategoriesTotal !== undefined && summary.subcategoriesTotal > 0
          ? `${summary.subcategoriesTotal} subcategorias`
          : 'categorias',
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
      {items.map((item, index) => {
        const Icon = item.icon;
        const isDanger = item.tone === 'danger';

        return (
          <article
            key={item.label}
            className={`min-h-[5.5rem] p-3 text-center transition-colors ${
              index > 0 ? 'border-l border-app-border' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Icon
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${
                  isDanger ? 'text-red-400' : 'text-brand-400'
                }`}
              />
              <p className="text-[0.7rem] font-medium text-app-muted">
                {item.label}
              </p>
            </div>
            <strong className="mt-1 block text-lg font-bold leading-tight text-app-text">
              {item.value}
            </strong>
            <p className="text-[0.62rem] leading-3 text-app-muted truncate">
              {item.helper}
            </p>
          </article>
        );
      })}
    </section>
  );
}
