import { cn } from '@/lib/utils';
import { type MockCategory } from '@/mocks/financeMocks';
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
  Tag,
  Utensils,
  User,
  type LucideIcon,
} from 'lucide-react';

type CategoryListItemProps = {
  category: MockCategory;
  onMenuClick: (category: MockCategory) => void;
};

const categoryIconMap: Record<string, LucideIcon> = {
  BookOpen,
  Car,
  DollarSign,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Plane,
  ShoppingBag,
  Tag,
  Utensils,
  User,
};

function getTransactionsLabel(count: number) {
  if (count === 1) {
    return '1 lançamento';
  }

  return `${count} lançamentos`;
}

export function CategoryListItem({
  category,
  onMenuClick,
}: CategoryListItemProps) {
  const Icon = categoryIconMap[category.icon] ?? Tag;
  const isIncome = category.type === 'income';
  const typeLabel = isIncome ? 'Receita' : 'Despesa';

  return (
    <article className="flex min-h-[4.25rem] items-center gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${category.color}24`,
          color: category.color,
        }}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 truncate text-[0.88rem] font-semibold leading-5 text-app-text">
            {category.name}
          </h3>
          <span
            className={cn(
              'shrink-0 rounded-md px-2 py-0.5 text-[0.62rem] font-semibold leading-4',
              isIncome
                ? 'bg-brand-500/15 text-brand-400'
                : 'bg-red-500/15 text-red-300',
            )}
          >
            {typeLabel}
          </span>
        </div>
        <p className="mt-0.5 text-[0.7rem] leading-4 text-app-muted">
          {getTransactionsLabel(category.transactionsCount)}
        </p>
      </div>

      <button
        type="button"
        aria-label={`Abrir ações de ${category.name}`}
        onClick={() => onMenuClick(category)}
        className="shrink-0 rounded-full p-1.5 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </button>
    </article>
  );
}
