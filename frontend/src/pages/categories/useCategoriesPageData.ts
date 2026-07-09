import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import {
  type CategoriesSummaryData,
} from '@/components/categories/CategoriesSummary';
import {
  type CategoryFilter,
} from '@/components/categories/CategoryFilterTabs';
import {
  type CategoryListItemData,
} from '@/components/categories/CategoryListItem';
import { type CategoryFormValues } from '@/components/sheets/CategoryFormSheet';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/hooks/useCategoriesQuery';
import { queryKeys } from '@/lib/queryKeys';
import {
  type Category,
  type CategoryType,
  type CreateCategoryPayload,
} from '@/types/category';
import { QUICK_CREATE_CATEGORY_CREATED_EVENT } from '@/utils/quickCreateEvents';

export type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

export type CategoryPageItem = CategoryListItemData & {
  source: Category;
};

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

  return (
    formIconByApiIcon[apiIcon] ??
    formIconByApiIcon[apiIcon.toLowerCase()] ??
    'Utensils'
  );
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

function toCategoryPageItem(category: Category): CategoryPageItem {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon || defaultCategoryIcon,
    color: category.color || defaultCategoryColor,
    transactionsCount: 0,
    source: category,
  };
}

export function useCategoriesPageData() {
  const queryClient = useQueryClient();
  const categoriesQuery = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
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
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null);

  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isPending;
  const loadError = categoriesQuery.isError
    ? getApiErrorMessage(categoriesQuery.error)
    : null;
  const submittingCategory =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const deletingCategory = deleteCategoryMutation.isPending;
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

  const categoryItems = useMemo(
    () => filteredCategories.map(toCategoryPageItem),
    [filteredCategories],
  );
  const categoryFormInitialData: Partial<CategoryFormValues> | undefined =
    selectedCategory && categoryFormMode === 'edit'
      ? {
          name: selectedCategory.name,
          type: selectedCategory.type === 'INCOME' ? 'income' : 'expense',
          icon: getFormIcon(selectedCategory.icon),
          color: selectedCategory.color || defaultCategoryColor,
        }
      : undefined;

  useEffect(() => {
    function handleQuickCreateCategoryCreated() {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    }

    window.addEventListener(
      QUICK_CREATE_CATEGORY_CREATED_EVENT,
      handleQuickCreateCategoryCreated,
    );

    return () => {
      window.removeEventListener(
        QUICK_CREATE_CATEGORY_CREATED_EVENT,
        handleQuickCreateCategoryCreated,
      );
    };
  }, [queryClient]);

  function handleCreateClick() {
    setFeedbackMessage(null);
    setSelectedCategory(null);
    setCategoryFormMode('create');
    setCategorySheetOpen(true);
  }

  function handleCategoryMenuClick(category: Category) {
    setFeedbackMessage(null);
    setSelectedCategory(category);
    setActionSheetOpen(true);
  }

  function handleEditCategory(category?: Category | null) {
    const categoryToEdit = category ?? selectedCategory;

    if (!categoryToEdit) {
      return;
    }

    setFeedbackMessage(null);
    setSelectedCategory(categoryToEdit);
    setCategoryFormMode('edit');
    setActionSheetOpen(false);
    setCategorySheetOpen(true);
  }

  function handleDeleteCategory(category?: Category | null) {
    const categoryToDelete = category ?? selectedCategory;

    if (!categoryToDelete) {
      return;
    }

    setFeedbackMessage(null);
    setSelectedCategory(categoryToDelete);
    setActionSheetOpen(false);
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
      if (categoryFormMode === 'create') {
        await createCategoryMutation.mutateAsync(payload);
        setFeedbackMessage({
          tone: 'success',
          message: 'Categoria cadastrada com sucesso.',
        });
      } else if (selectedCategory) {
        const updatedCategory = await updateCategoryMutation.mutateAsync({
          id: selectedCategory.id,
          payload,
        });
        setFeedbackMessage({
          tone: 'success',
          message: 'Categoria atualizada com sucesso.',
        });
        setSelectedCategory(updatedCategory);
      }

      setCategorySheetOpen(false);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    }
  }

  async function handleConfirmDelete() {
    if (!selectedCategory) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id);
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
    }
  }

  return {
    actionSheetOpen,
    activeFilter,
    categories,
    categoryFormInitialData,
    categoryFormMode,
    categoryItems,
    categorySheetOpen,
    deletingCategory,
    deleteDialogOpen,
    feedbackMessage,
    loadError,
    loading,
    onActionSheetOpenChange: setActionSheetOpen,
    onActiveFilterChange: setActiveFilter,
    onCategoryFormDelete: () => {
      setCategorySheetOpen(false);
      setDeleteDialogOpen(true);
    },
    onCategoryMenuClick: handleCategoryMenuClick,
    onCategorySheetOpenChange: setCategorySheetOpen,
    onCategorySubmit: handleCategorySubmit,
    onConfirmDelete: handleConfirmDelete,
    onCreateClick: handleCreateClick,
    onDeleteCategory: handleDeleteCategory,
    onDeleteDialogOpenChange: setDeleteDialogOpen,
    onEditCategory: handleEditCategory,
    onRetryLoad: () => void categoriesQuery.refetch(),
    onSearchTermChange: setSearchTerm,
    searchTerm,
    selectedCategory,
    submittingCategory,
    summary,
  };
}

export type CategoriesPageData = ReturnType<typeof useCategoriesPageData>;
