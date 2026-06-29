import { api } from '@/lib/api';
import {
  type CreateTransactionPayload,
  type PaginatedTransactionsResponse,
  type TransactionFilters,
  type Transaction,
  type UpdateTransactionPayload,
} from '@/types/transaction';

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

export async function createTransaction(payload: CreateTransactionPayload) {
  const response = await api.post<ApiResponse<Transaction>>(
    '/transactions',
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function getTransactions(filters?: TransactionFilters) {
  const response = await api.get<ApiResponse<PaginatedTransactionsResponse>>(
    '/transactions',
    {
      params: filters,
    },
  );

  return unwrapResponseData(response.data);
}

export async function getTransactionById(id: string) {
  const response = await api.get<ApiResponse<Transaction>>(
    `/transactions/${id}`,
  );

  return unwrapResponseData(response.data);
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload,
) {
  const response = await api.patch<ApiResponse<Transaction>>(
    `/transactions/${id}`,
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function deleteTransaction(id: string) {
  const response = await api.delete<ApiResponse<Transaction>>(
    `/transactions/${id}`,
  );

  return unwrapResponseData(response.data);
}
