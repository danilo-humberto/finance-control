import { api } from '@/lib/api';
import {
  type CreateCreditCardPayload,
  type CreditCard,
  type UpdateCreditCardPayload,
} from '@/types/credit-card';

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

export async function getCreditCards() {
  const response = await api.get<ApiResponse<CreditCard[]>>('/credit-cards');

  return unwrapResponseData(response.data);
}

export async function createCreditCard(payload: CreateCreditCardPayload) {
  const response = await api.post<ApiResponse<CreditCard>>(
    '/credit-cards',
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function updateCreditCard(
  id: string,
  payload: UpdateCreditCardPayload,
) {
  const response = await api.patch<ApiResponse<CreditCard>>(
    `/credit-cards/${id}`,
    payload,
  );

  return unwrapResponseData(response.data);
}

export async function deleteCreditCard(id: string) {
  await api.delete(`/credit-cards/${id}`);
}
