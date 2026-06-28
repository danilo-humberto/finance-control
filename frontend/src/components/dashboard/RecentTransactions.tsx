import { EmptyState } from '@/components/ui/EmptyState';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type MockRecentTransaction } from '@/mocks/financeMocks';
import {
  ChevronRight,
  Clapperboard,
  DollarSign,
  Fuel,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type RecentTransactionsProps = {
  transactions: MockRecentTransaction[];
};

const iconByName: Record<string, LucideIcon> = {
  Clapperboard,
  DollarSign,
  Fuel,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();

  function formatSignedCurrency(value: number) {
    if (value < 0) {
      return formatCurrency(Math.abs(value));
    }

    return `+${formatCurrency(value)}`;
  }

  return (
    <section className="space-y-2.5" aria-labelledby="recent-transactions-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-transactions-title" className="text-base font-semibold">
          Últimas movimentações
        </h2>

        <Link
          to="/transactions"
          className="text-[0.82rem] font-semibold text-brand-400 transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Ver todas
        </Link>
      </div>

      {transactions.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-lg shadow-black/15">
          {transactions.map((transaction, index) => {
            const Icon = iconByName[transaction.categoryIcon] ?? DollarSign;
            const isExpense = transaction.type === 'expense';

            return (
              <Link
                key={transaction.id}
                to="/transactions"
                className={cn(
                  'flex min-h-[3.85rem] items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-app-elevated/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500',
                  index > 0 && 'border-t border-app-border',
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
                  <Icon aria-hidden="true" className="h-[1.12rem] w-[1.12rem]" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-semibold leading-5 text-app-text">
                    {transaction.description}
                  </span>
                  <span className="block truncate text-[0.72rem] leading-4 text-app-muted">
                    {transaction.categoryName} {'\u2022'}{' '}
                    {formatDateLabel(transaction.dateLabel)} {'\u2022'}{' '}
                    {transaction.paymentLabel}
                  </span>
                </span>

                <span
                  className={cn(
                    'shrink-0 text-right text-[0.82rem] font-semibold',
                    isExpense ? 'text-app-text' : 'text-brand-400',
                  )}
                >
                  {formatSignedCurrency(transaction.amount)}
                </span>

                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-app-muted" />
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<DollarSign aria-hidden="true" className="h-5 w-5" />}
          title="Nenhuma movimentação recente"
          description="Suas compras e receitas mais recentes aparecerão aqui."
        />
      )}
    </section>
  );
}
