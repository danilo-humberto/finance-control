import { type MockTransactionsSummary } from '@/mocks/financeMocks';
import { ArrowDown, ArrowUp, Wallet, type LucideIcon } from 'lucide-react';

type TransactionsSummaryProps = {
  summary: MockTransactionsSummary;
};

type SummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'income' | 'expense' | 'balance';
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function TransactionsSummary({ summary }: TransactionsSummaryProps) {
  const items: SummaryItem[] = [
    {
      label: 'Entradas',
      value: summary.income,
      icon: ArrowUp,
      tone: 'income',
    },
    {
      label: 'Saídas',
      value: summary.expense,
      icon: ArrowDown,
      tone: 'expense',
    },
    {
      label: 'Saldo',
      value: summary.balance,
      icon: Wallet,
      tone: 'balance',
    },
  ];

  return (
    <section
      aria-label="Resumo de movimentações"
      className="grid grid-cols-3 overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isExpense = item.tone === 'expense';
        const isNegativeBalance = item.tone === 'balance' && item.value < 0;
        const valueColor =
          isExpense || isNegativeBalance ? 'text-red-400' : 'text-brand-400';

        return (
          <div
            key={item.label}
            className="min-w-0 border-app-border p-2.5 first:border-l-0 [&:not(:first-child)]:border-l"
          >
            <span
              className={
                isExpense
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400'
                  : 'flex h-8 w-8 items-center justify-center rounded-full bg-app-icon text-brand-400'
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>

            <p className="mt-2 text-[0.66rem] leading-3 text-app-muted">
              {item.label}
            </p>
            <p
              className={`mt-1 break-words text-[0.78rem] font-semibold leading-4 ${valueColor}`}
            >
              {moneyFormatter.format(Math.abs(item.value))}
            </p>
          </div>
        );
      })}
    </section>
  );
}
