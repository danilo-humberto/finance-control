import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/services/categoriesService';
import {
  type Category,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@/types/category';
import { queryKeys } from '@/lib/queryKeys';

const categoriesStaleTime = 10 * 60 * 1000;

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: getCategories,
    staleTime: categoriesStaleTime,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (createdCategory) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.list(),
        (currentCategories = []) => [...currentCategories, createdCategory],
      );
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => updateCategory(id, payload),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.list(),
        (currentCategories = []) =>
          currentCategories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
      );
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, deletedCategoryId) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.list(),
        (currentCategories = []) =>
          currentCategories.filter(
            (category) => category.id !== deletedCategoryId,
          ),
      );
    },
  });
}

export type CategoryMutationPayload = CreateCategoryPayload;
