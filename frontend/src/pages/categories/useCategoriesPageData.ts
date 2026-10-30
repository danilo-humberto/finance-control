import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { type CategoryFormValues } from '@/components/categories/CategoryForm';
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
import { useToast } from '@/contexts/ToastContext';

export type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

export type CategoryPageItem = CategoryListItemData & {
  source: Category;
  subcategories: Array<CategoryListItemData & { source: Category }>;
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
    const backendMsg = error.response?.data?.message;
    if (typeof backendMsg === 'string' && backendMsg.trim()) {
      return backendMsg;
    }
    return 'Não foi possível excluir esta categoria. Ela ou suas subcategorias podem estar vinculadas a movimentações.';
  }

  return getApiErrorMessage(error);
}

function getCategoriesSummary(categories: Category[]): CategoriesSummaryData {
  const rootCategories = categories.filter((category) => !category.parentId);
  const subcategories = categories.filter((category) => Boolean(category.parentId));

  return {
    total: rootCategories.length,
    expenses: rootCategories.filter((category) => category.type === 'EXPENSE').length,
    incomes: rootCategories.filter((category) => category.type === 'INCOME').length,
    subcategoriesTotal: subcategories.length,
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

  const parentId =
    values.parentId && values.parentId !== 'root' ? values.parentId : null;

  return {
    name,
    icon: getApiIcon(values.icon),
    color: values.color || defaultCategoryColor,
    type: values.type === 'income' ? 'INCOME' : 'EXPENSE',
    parentId,
  };
}

function toCategoryListItemData(category: Category): CategoryListItemData & { source: Category } {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon || defaultCategoryIcon,
    color: category.color || defaultCategoryColor,
    parentId: category.parentId,
    transactionsCount: 0,
    source: category,
  };
}

export function useCategoriesPageData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const categoriesQuery = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [customInitialData, setCustomInitialData] = useState<Partial<CategoryFormValues> | null>(null);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [categorySubmitError, setCategorySubmitError] = useState<string | null>(
    null,
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

  const parentCategories = useMemo(() => {
    const rootCategories = categories.filter((c) => !c.parentId);
    if (categoryFormMode === 'edit' && selectedCategory) {
      const hasChildren = categories.some((c) => c.parentId === selectedCategory.id);
      if (hasChildren) {
        return [];
      }
      return rootCategories.filter((c) => c.id !== selectedCategory.id);
    }
    return rootCategories;
  }, [categories, categoryFormMode, selectedCategory]);

  const categoryItems: CategoryPageItem[] = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const filterType = getFilterType(activeFilter);

    const rootCategories = categories.filter((c) => !c.parentId);

    return rootCategories
      .filter((root) => {
        const matchesType = !filterType || root.type === filterType;
        if (!matchesType) return false;

        if (!normalizedSearch) return true;

        const rootMatches = normalizeText(root.name).includes(normalizedSearch);
        const subcategories = categories.filter((c) => c.parentId === root.id);
        const subMatches = subcategories.some((sub) =>
          normalizeText(sub.name).includes(normalizedSearch),
        );

        return rootMatches || subMatches;
      })
      .map((root) => {
        const subcategories = categories
          .filter((c) => c.parentId === root.id)
          .filter((sub) => {
            if (!normalizedSearch) return true;
            const rootMatches = normalizeText(root.name).includes(normalizedSearch);
            if (rootMatches) return true;
            return normalizeText(sub.name).includes(normalizedSearch);
          })
          .map(toCategoryListItemData);

        return {
          ...toCategoryListItemData(root),
          subcategories,
        };
      });
  }, [activeFilter, categories, searchTerm]);

  const categoryFormInitialData: Partial<CategoryFormValues> | undefined = useMemo(() => {
    if (categoryFormMode === 'edit' && selectedCategory) {
      return {
        name: selectedCategory.name,
        type: selectedCategory.type === 'INCOME' ? 'income' : 'expense',
        icon: getFormIcon(selectedCategory.icon),
        color: selectedCategory.color || defaultCategoryColor,
        parentId: selectedCategory.parentId ?? null,
      };
    }
    return customInitialData ?? undefined;
  }, [categoryFormMode, customInitialData, selectedCategory]);

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
    setCategorySubmitError(null);
    setSelectedCategory(null);
    setCustomInitialData(null);
    setCategoryFormMode('create');
    setCategorySheetOpen(true);
  }

  function handleAddSubcategory(parent: Category) {
    setFeedbackMessage(null);
    setCategorySubmitError(null);
    setSelectedCategory(null);
    setCustomInitialData({
      parentId: parent.id,
      type: parent.type === 'INCOME' ? 'income' : 'expense',
      color: parent.color || defaultCategoryColor,
      icon: getFormIcon(parent.icon),
    });
    setCategoryFormMode('create');
    setActionSheetOpen(false);
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
    setCategorySubmitError(null);
    setSelectedCategory(categoryToEdit);
    setCustomInitialData(null);
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
    setCategorySubmitError(null);

    let payload: CreateCategoryPayload;

    try {
      payload = toCategoryPayload(values);
    } catch (error) {
      setCategorySubmitError(getApiErrorMessage(error));
      return;
    }

    const isSubcategory = Boolean(payload.parentId);

    try {
      if (categoryFormMode === 'create') {
        await createCategoryMutation.mutateAsync(payload);
        const successMessage = isSubcategory
          ? 'Subcategoria cadastrada com sucesso.'
          : 'Categoria cadastrada com sucesso.';
        toast.create(successMessage);
        setFeedbackMessage({
          tone: 'success',
          message: successMessage,
        });
      } else if (selectedCategory) {
        const updatedCategory = await updateCategoryMutation.mutateAsync({
          id: selectedCategory.id,
          payload,
        });
        const successMessage = isSubcategory
          ? 'Subcategoria atualizada com sucesso.'
          : 'Categoria atualizada com sucesso.';
        toast.edit(successMessage);
        setFeedbackMessage({
          tone: 'success',
          message: successMessage,
        });
        setSelectedCategory(updatedCategory);
      }

      setCategorySheetOpen(false);
      setCustomInitialData(null);
    } catch (error) {
      const errorMsg = getApiErrorMessage(error);
      setCategorySubmitError(errorMsg);
      toast.error(errorMsg);
    }
  }

  const handleCategoryFormOpenChange = useCallback((open: boolean) => {
    setCategorySheetOpen(open);

    if (!open) {
      setCategorySubmitError(null);
      setCustomInitialData(null);
    }
  }, []);

  async function handleConfirmDelete() {
    if (!selectedCategory) {
      return;
    }

    const isSubcategory = Boolean(selectedCategory.parentId);

    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      const successMessage = isSubcategory
        ? 'Subcategoria excluída com sucesso.'
        : 'Categoria excluída com sucesso.';
      toast.delete(successMessage);
      setFeedbackMessage({
        tone: 'success',
        message: successMessage,
      });
      setSelectedCategory(null);
    } catch (error) {
      const errorMsg = getDeleteCategoryErrorMessage(error);
      toast.error(errorMsg);
      setFeedbackMessage({
        tone: 'error',
        message: errorMsg,
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
    categorySubmitError,
    deletingCategory,
    deleteDialogOpen,
    feedbackMessage,
    loadError,
    loading,
    onActionSheetOpenChange: setActionSheetOpen,
    onActiveFilterChange: setActiveFilter,
    onAddSubcategory: handleAddSubcategory,
    onCategoryFormDelete: () => {
      handleCategoryFormOpenChange(false);
      setDeleteDialogOpen(true);
    },
    onCategoryMenuClick: handleCategoryMenuClick,
    onCategorySheetOpenChange: handleCategoryFormOpenChange,
    onCategorySubmit: handleCategorySubmit,
    onConfirmDelete: handleConfirmDelete,
    onCreateClick: handleCreateClick,
    onDeleteCategory: handleDeleteCategory,
    onDeleteDialogOpenChange: setDeleteDialogOpen,
    onEditCategory: handleEditCategory,
    onRetryLoad: () => void categoriesQuery.refetch(),
    onSearchTermChange: setSearchTerm,
    parentCategories,
    searchTerm,
    selectedCategory,
    submittingCategory,
    summary,
  };
}

export type CategoriesPageData = ReturnType<typeof useCategoriesPageData>;
