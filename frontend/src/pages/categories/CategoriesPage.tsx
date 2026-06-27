import { CategoriesSearch } from '@/components/categories/CategoriesSearch';
import { CategoriesSummary } from '@/components/categories/CategoriesSummary';
import {
  CategoryFilterTabs,
  type CategoryFilter,
} from '@/components/categories/CategoryFilterTabs';
import { CategoryListItem } from '@/components/categories/CategoryListItem';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '@/components/sheets/CategoryFormSheet';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  mockCategories,
  type MockCategoriesSummary,
  type MockCategory,
} from '@/mocks/financeMocks';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getCategoriesSummary(categories: MockCategory[]): MockCategoriesSummary {
  return {
    total: categories.length,
    expenses: categories.filter((category) => category.type === 'expense').length,
    incomes: categories.filter((category) => category.type === 'income').length,
  };
}

function createCategoryFromValues(values: CategoryFormValues): MockCategory {
  const name = values.name.trim() || 'Nova categoria';

  return {
    id: `cat-${Date.now()}`,
    name,
    type: values.type,
    icon: values.icon,
    color: values.color,
    transactionsCount: 0,
  };
}

function updateCategoryFromValues(
  category: MockCategory,
  values: CategoryFormValues,
): MockCategory {
  return {
    ...category,
    name: values.name.trim() || category.name,
    type: values.type,
    icon: values.icon,
    color: values.color,
  };
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<MockCategory[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<MockCategory | null>(
    null,
  );
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const summary = useMemo(() => getCategoriesSummary(categories), [categories]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return categories.filter((category) => {
      const matchesType =
        activeFilter === 'all' || category.type === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(category.name).includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [activeFilter, categories, searchTerm]);

  function handleCreateClick() {
    setSelectedCategory(null);
    setCategoryFormMode('create');
    setCategorySheetOpen(true);
  }

  function handleMenuClick(category: MockCategory) {
    setSelectedCategory(category);
    setActionSheetOpen(true);
  }

  function handleEditClick() {
    setCategoryFormMode('edit');
    setCategorySheetOpen(true);
  }

  function handleDeleteClick() {
    setDeleteDialogOpen(true);
  }

  function handleCategorySubmit(values: CategoryFormValues) {
    if (categoryFormMode === 'create') {
      setCategories((currentCategories) => [
        ...currentCategories,
        createCategoryFromValues(values),
      ]);
      return;
    }

    if (!selectedCategory) {
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === selectedCategory.id
          ? updateCategoryFromValues(category, values)
          : category,
      ),
    );
  }

  function handleConfirmDelete() {
    if (!selectedCategory) {
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter(
        (category) => category.id !== selectedCategory.id,
      ),
    );
    setSelectedCategory(null);
  }

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
          onClick={handleCreateClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <CategoriesSummary summary={summary} />

      <CategoryFilterTabs value={activeFilter} onChange={setActiveFilter} />

      <CategoriesSearch value={searchTerm} onChange={setSearchTerm} />

      <section className="space-y-2" aria-labelledby="categories-title">
        <h2
          id="categories-title"
          className="text-[0.94rem] font-semibold leading-tight"
        >
          Minhas categorias
        </h2>

        {filteredCategories.length > 0 ? (
          <div className="space-y-2.5">
            {filteredCategories.map((category) => (
              <CategoryListItem
                key={category.id}
                category={category}
                onMenuClick={handleMenuClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma categoria encontrada"
            description="Tente ajustar sua busca ou crie uma nova categoria."
            icon={<Search aria-hidden="true" className="h-5 w-5" />}
            action={
              <Button type="button" size="sm" onClick={handleCreateClick}>
                Adicionar categoria
              </Button>
            }
          />
        )}
      </section>

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={selectedCategory ? selectedCategory.name : 'Categoria'}
        actions={[
          {
            label: 'Editar categoria',
            description: 'Alterar nome, tipo, ícone e cor',
            icon: Edit3,
            onClick: handleEditClick,
          },
          {
            label: 'Excluir categoria',
            description: 'Remover esta categoria da lista',
            icon: Trash2,
            variant: 'danger',
            onClick: handleDeleteClick,
          },
        ]}
      />

      <CategoryFormSheet
        open={categorySheetOpen}
        onOpenChange={setCategorySheetOpen}
        mode={categoryFormMode}
        initialData={
          selectedCategory && categoryFormMode === 'edit'
            ? {
                name: selectedCategory.name,
                type: selectedCategory.type,
                icon: selectedCategory.icon,
                color: selectedCategory.color,
              }
            : undefined
        }
        onSubmit={handleCategorySubmit}
        onDelete={() => {
          setCategorySheetOpen(false);
          setDeleteDialogOpen(true);
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir categoria"
        description="Tem certeza que deseja excluir esta categoria?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
