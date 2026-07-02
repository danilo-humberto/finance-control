import { type CreateTransactionPayload } from '@/types/transaction';
import { isIsoDate } from '@/utils/transactionForm';

type TransactionPayloadInvoiceOption = {
  id: string;
  month: number;
  year: number;
};

type BuildTransactionPayloadParams = {
  amountValue: number;
  description: string;
  invoiceOptions: TransactionPayloadInvoiceOption[];
  isEditMode: boolean;
  note: string;
  purchaseDate: string;
  selectedCardId: string;
  selectedCategoryId: string;
  selectedInvoiceId: string;
  summaryInstallments: number;
};

export function buildTransactionPayload({
  amountValue,
  description,
  invoiceOptions,
  isEditMode,
  note,
  purchaseDate,
  selectedCardId,
  selectedCategoryId,
  selectedInvoiceId,
  summaryInstallments,
}: BuildTransactionPayloadParams): CreateTransactionPayload {
  const trimmedDescription = description.trim();
  const trimmedNote = note.trim();
  const selectedInvoice = invoiceOptions.find(
    (invoice) => invoice.id === selectedInvoiceId,
  );

  if (!trimmedDescription) {
    throw new Error('Informe a descri\u00e7\u00e3o da compra.');
  }

  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    throw new Error('Informe um valor v\u00e1lido.');
  }

  if (!isIsoDate(purchaseDate)) {
    throw new Error('Selecione a data da compra.');
  }

  if (!selectedCategoryId) {
    throw new Error('Selecione uma categoria.');
  }

  if (!selectedCardId) {
    throw new Error('Selecione um cart\u00e3o.');
  }

  if (!selectedInvoice) {
    throw new Error('Selecione a fatura de destino.');
  }

  if (!Number.isInteger(summaryInstallments) || summaryInstallments < 1) {
    throw new Error('Informe uma quantidade v\u00e1lida de parcelas.');
  }

  if (!selectedInvoice.month || !selectedInvoice.year) {
    throw new Error('Selecione a fatura de destino.');
  }

  const payload: CreateTransactionPayload = {
    description: trimmedDescription,
    amount: amountValue,
    transactionType: 'EXPENSE',
    paymentMethod: 'CREDIT_CARD',
    purchaseDate,
    categoryId: selectedCategoryId,
    creditCardId: selectedCardId,
    installmentsCount: summaryInstallments,
    invoiceStartMonth: selectedInvoice.month,
    invoiceStartYear: selectedInvoice.year,
  };

  if (trimmedNote || isEditMode) {
    payload.notes = trimmedNote;
  }

  return payload;
}
