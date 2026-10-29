import { api } from '@/lib/api';
import {
  type CreateRecurringTransactionPayload,
  type DeleteRecurringTransactionParams,
  type QueryRecurringTransactionsParams,
  type RecurringTransaction,
  type UpdateRecurringTransactionPayload,
} from '@/types/recurring-transaction';

type ApiResponse<T> = T | { data: T };

function unwrapResponseData<T>(responseData: ApiResponse<T>): T {
  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    return (responseData as { data: T }).data;
  }

  return responseData as T;
}

export async function getRecurringTransactions(
  params?: QueryRecurringTransactionsParams,
): Promise<RecurringTransaction[]> {
  const response = await api.get<ApiResponse<RecurringTransaction[]>>(
    '/recurring-transactions',
    { params },
  );

  return unwrapResponseData(response.data);
}

export async function getRecurringTransactionById(
  id: string,
): Promise<RecurringTransaction> {
  const response = await api.get<ApiResponse<RecurringTransaction>>(
    `/recurring-transactions/${id}`,
  );

  return unwrapResponseData(response.data);
}

export async function createRecurringTransaction(
  payload: CreateRecurringTransactionPayload,
): Promise<RecurringTransaction> {
  const response = await api.post<ApiResponse<RecurringTransaction>>(
    '/recurring-transactions',
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function updateRecurringTransaction(
  id: string,
  payload: UpdateRecurringTransactionPayload,
): Promise<RecurringTransaction> {
  const response = await api.patch<ApiResponse<RecurringTransaction>>(
    `/recurring-transactions/${id}`,
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function deleteRecurringTransaction({
  id,
  includeCurrentMonth,
}: DeleteRecurringTransactionParams): Promise<RecurringTransaction> {
  const response = await api.delete<ApiResponse<RecurringTransaction>>(
    `/recurring-transactions/${id}`,
    {
      params:
        includeCurrentMonth !== undefined
          ? { includeCurrentMonth: String(includeCurrentMonth) }
          : undefined,
    },
  );

  return unwrapResponseData(response.data);
}
