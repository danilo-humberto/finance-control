import { type InstallmentStatus, type PaymentMethod, type TransactionType } from './transaction';

export type DashboardCurrentInvoice = {
  id: string;
  creditCardId: string;
  cardName: string;
  cardLogo: string;
  cardColor: string;
  status: InstallmentStatus;
  total: number;
  openAmount: number;
  paidAmount: number;
  canceledAmount: number;
  dueDate: string;
  closingDate: string;
  limit: number;
  usedPercentage: number;
  month: number;
  year: number;
};

export type DashboardRecentTransaction = {
  id: string;
  description: string;
  categoryName: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  paymentLabel: string;
  dateLabel: string;
  amount: number;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
};
