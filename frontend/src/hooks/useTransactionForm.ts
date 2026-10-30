import { useCallback, useEffect, useMemo, useState } from 'react';

import { type PaymentMode } from '@/components/transactions/PaymentMethodCard';
import {
  type PurchaseCardOption,
  type PurchaseCategoryOption,
} from '@/components/transactions/PurchaseDetailsCard';
import { useCategoriesQuery } from '@/hooks/useCategoriesQuery';
import { useCreditCardsQuery } from '@/hooks/useCreditCardsQuery';
import { usePreferences } from '@/hooks/usePreferences';
import { useTransactionQuery } from '@/hooks/useTransactionsQuery';
import {
  formatCurrencyInput,
  getCardLogo,
  getInvoiceOptions,
  getTodayIsoDate,
  parseCurrencyInput,
  toIsoDate,
} from '@/utils/transactionForm';

const defaultColor = '#22c55e';

type UseTransactionFormParams = {
  transactionId?: string;
  getErrorMessage: (error: unknown) => string;
};

export function useTransactionForm({
  transactionId,
  getErrorMessage,
}: UseTransactionFormParams) {
  const { formatCurrency } = usePreferences();
  const isEditMode = Boolean(transactionId);
  const categoriesQuery = useCategoriesQuery();
  const creditCardsQuery = useCreditCardsQuery();
  const transactionQuery = useTransactionQuery(transactionId);
  const cards = creditCardsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const transactionToEdit = transactionQuery.data ?? null;
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('current');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayIsoDate);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [note, setNote] = useState('');
  const [hydratedTransactionId, setHydratedTransactionId] = useState<
    string | null
  >(null);
  const [hydratedInvoiceTransactionId, setHydratedInvoiceTransactionId] =
    useState<string | null>(null);
  const loadingCards = creditCardsQuery.isPending;
  const loadingCategories = categoriesQuery.isPending;
  const loadingTransaction = isEditMode && transactionQuery.isPending;
  const errorCards = creditCardsQuery.isError
    ? getErrorMessage(creditCardsQuery.error)
    : null;
  const errorCategories = categoriesQuery.isError
    ? getErrorMessage(categoriesQuery.error)
    : null;
  const transactionError =
    isEditMode && transactionQuery.isError
      ? getErrorMessage(transactionQuery.error)
      : null;

  const amountValue = useMemo(() => parseCurrencyInput(amount), [amount]);
  const summaryInstallments =
    paymentMode === 'installments' ? installmentCount : 1;

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId),
    [cards, selectedCardId],
  );

  const cardOptions = useMemo<PurchaseCardOption[]>(
    () =>
      cards.map((card) => ({
        id: card.id,
        name: card.name,
        logo: getCardLogo(card.name) || 'CC',
        color: card.color || defaultColor,
      })),
    [cards],
  );

  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === 'EXPENSE' && !category.parentId,
      ),
    [categories],
  );

  const categoryOptions = useMemo<PurchaseCategoryOption[]>(
    () =>
      expenseCategories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color || defaultColor,
      })),
    [expenseCategories],
  );

  const availableSubcategories = useMemo(
    () =>
      selectedCategoryId
        ? categories.filter(
            (category) =>
              category.type === 'EXPENSE' &&
              category.parentId === selectedCategoryId,
          )
        : [],
    [categories, selectedCategoryId],
  );

  const subcategoryOptions = useMemo<PurchaseCategoryOption[]>(
    () =>
      availableSubcategories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color || defaultColor,
      })),
    [availableSubcategories],
  );

  const invoiceOptions = useMemo(() => {
    const options = getInvoiceOptions(purchaseDate, selectedCard);
    const originalInvoiceMonth = transactionToEdit?.invoiceStartMonth;
    const originalInvoiceYear = transactionToEdit?.invoiceStartYear;

    if (
      !isEditMode ||
      !originalInvoiceMonth ||
      !originalInvoiceYear ||
      options.some(
        (option) =>
          option.month === originalInvoiceMonth &&
          option.year === originalInvoiceYear,
      )
    ) {
      return options;
    }

    return [
      ...options,
      {
        id: 'original',
        label: 'Fatura original',
        detail: `${String(originalInvoiceMonth).padStart(2, '0')}/${originalInvoiceYear}`,
        month: originalInvoiceMonth,
        year: originalInvoiceYear,
      },
    ];
  }, [isEditMode, purchaseDate, selectedCard, transactionToEdit]);

  useEffect(() => {
    if (
      !isEditMode ||
      !transactionToEdit ||
      hydratedTransactionId === transactionToEdit.id
    ) {
      return;
    }

    setDescription(transactionToEdit.description);
    setAmount(formatCurrency(Math.abs(transactionToEdit.amount)));
    setPurchaseDate(toIsoDate(transactionToEdit.purchaseDate));
    setPaymentMode(
      transactionToEdit.recurringTransactionId
        ? 'recurring'
        : transactionToEdit.installmentsCount > 1
          ? 'installments'
          : 'cash',
    );
    setInstallmentCount(Math.max(transactionToEdit.installmentsCount || 1, 1));
    setSelectedCardId(transactionToEdit.creditCardId ?? '');
    setSelectedCategoryId(transactionToEdit.categoryId);
    setSelectedSubcategoryId(transactionToEdit.subcategoryId ?? '');
    setSelectedInvoiceId('current');
    setNote(transactionToEdit.notes ?? '');
    setHydratedTransactionId(transactionToEdit.id);
    setHydratedInvoiceTransactionId(null);
  }, [
    formatCurrency,
    hydratedTransactionId,
    isEditMode,
    transactionToEdit,
  ]);

  useEffect(() => {
    if (
      !isEditMode ||
      !transactionToEdit ||
      hydratedInvoiceTransactionId === transactionToEdit.id ||
      invoiceOptions.length === 0
    ) {
      return;
    }

    const originalInvoice = invoiceOptions.find(
      (invoice) =>
        invoice.month === transactionToEdit.invoiceStartMonth &&
        invoice.year === transactionToEdit.invoiceStartYear,
    );

    if (originalInvoice) {
      setSelectedInvoiceId(originalInvoice.id);
    }

    setHydratedInvoiceTransactionId(transactionToEdit.id);
  }, [
    hydratedInvoiceTransactionId,
    invoiceOptions,
    isEditMode,
    transactionToEdit,
  ]);

  useEffect(() => {
    setSelectedCardId((currentCardId) => {
      if (isEditMode && cards.length === 0) {
        return currentCardId;
      }

      if (cards.some((card) => card.id === currentCardId)) {
        return currentCardId;
      }

      return cards[0]?.id ?? '';
    });
  }, [cards, isEditMode]);

  useEffect(() => {
    setSelectedCategoryId((currentCategoryId) => {
      if (isEditMode && expenseCategories.length === 0) {
        return currentCategoryId;
      }

      if (
        expenseCategories.some(
          (category) => category.id === currentCategoryId,
        )
      ) {
        return currentCategoryId;
      }

      return expenseCategories[0]?.id ?? '';
    });
  }, [expenseCategories, isEditMode]);

  useEffect(() => {
    setSelectedSubcategoryId((currentSubcategoryId) => {
      if (!currentSubcategoryId) {
        return '';
      }

      const exists = availableSubcategories.some(
        (sub) => sub.id === currentSubcategoryId,
      );

      return exists ? currentSubcategoryId : '';
    });
  }, [availableSubcategories]);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(formatCurrencyInput(value, formatCurrency));
    },
    [formatCurrency],
  );

  const handlePaymentModeChange = useCallback((mode: PaymentMode) => {
    setPaymentMode(mode);

    if (mode === 'cash' || mode === 'recurring') {
      setInstallmentCount(1);
    }
  }, []);

  return {
    amount,
    amountValue,
    cardOptions,
    categoryOptions,
    subcategoryOptions,
    description,
    errorCards,
    errorCategories,
    handleAmountChange,
    handlePaymentModeChange,
    installmentCount,
    invoiceOptions,
    isEditMode,
    loadingCards,
    loadingCategories,
    loadingTransaction,
    note,
    paymentMode,
    purchaseDate,
    selectedCardId,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedInvoiceId,
    setDescription,
    setInstallmentCount,
    setNote,
    setPurchaseDate,
    setSelectedCardId,
    setSelectedCategoryId,
    setSelectedSubcategoryId,
    setSelectedInvoiceId,
    summaryInstallments,
    transactionError,
  };
}
