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

export async function getInvoice(filters: InvoiceFilters) {
  const response = await api.get<ApiResponse<Invoice>>('/invoices', {
    params: filters,
  });

  return unwrapResponseData(response.data);
}
