import { usePreferences } from '@/hooks/usePreferences';
import { type MockCardsSummary } from '@/mocks/financeMocks';
import { FileText, PieChart, WalletCards, type LucideIcon } from 'lucide-react';

type CardsSummaryProps = {
  summary: MockCardsSummary;
};

type SummaryItem = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function CardsSummary({ summary }: CardsSummaryProps) {
  const { formatCurrency } = usePreferences();
  const items: SummaryItem[] = [
    {
      label: 'Limite total',
      value: formatCurrency(summary.totalLimit),
      helper: `Disponível: ${formatCurrency(summary.availableLimit)}`,
      icon: WalletCards,
    },
    {
      label: 'Utilizado',
      value: formatCurrency(summary.usedLimit),
      helper: `${percentageFormatter.format(summary.usedPercentage)}% do limite`,
      icon: PieChart,
    },
    {
      label: 'Fatura total aberta',
      value: formatCurrency(summary.openInvoiceTotal),
      helper: `Em ${summary.openCardsCount} cartões`,
      icon: FileText,
    },
  ];

  return (
    <section className="space-y-2" aria-labelledby="cards-summary-title">
      <h2 id="cards-summary-title" className="text-[0.94rem] font-semibold leading-tight">
        Resumo geral
      </h2>

      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="min-w-0 border-app-border p-2.5 first:border-l-0 [&:not(:first-child)]:border-l"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-app-icon text-brand-400">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>

              <p className="mt-2 text-[0.66rem] leading-3 text-app-muted">
                {item.label}
              </p>
              <p className="mt-1 break-words text-[0.78rem] font-semibold leading-4 text-app-text">
                {item.value}
              </p>
              <p className="mt-1 break-words text-[0.62rem] font-medium leading-3 text-brand-400">
                {item.helper}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
