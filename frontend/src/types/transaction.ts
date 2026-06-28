import { type Category } from './category';
import { type CreditCard } from './credit-card';

export type TransactionType = 'EXPENSE' | 'INCOME';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT' | 'CASH' | 'PIX' | 'OTHER';

export type InstallmentStatus = 'OPEN' | 'PAID' | 'CANCELED';

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
  userId?: string;
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
  category?: Category;
  creditCard?: CreditCard | null;
  installments?: TransactionInstallment[];
};

export type TransactionInstallment = {
  id: string;
  transactionId: string;
  userId?: string;
  creditCardId?: string | null;
  amount: number;
  installmentNumber: number;
  totalInstallments: number;
  invoiceMonth: number;
  invoiceYear: number;
  status: InstallmentStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type GetTransactionsFilters = {
  categoryId?: string;
  creditCardId?: string;
  paymentMethod?: PaymentMethod;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
};
