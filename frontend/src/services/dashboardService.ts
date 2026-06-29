import { getCreditCards } from '@/services/creditCardsService';
import { getInvoice } from '@/services/invoicesService';
import { getTransactions } from '@/services/transactionsService';
import {
  type DashboardCurrentInvoice,
  type DashboardRecentTransaction,
} from '@/types/dashboard';
import { type CreditCard } from '@/types/credit-card';
import { type Invoice, type InvoiceInstallment } from '@/types/invoice';
import { type PaymentMethod, type Transaction } from '@/types/transaction';
import {
  getCurrentInvoiceMonthYear,
  getInvoiceClosingDateLabel,
  getInvoiceDueDateLabel,
} from '@/utils/invoiceCycle';

const defaultColor = '#22c55e';

const paymentMethodLabel: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT: 'Débito',
  CASH: 'Dinheiro',
  PIX: 'Pix',
  OTHER: 'Outro',
};

function getCardLogo(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatPurchaseDate(value: string) {
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function sumInstallmentsByStatus(
  items: InvoiceInstallment[],
  status: InvoiceInstallment['status'],
) {
  return items
    .filter((item) => item.status === status)
    .reduce((total, item) => total + item.amount, 0);
}

function toDashboardInvoice(
  card: CreditCard,
  invoice: Invoice,
): DashboardCurrentInvoice {
  const total = invoice.total || invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const limit = Number(card.limitAmount) || 0;
  const usedPercentage = limit > 0 ? Math.round((total / limit) * 100) : 0;

  return {
    id: `${card.id}-${invoice.month}-${invoice.year}`,
    creditCardId: card.id,
    cardName: card.name,
    cardLogo: getCardLogo(card.name) || 'CC',
    cardColor: card.color || defaultColor,
    status: 'OPEN',
    total,
    openAmount: sumInstallmentsByStatus(invoice.items, 'OPEN') || total,
    paidAmount: sumInstallmentsByStatus(invoice.items, 'PAID'),
    canceledAmount: sumInstallmentsByStatus(invoice.items, 'CANCELED'),
    dueDate: getInvoiceDueDateLabel(card.dueDay, invoice.month, invoice.year),
    closingDate: getInvoiceClosingDateLabel(
      card.closingDay,
      card.dueDay,
      invoice.month,
      invoice.year,
    ),
    limit,
    usedPercentage,
    month: invoice.month,
    year: invoice.year,
  };
}

function getPaymentLabel(transaction: Transaction) {
  if (transaction.creditCard?.name) {
    return transaction.creditCard.name;
  }

  return paymentMethodLabel[transaction.paymentMethod] ?? transaction.paymentMethod;
}

function toDashboardTransaction(
  transaction: Transaction,
): DashboardRecentTransaction {
  const isExpense = transaction.transactionType === 'EXPENSE';

  return {
    id: transaction.id,
    description: transaction.description,
    categoryName: transaction.category?.name ?? 'Categoria',
    categoryIcon: transaction.category?.icon,
    categoryColor: transaction.category?.color,
    paymentLabel: getPaymentLabel(transaction),
    dateLabel: formatPurchaseDate(transaction.purchaseDate),
    amount: isExpense ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
    transactionType: transaction.transactionType,
    paymentMethod: transaction.paymentMethod,
  };
}

export async function getDashboardInvoices() {
  const cards = await getCreditCards();
  const activeCards = cards.filter((card) => card.isActive !== false);

  const invoices = await Promise.all(
    activeCards.map(async (card) => {
      const { month, year } = getCurrentInvoiceMonthYear(card.dueDay);
      const invoice = await getInvoice({
        month,
        year,
        creditCardId: card.id,
      });

      return toDashboardInvoice(card, invoice);
    }),
  );

  return invoices;
}

export async function getDashboardRecentTransactions() {
  const transactions = await getTransactions({
    page: 1,
    limit: 5,
  });

  return transactions.items.map(toDashboardTransaction);
}
