import { LoaderCircle, Plus, Search } from 'lucide-react';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { CategoriesSearch } from '@/components/categories/CategoriesSearch';
import { CategoriesSummary } from '@/components/categories/CategoriesSummary';
import { CategoryFilterTabs } from '@/components/categories/CategoryFilterTabs';
import { CategoryListItem } from '@/components/categories/CategoryListItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

import { type CategoriesPageData } from './useCategoriesPageData';

type CategoriesMobileViewProps = CategoriesPageData;

function CategoriesLoadingState() {
  return (
    <div className="space-y-2.5" aria-label="Carregando categorias">
      {[0, 1, 2, 3, 4].map((item) => (
        <article
          key={item}
          className="flex min-h-[4.25rem] items-center gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-app-elevated" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-app-elevated" />
          </div>
          <div className="h-5 w-5 animate-pulse rounded-full bg-app-elevated" />
        </article>
      ))}
    </div>
  );
}

export function CategoriesMobileView({
  activeFilter,
  categories,
  categoryItems,
  feedbackMessage,
  loadError,
  loading,
  onActiveFilterChange,
  onCategoryMenuClick,
  onCreateClick,
  onRetryLoad,
  onSearchTermChange,
  searchTerm,
  summary,
}: CategoriesMobileViewProps) {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Categorias
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Organize seus gastos e receitas
          </p>
        </div>

        <button
          type="button"
          aria-label="Adicionar categoria"
          onClick={onCreateClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <CategoriesSummary summary={summary} />

      <CategoryFilterTabs
        value={activeFilter}
        onChange={onActiveFilterChange}
      />

      <CategoriesSearch value={searchTerm} onChange={onSearchTermChange} />

      <section className="space-y-2" aria-labelledby="categories-title">
        <h2
          id="categories-title"
          className="text-[0.94rem] font-semibold leading-tight"
        >
          Minhas categorias
        </h2>

        {loading ? (
          <CategoriesLoadingState />
        ) : loadError ? (
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
        ) : categories.length === 0 ? (
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
        ) : categoryItems.length > 0 ? (
          <div className="space-y-2.5">
            {categoryItems.map((categoryItem) => (
              <CategoryListItem
                key={categoryItem.id}
                category={categoryItem}
                onMenuClick={() => onCategoryMenuClick(categoryItem.source)}
              />
            ))}
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
