import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Edit3, LoaderCircle, Plus, Search, Trash2 } from 'lucide-react';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { CategoriesSearch } from '@/components/categories/CategoriesSearch';
import {
  CategoriesSummary,
  type CategoriesSummaryData,
} from '@/components/categories/CategoriesSummary';
import {
  CategoryFilterTabs,
  type CategoryFilter,
} from '@/components/categories/CategoryFilterTabs';
import {
  CategoryListItem,
  type CategoryListItemData,
} from '@/components/categories/CategoryListItem';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '@/components/sheets/CategoryFormSheet';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/services/categoriesService';
import {
  type Category,
  type CategoryType,
  type CreateCategoryPayload,
} from '@/types/category';

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

const defaultCategoryColor = '#22c55e';
const defaultCategoryIcon = 'utensils';

const apiIconByFormIcon: Record<string, string> = {
  BookOpen: 'book-open',
  Car: 'car',
  DollarSign: 'dollar-sign',
  Gift: 'gift',
  GraduationCap: 'graduation-cap',
  Heart: 'heart',
  Home: 'home',
  Plane: 'plane',
  ShoppingBag: 'shopping-bag',
  Utensils: 'utensils',
  User: 'user',
};

const formIconByApiIcon: Record<string, CategoryFormValues['icon']> = {
  'book-open': 'BookOpen',
  bookopen: 'BookOpen',
  car: 'Car',
  dollarsign: 'DollarSign',
  'dollar-sign': 'DollarSign',
  gift: 'Gift',
  graduationcap: 'GraduationCap',
  'graduation-cap': 'GraduationCap',
  heart: 'Heart',
  home: 'Home',
  plane: 'Plane',
  shoppingbag: 'ShoppingBag',
  'shopping-bag': 'ShoppingBag',
  utensils: 'Utensils',
  user: 'User',
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(' ');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if (error.response?.status === 401) {
      return 'Sua sessão expirou. Entre novamente para acessar suas categorias.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

function getDeleteCategoryErrorMessage(error: unknown) {
  if (
    isAxiosError(error) &&
    (error.response?.status === 400 || error.response?.status === 409)
  ) {
    return 'Não foi possível excluir esta categoria. Ela pode estar vinculada a movimentações.';
  }

  return getApiErrorMessage(error);
}

function getCategoriesSummary(categories: Category[]): CategoriesSummaryData {
  return {
    total: categories.length,
    expenses: categories.filter((category) => category.type === 'EXPENSE')
      .length,
    incomes: categories.filter((category) => category.type === 'INCOME')
      .length,
  };
}

function getFilterType(activeFilter: CategoryFilter): CategoryType | null {
  if (activeFilter === 'income') {
    return 'INCOME';
  }

  if (activeFilter === 'expense') {
    return 'EXPENSE';
  }

  return null;
}

function getApiIcon(formIcon: string) {
  return apiIconByFormIcon[formIcon] ?? (formIcon || defaultCategoryIcon);
}

function getFormIcon(apiIcon?: string | null) {
  if (!apiIcon) {
    return 'Utensils';
  }

  return formIconByApiIcon[apiIcon] ?? formIconByApiIcon[apiIcon.toLowerCase()] ?? 'Utensils';
}

function toCategoryPayload(
  values: CategoryFormValues,
): CreateCategoryPayload {
  const name = values.name.trim();

  if (name.length < 2) {
    throw new Error('Informe o nome da categoria.');
  }

  return {
    name,
    icon: getApiIcon(values.icon),
    color: values.color || defaultCategoryColor,
    type: values.type === 'income' ? 'INCOME' : 'EXPENSE',
  };
}

function toCategoryListItem(category: Category): CategoryListItemData {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon || defaultCategoryIcon,
    color: category.color || defaultCategoryColor,
    transactionsCount: 0,
  };
}

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

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
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
  const [loading, setLoading] = useState(true);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null);

  const summary = useMemo(() => getCategoriesSummary(categories), [categories]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const filterType = getFilterType(activeFilter);

    return categories.filter((category) => {
      const matchesType = !filterType || category.type === filterType;
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(category.name).includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [activeFilter, categories, searchTerm]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function handleCreateClick() {
    setFeedbackMessage(null);
    setSelectedCategory(null);
    setCategoryFormMode('create');
    setCategorySheetOpen(true);
  }

  function handleMenuClick(category: Category) {
    setFeedbackMessage(null);
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

  async function handleCategorySubmit(values: CategoryFormValues) {
    setFeedbackMessage(null);

    let payload: CreateCategoryPayload;

    try {
      payload = toCategoryPayload(values);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
      return;
    }

    try {
      setSubmittingCategory(true);

      if (categoryFormMode === 'create') {
        const createdCategory = await createCategory(payload);
        setCategories((currentCategories) => [
          ...currentCategories,
          createdCategory,
        ]);
        setFeedbackMessage({
          tone: 'success',
          message: 'Categoria cadastrada com sucesso.',
        });
      } else if (selectedCategory) {
        const updatedCategory = await updateCategory(
          selectedCategory.id,
          payload,
        );
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === selectedCategory.id ? updatedCategory : category,
          ),
        );
        setFeedbackMessage({
          tone: 'success',
          message: 'Categoria atualizada com sucesso.',
        });
      }

      setSelectedCategory(null);
      setCategorySheetOpen(false);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingCategory(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedCategory) {
      return;
    }

    try {
      setDeletingCategory(true);
      await deleteCategory(selectedCategory.id);
      setCategories((currentCategories) =>
        currentCategories.filter(
          (category) => category.id !== selectedCategory.id,
        ),
      );
      setFeedbackMessage({
        tone: 'success',
        message: 'Categoria excluída com sucesso.',
      });
      setSelectedCategory(null);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getDeleteCategoryErrorMessage(error),
      });
    } finally {
      setDeletingCategory(false);
    }
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

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

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
              <Button type="button" size="sm" onClick={() => void loadCategories()}>
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
              <Button type="button" size="sm" onClick={handleCreateClick}>
                Adicionar categoria
              </Button>
            }
          />
        ) : filteredCategories.length > 0 ? (
          <div className="space-y-2.5">
            {filteredCategories.map((category) => {
              const categoryItem = toCategoryListItem(category);

              return (
                <CategoryListItem
                  key={category.id}
                  category={categoryItem}
                  onMenuClick={() => handleMenuClick(category)}
                />
              );
            })}
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
        closeOnSubmit={false}
        submitting={submittingCategory}
        initialData={
          selectedCategory && categoryFormMode === 'edit'
            ? {
                name: selectedCategory.name,
                type:
                  selectedCategory.type === 'INCOME' ? 'income' : 'expense',
                icon: getFormIcon(selectedCategory.icon),
                color: selectedCategory.color || defaultCategoryColor,
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
        confirming={deletingCategory}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
