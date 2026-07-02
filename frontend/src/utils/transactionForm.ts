import { type CreditCard } from '@/types/credit-card';
import {
  addMonthsToMonthYear,
  getInvoiceMonthYearForPurchaseDate,
} from '@/utils/invoiceCycle';

const invoiceIds = ['current', 'next', 'second-next'] as const;
const invoiceLabels = ['Fatura atual', 'Próxima fatura', 'Segunda próxima'];

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  const parsedValue = Number.parseInt(digits, 10);

  return Number.isFinite(parsedValue) ? parsedValue / 100 : 0;
}

export function formatCurrencyInput(
  value: string,
  formatCurrency: (value: number) => string,
) {
  const digits = value.replace(/\D/g, '');

  if (!digits || /^0+$/.test(digits)) {
    return '';
  }

  return formatCurrency(Number.parseInt(digits, 10) / 100);
}

export function getTodayIsoDate() {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 10);
}

function getIsoDateMonthYear(value: string) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(value);

  if (!match) {
    const [year, month] = getTodayIsoDate().split('-');

    return {
      month: Number(month),
      year: Number(year),
    };
  }

  return {
    month: Number(match[2]),
    year: Number(match[1]),
  };
}

export function getInvoiceOptions(
  purchaseDate: string,
  selectedCard?: CreditCard,
) {
  const baseDate = selectedCard
    ? getInvoiceMonthYearForPurchaseDate(
        purchaseDate,
        selectedCard.closingDay,
        selectedCard.dueDay,
      )
    : getIsoDateMonthYear(purchaseDate);

  return invoiceIds.map((id, index) => {
    const invoiceDate = addMonthsToMonthYear(baseDate, index);

    return {
      id,
      label: invoiceLabels[index],
      detail: `${String(invoiceDate.month).padStart(2, '0')}/${invoiceDate.year}`,
      month: invoiceDate.month,
      year: invoiceDate.year,
    };
  });
}

export function getCardLogo(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function toIsoDate(value: string) {
  return value.split('T')[0];
}
