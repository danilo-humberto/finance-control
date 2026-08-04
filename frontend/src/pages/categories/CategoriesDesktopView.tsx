import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Car,
  DollarSign,
  Edit3,
  Gift,
  GraduationCap,
  Heart,
  Home,
  LayoutGrid,
  LoaderCircle,
  Plane,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Tags,
  Trash2,
  Utensils,
  User,
  type LucideIcon,
} from "lucide-react";

import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

import {
  type CategoryPageItem,
  type CategoriesPageData,
} from "./useCategoriesPageData";
import { type CategoryFilter } from "@/components/categories/CategoryFilterTabs";

type CategoriesDesktopViewProps = CategoriesPageData & {
  embedded?: boolean;
};

type SummaryCardProps = {
  description: string;
  icon: LucideIcon;
  tone?: "brand" | "danger";
  loading?: boolean;
  title: string;
  value: number;
};

type FilterOption = {
  icon: LucideIcon;
  label: string;
  value: CategoryFilter;
};

const filterOptions: FilterOption[] = [
  { value: "all", label: "Todas", icon: LayoutGrid },
  { value: "expense", label: "Despesas", icon: ArrowDown },
  { value: "income", label: "Receitas", icon: ArrowUp },
];

const categoryIconMap: Record<string, LucideIcon> = {
  BookOpen,
  "book-open": BookOpen,
  Car,
  car: Car,
  DollarSign,
  "dollar-sign": DollarSign,
  Gift,
  gift: Gift,
  GraduationCap,
  "graduation-cap": GraduationCap,
  Heart,
  heart: Heart,
  Home,
  home: Home,
  Plane,
  plane: Plane,
  ShoppingBag,
  "shopping-bag": ShoppingBag,
  Tag,
  tag: Tag,
  Utensils,
  utensils: Utensils,
  User,
  user: User,
};

function getCategoryIcon(icon: string) {
  return categoryIconMap[icon] ?? categoryIconMap[icon.toLowerCase()] ?? Tag;
}

function getCategoryTint(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color)
    ? `${color}24`
    : "rgba(34, 197, 94, 0.16)";
}

function getFilterLabel(filter: CategoryFilter) {
  return (
    filterOptions.find((option) => option.value === filter)?.label ?? "Todas"
  );
}

export function CategoriesDesktopView({
  activeFilter,
  categories,
  categoryItems,
  embedded = false,
  feedbackMessage,
  loadError,
  loading,
  onActiveFilterChange,
  onCreateClick,
  onDeleteCategory,
  onEditCategory,
  onRetryLoad,
  onSearchTermChange,
  searchTerm,
  summary,
}: CategoriesDesktopViewProps) {
  return (
    <div className={cn('space-y-6', embedded && 'space-y-4')}>
      {embedded ? (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onCreateClick}
            leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
            className="h-11 rounded-xl px-4"
          >
            Nova categoria
          </Button>
        </div>
      ) : (
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-[2rem] font-bold leading-tight text-app-text">
              Categorias
            </h1>
            <p className="mt-2 text-sm leading-6 text-app-muted">
              Organize seus gastos e receitas
            </p>
          </div>

          <Button
            type="button"
            onClick={onCreateClick}
            leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
            className="h-11 self-start rounded-xl px-4 xl:self-auto"
          >
            Nova categoria
          </Button>
        </header>
      )}

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <section
        className="grid gap-4 lg:grid-cols-3"
        aria-label="Resumo de categorias"
      >
        <SummaryCard
          title="Total de categorias"
          value={summary.total}
          description="categorias"
          icon={Tags}
          loading={loading}
        />
        <SummaryCard
          title="Despesas"
          value={summary.expenses}
          description="ativas"
          icon={ArrowDown}
          tone="danger"
          loading={loading}
        />
        <SummaryCard
          title="Receitas"
          value={summary.incomes}
          description="ativas"
          icon={ArrowUp}
          loading={loading}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_42rem]">
        <Input
          aria-label="Buscar categoria"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Buscar categoria"
          leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          className="h-12 rounded-xl bg-app-surface/75 text-sm"
        />

        <div
          className="grid gap-3 sm:grid-cols-3"
          role="tablist"
          aria-label="Filtrar categorias por tipo"
        >
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === activeFilter;

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onActiveFilterChange(option.value)}
                className={cn(
                  "flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isActive
                    ? "border-brand-700/75 bg-brand-950/45 text-brand-400"
                    : "border-app-border bg-app-surface/70 text-app-muted hover:bg-app-elevated hover:text-app-text",
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15"
        aria-labelledby="categories-desktop-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-app-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="categories-desktop-title"
              className="text-base font-semibold text-app-text"
            >
              Minhas categorias
            </h2>
            <p className="mt-1 text-xs text-app-muted">
              Exibindo {getFilterLabel(activeFilter).toLowerCase()}
            </p>
          </div>
          <span className="rounded-full border border-app-border bg-app-bg/35 px-3 py-1 text-xs font-semibold text-app-muted">
            {categoryItems.length} de {categories.length}
          </span>
        </div>

        {loading ? (
          <CategoriesTableSkeleton />
        ) : loadError ? (
          <div className="p-5">
            <EmptyState
              title="Não foi possível carregar as categorias"
              description={loadError}
              icon={
                <LoaderCircle
                  aria-hidden="true"
                  className="h-5 w-5 text-brand-400"
                />
              }
              action={
                <Button type="button" size="sm" onClick={onRetryLoad}>
                  Tentar novamente
                </Button>
              }
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nenhuma categoria cadastrada"
              description="Crie categorias para organizar seus gastos e receitas."
              icon={<Search aria-hidden="true" className="h-5 w-5" />}
              action={
                <Button type="button" size="sm" onClick={onCreateClick}>
                  Adicionar categoria
                </Button>
              }
            />
          </div>
        ) : categoryItems.length > 0 ? (
          <CategoriesTable
            categories={categoryItems}
            onDeleteCategory={onDeleteCategory}
            onEditCategory={onEditCategory}
          />
        ) : (
          <div className="p-5">
            <EmptyState
              title="Nenhuma categoria encontrada"
              description="Tente ajustar sua busca ou crie uma nova categoria."
              icon={<Search aria-hidden="true" className="h-5 w-5" />}
              action={
                <Button type="button" size="sm" onClick={onCreateClick}>
                  Adicionar categoria
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  description,
  icon: Icon,
  loading = false,
  title,
  tone = "brand",
  value,
}: SummaryCardProps) {
  const isDanger = tone === "danger";

  return (
    <article className="min-h-[8rem] rounded-2xl border border-app-border bg-app-surface/75 p-5 shadow-lg shadow-black/15">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400",
            isDanger && "bg-red-500/15 text-red-300",
          )}
        >
          <Icon aria-hidden="true" className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-app-text">
            {title}
          </p>
          {loading ? (
            <div className="mt-4 h-7 w-16 animate-pulse rounded-full bg-app-elevated" />
          ) : (
            <strong className="mt-4 block text-2xl font-bold leading-none text-app-text">
              {value}
            </strong>
          )}
          <p className="mt-2 text-xs leading-5 text-app-muted">{description}</p>
        </div>
      </div>
    </article>
  );
}

type CategoriesTableProps = {
  categories: CategoryPageItem[];
  onDeleteCategory: (category?: CategoryPageItem["source"] | null) => void;
  onEditCategory: (category?: CategoryPageItem["source"] | null) => void;
};

function CategoriesTable({
  categories,
  onDeleteCategory,
  onEditCategory,
}: CategoriesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] table-fixed text-left text-sm">
        <colgroup>
          <col style={{ width: "calc((100% - 9rem) / 2)" }} />
          <col style={{ width: "calc((100% - 9rem) / 2)" }} />
          <col className="w-36" />
        </colgroup>
        <thead className="bg-app-elevated/40 text-xs uppercase text-app-muted">
          <tr>
            <th className="px-5 py-3 font-semibold">Categoria</th>
            <th className="px-5 py-3 font-semibold">Tipo</th>
            <th className="w-36 px-5 py-3 text-left font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              onDeleteCategory={onDeleteCategory}
              onEditCategory={onEditCategory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CategoryTableRowProps = {
  category: CategoryPageItem;
  onDeleteCategory: (category?: CategoryPageItem["source"] | null) => void;
  onEditCategory: (category?: CategoryPageItem["source"] | null) => void;
};

function CategoryTableRow({
  category,
  onDeleteCategory,
  onEditCategory,
}: CategoryTableRowProps) {
  const Icon = getCategoryIcon(category.icon);
  const isIncome = category.type === "INCOME";

  return (
    <tr className="border-t border-app-border transition-colors hover:bg-app-elevated/35">
      <td className="px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: getCategoryTint(category.color),
              color: category.color,
            }}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-app-text">
              {category.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            isIncome
              ? "bg-success-surface text-success-text"
              : "bg-danger-surface text-danger-text",
          )}
        >
          {isIncome ? "Receita" : "Despesa"}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-start gap-2">
          <button
            type="button"
            aria-label={`Editar categoria ${category.name}`}
            onClick={() => onEditCategory(category.source)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-app-bg/35 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Excluir categoria ${category.name}`}
            onClick={() => onDeleteCategory(category.source)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-danger-border bg-transparent text-red-400 transition-colors hover:bg-danger-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function CategoriesTableSkeleton() {
  return (
    <div aria-label="Carregando categorias">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem] items-center gap-4 border-t border-app-border px-5 py-4 first:border-t-0"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-4 w-44 animate-pulse rounded-full bg-app-elevated" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded-full bg-app-elevated" />
          <div className="ml-auto h-8 w-20 animate-pulse rounded-full bg-app-elevated" />
        </div>
      ))}
    </div>
  );
}
