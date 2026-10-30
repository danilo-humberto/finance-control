import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Car,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  DollarSign,
  Gift,
  GraduationCap,
  Heart,
  Home,
  MoreVertical,
  Plane,
  Plus,
  ShoppingBag,
  Tag,
  Utensils,
  User,
  type LucideIcon,
} from 'lucide-react';

import { type Category } from '@/types/category';

export type CategoryListItemData = {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
  parentId?: string | null;
  transactionsCount: number;
};

type CategoryListItemProps = {
  category: CategoryListItemData;
  subcategories?: Array<CategoryListItemData & { source: Category }>;
  onMenuClick: (category: CategoryListItemData) => void;
  onSubcategoryMenuClick?: (subcategory: Category) => void;
  onAddSubcategory?: (category: CategoryListItemData) => void;
};

const categoryIconMap: Record<string, LucideIcon> = {
  BookOpen,
  'book-open': BookOpen,
  Car,
  car: Car,
  DollarSign,
  'dollar-sign': DollarSign,
  Gift,
  gift: Gift,
  GraduationCap,
  'graduation-cap': GraduationCap,
  Heart,
  heart: Heart,
  Home,
  home: Home,
  Plane,
  plane: Plane,
  ShoppingBag,
  'shopping-bag': ShoppingBag,
  Tag,
  tag: Tag,
  Utensils,
  utensils: Utensils,
  User,
  user: User,
};

function getTransactionsLabel(count: number) {
  if (count === 1) {
    return '1 lançamento';
  }

  return `${count} lançamentos`;
}

export function CategoryListItem({
  category,
  subcategories = [],
  onMenuClick,
  onSubcategoryMenuClick,
  onAddSubcategory,
}: CategoryListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = categoryIconMap[category.icon] ?? Tag;
  const isIncome = category.type === 'INCOME';
  const typeLabel = isIncome ? 'Receita' : 'Despesa';
  const hasSubcategories = subcategories.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15 transition-all">
      <article className="flex min-h-[4.25rem] items-center gap-2.5 p-2.5">
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
          <div className="mt-0.5 flex items-center gap-2 text-[0.7rem] leading-4 text-app-muted">
            <span>{getTransactionsLabel(category.transactionsCount)}</span>
            {hasSubcategories && (
              <>
                <span>•</span>
                <span>
                  {subcategories.length}{' '}
                  {subcategories.length === 1 ? 'subcategoria' : 'subcategorias'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {hasSubcategories && (
            <button
              type="button"
              aria-label={isExpanded ? 'Recolher subcategorias' : 'Expandir subcategorias'}
              onClick={() => setIsExpanded((prev) => !prev)}
              className="rounded-full p-1.5 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isExpanded ? (
                <ChevronUp aria-hidden="true" className="h-4 w-4" />
              ) : (
                <ChevronDown aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            type="button"
            aria-label={`Abrir ações de ${category.name}`}
            onClick={() => onMenuClick(category)}
            className="rounded-full p-1.5 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <MoreVertical aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </article>

      {isExpanded && (
        <div className="border-t border-app-border/60 bg-app-bg/25 px-3 py-2 space-y-1.5">
          {subcategories.map((sub) => {
            const SubIcon = categoryIconMap[sub.icon] ?? Tag;

            return (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-app-border/40 bg-app-surface/60 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CornerDownRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-app-muted"
                  />
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                    style={{
                      backgroundColor: `${sub.color}24`,
                      color: sub.color,
                    }}
                  >
                    <SubIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate font-medium text-app-text">
                    {sub.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[0.68rem] text-app-muted">
                    {getTransactionsLabel(sub.transactionsCount)}
                  </span>
                  {onSubcategoryMenuClick && (
                    <button
                      type="button"
                      aria-label={`Abrir ações de ${sub.name}`}
                      onClick={() => onSubcategoryMenuClick(sub.source)}
                      className="rounded-full p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text"
                    >
                      <MoreVertical aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {onAddSubcategory && (
            <button
              type="button"
              onClick={() => onAddSubcategory(category)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-app-border/70 py-2 text-xs font-semibold text-brand-400 transition-colors hover:bg-app-elevated/50"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Adicionar subcategoria
            </button>
          )}
        </div>
      )}
    </div>
  );
}
