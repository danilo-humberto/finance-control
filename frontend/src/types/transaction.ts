export type TransactionType = 'EXPENSE' | 'INCOME';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT' | 'CASH' | 'PIX' | 'OTHER';

export type CreateTransactionPayload = {
  description: string;
  amount: number;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  purchaseDate: string;
  categoryId: string;
  creditCardId?: string;
  installmentsCount?: number;
  invoiceStartMonth?: number;
  invoiceStartYear?: number;
  notes?: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  purchaseDate: string;
  categoryId: string;
  creditCardId?: string | null;
  installmentsCount: number;
  invoiceStartMonth?: number | null;
  invoiceStartYear?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
