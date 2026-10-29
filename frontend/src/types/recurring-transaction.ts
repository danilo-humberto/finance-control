import { type Category } from './category';
import { type CreditCard } from './credit-card';
import { type PaymentMethod, type TransactionType } from './transaction';

export type RecurringTransaction = {
  id: string;
  userId: string;
  creditCardId?: string | null;
  categoryId: string;
  description: string;
  amount: number;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  billingDay: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  canceledAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  creditCard?: CreditCard | null;
};

export type CreateRecurringTransactionPayload = {
  description: string;
  amount: number;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  categoryId: string;
  creditCardId?: string;
  billingDay: number;
  startDate: string;
  endDate?: string;
  notes?: string;
};

export type UpdateRecurringTransactionPayload = Partial<CreateRecurringTransactionPayload> & {
  isActive?: boolean;
};

export type QueryRecurringTransactionsParams = {
  isActive?: boolean;
  creditCardId?: string;
  categoryId?: string;
};

export type DeleteRecurringTransactionParams = {
  id: string;
  includeCurrentMonth?: boolean;
};
