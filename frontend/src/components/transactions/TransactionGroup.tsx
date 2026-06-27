import { type MockTransaction } from '@/mocks/financeMocks';
import { TransactionListItem } from './TransactionListItem';

type TransactionGroupProps = {
  label: string;
  transactions: MockTransaction[];
  onMenuClick: (transaction: MockTransaction) => void;
};

export function TransactionGroup({
  label,
  transactions,
  onMenuClick,
}: TransactionGroupProps) {
  return (
    <section className="space-y-2" aria-labelledby={`group-${label}`}>
      <h2
        id={`group-${label}`}
        className="text-[0.94rem] font-semibold leading-tight text-app-text"
      >
        {label}
      </h2>

      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        {transactions.map((transaction) => (
          <TransactionListItem
            key={transaction.id}
            transaction={transaction}
            onMenuClick={onMenuClick}
          />
        ))}
      </div>
    </section>
  );
}
