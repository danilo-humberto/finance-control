import { api } from '@/lib/api';
import {
  type Category,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@/types/category';

type ApiResponse<T> = T | { data: T };

function unwrapResponseData<T>(responseData: ApiResponse<T>) {
  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    return responseData.data;
  }

  return responseData;
}

export async function getCategories() {
  const response = await api.get<ApiResponse<Category[]>>('/categories');

  return unwrapResponseData(response.data);
}

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await api.post<ApiResponse<Category>>(
    '/categories',
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
) {
  const response = await api.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}
