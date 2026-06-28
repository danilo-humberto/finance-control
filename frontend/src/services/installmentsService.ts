import { api } from '@/lib/api';
import { type InvoiceInstallment } from '@/types/invoice';

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

export async function markInstallmentAsPaid(id: string) {
  const response = await api.patch<ApiResponse<InvoiceInstallment>>(
    `/invoices/installments/${id}/pay`,
  );

  return unwrapResponseData(response.data);
}

export async function reopenInstallment(id: string) {
  const response = await api.patch<ApiResponse<InvoiceInstallment>>(
    `/invoices/installments/${id}/reopen`,
  );

  return unwrapResponseData(response.data);
}

export async function cancelInstallment(id: string) {
  const response = await api.patch<ApiResponse<InvoiceInstallment>>(
    `/invoices/installments/${id}/cancel`,
  );

  return unwrapResponseData(response.data);
}
