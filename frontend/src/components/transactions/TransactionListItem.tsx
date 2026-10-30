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
  Repeat,
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
  subcategoryName?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  paymentLabel: string;
  amount: number;
  transactionType: TransactionType;
  timeLabel: string;
  isRecurring?: boolean;
  recurringTransactionId?: string | null;
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
  repeat: Repeat,
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

type TransactionCategoryIconProps = {
  color?: string | null;
  icon?: string | null;
  className?: string;
};

export function TransactionCategoryIcon({
  color,
  icon,
  className,
}: TransactionCategoryIconProps) {
  const Icon = categoryIconMap[normalizeIconName(icon)] ?? Tag;
  const categoryColor = color || defaultColor;

  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        className,
      )}
      style={{
        backgroundColor: `${categoryColor}24`,
        color: categoryColor,
      }}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </span>
  );
}

export function TransactionListItem({
  transaction,
  onMenuClick,
}: TransactionListItemProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const isIncome = transaction.transactionType === 'INCOME';
  const amountLabel = `${isIncome ? '+' : '-'} ${formatCurrency(
    Math.abs(transaction.amount),
  )}`;

  return (
    <article className="grid min-h-[4.35rem] grid-cols-[2.5rem_minmax(0,1fr)_5.75rem] items-center gap-2.5 border-b border-app-border/80 px-2.5 py-2.5 last:border-b-0">
      <TransactionCategoryIcon
        color={transaction.categoryColor}
        icon={transaction.categoryIcon}
      />

      <div className="min-w-0">
        <h3 className="truncate text-[0.86rem] font-semibold leading-5 text-app-text">
          {transaction.description}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[0.68rem] leading-4 text-app-muted">
          <span className="truncate">
            {transaction.categoryName}
            {transaction.subcategoryName ? ` › ${transaction.subcategoryName}` : ''} • {transaction.paymentLabel}
          </span>
          {transaction.isRecurring ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 font-medium text-brand-400">
              • <Repeat aria-hidden="true" className="h-3 w-3" /> Recorrente
            </span>
          ) : null}
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
