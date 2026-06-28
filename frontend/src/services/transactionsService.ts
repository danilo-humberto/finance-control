import { api } from '@/lib/api';
import {
  type CreateTransactionPayload,
  type Transaction,
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
