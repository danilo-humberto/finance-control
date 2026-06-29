import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { type TransactionType } from '@/types/transaction';
import {
  BookOpen,
  Car,
  DollarSign,
  Gift,
  GraduationCap,
  Heart,
  Home,
  MoreVertical,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
  Utensils,
  User,
  type LucideIcon,
} from 'lucide-react';

export type TransactionListItemData = {
  id: string;
  description: string;
  categoryName: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  paymentLabel: string;
  amount: number;
  transactionType: TransactionType;
  timeLabel: string;
};

type TransactionListItemProps = {
  transaction: TransactionListItemData;
  onMenuClick: (transaction: TransactionListItemData) => void;
};

const defaultColor = '#22c55e';

const categoryIconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  bookopen: BookOpen,
  car: Car,
  'dollar-sign': DollarSign,
  dollarsign: DollarSign,
  gift: Gift,
  'graduation-cap': GraduationCap,
  graduationcap: GraduationCap,
  heart: Heart,
  home: Home,
  plane: Plane,
  'shopping-bag': ShoppingBag,
  shoppingbag: ShoppingBag,
  shoppingcart: ShoppingCart,
  'shopping-cart': ShoppingCart,
  tag: Tag,
  trendingup: TrendingUp,
  'trending-up': TrendingUp,
  utensils: Utensils,
  user: User,
};

export function TransactionListItem({
  transaction,
  onMenuClick,
}: TransactionListItemProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const Icon = categoryIconMap[normalizeIconName(transaction.categoryIcon)] ?? Tag;
  const isIncome = transaction.transactionType === 'INCOME';
  const amountLabel = `${isIncome ? '+' : '-'} ${formatCurrency(
    Math.abs(transaction.amount),
  )}`;
  const categoryColor = transaction.categoryColor || defaultColor;

  return (
    <article className="grid min-h-[4.35rem] grid-cols-[2.5rem_minmax(0,1fr)_5.75rem] items-center gap-2.5 border-b border-app-border/80 px-2.5 py-2.5 last:border-b-0">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${categoryColor}24`,
          color: categoryColor,
        }}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <h3 className="truncate text-[0.86rem] font-semibold leading-5 text-app-text">
          {transaction.description}
        </h3>
        <p className="mt-0.5 truncate text-[0.68rem] leading-4 text-app-muted">
          {transaction.categoryName} • {transaction.paymentLabel}
        </p>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-1.5">
        <div className="min-w-0 text-right">
          <p
            className={cn(
              'truncate text-[0.78rem] font-semibold leading-4',
              isIncome ? 'text-brand-400' : 'text-red-400',
            )}
          >
            {amountLabel}
          </p>
          <p className="mt-1 text-[0.68rem] leading-4 text-app-muted">
            {formatDateLabel(transaction.timeLabel)}
          </p>
        </div>

        <button
          type="button"
          aria-label={`Abrir ações de ${transaction.description}`}
          onClick={() => onMenuClick(transaction)}
          className="shrink-0 rounded-full p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <MoreVertical aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function normalizeIconName(icon?: string | null) {
  if (!icon) {
    return '';
  }

  return icon
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .trim();
}
