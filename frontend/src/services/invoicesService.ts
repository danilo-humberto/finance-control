import { api } from '@/lib/api';
import { type Invoice, type InvoiceFilters } from '@/types/invoice';

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

export type PayInvoicePayload = {
  month: number;
  year: number;
  creditCardId?: string;
};

export type PayInvoiceResult = {
  month: number;
  year: number;
  creditCardId: string | null;
  paidCount: number;
};

export async function getInvoice(filters: InvoiceFilters) {
  const response = await api.get<ApiResponse<Invoice>>('/invoices', {
    params: filters,
  });

  return unwrapResponseData(response.data);
}

export async function payInvoice(payload: PayInvoicePayload) {
  const response = await api.patch<ApiResponse<PayInvoiceResult>>(
    '/invoices/pay',
    payload,
  );

  return unwrapResponseData(response.data);
}
