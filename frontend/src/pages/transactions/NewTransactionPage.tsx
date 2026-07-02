import { isAxiosError } from 'axios';
import { ArrowLeft, CircleHelp, Save } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthMessage } from '@/components/auth/AuthMessage';
import {
  PaymentMethodCard,
  type PaymentMode,
} from '@/components/transactions/PaymentMethodCard';
import {
  PurchaseDetailsCard,
  type PurchaseCardOption,
  type PurchaseCategoryOption,
  type PurchaseInvoiceOption,
} from '@/components/transactions/PurchaseDetailsCard';
import { PurchaseInfoCard } from '@/components/transactions/PurchaseInfoCard';
import { PurchaseNoteCard } from '@/components/transactions/PurchaseNoteCard';
import { PurchaseSummaryCard } from '@/components/transactions/PurchaseSummaryCard';
import { Button } from '@/components/ui/Button';
import { usePreferences } from '@/hooks/usePreferences';
import { getCategories } from '@/services/categoriesService';
import { getCreditCards } from '@/services/creditCardsService';
import {
  createTransaction,
  getTransactionById,
  updateTransaction,
} from '@/services/transactionsService';
import { type Category } from '@/types/category';
import { type CreditCard } from '@/types/credit-card';
import {
  type CreateTransactionPayload,
  type Transaction,
} from '@/types/transaction';
import {
  addMonthsToMonthYear,
  getInvoiceMonthYearForPurchaseDate,
} from '@/utils/invoiceCycle';

const noteMaxLength = 200;
const defaultColor = '#22c55e';

const invoiceIds = ['current', 'next', 'second-next'] as const;
const invoiceLabels = ['Fatura atual', 'Próxima fatura', 'Segunda próxima'];

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  const parsedValue = Number.parseInt(digits, 10);

  return Number.isFinite(parsedValue) ? parsedValue / 100 : 0;
}

function formatCurrencyInput(
  value: string,
  formatCurrency: (value: number) => string,
) {
  const digits = value.replace(/\D/g, '');

  if (!digits || /^0+$/.test(digits)) {
    return '';
  }

  return formatCurrency(Number.parseInt(digits, 10) / 100);
}

function getTodayIsoDate() {
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

function getInvoiceOptions(
  purchaseDate: string,
  selectedCard?: CreditCard,
): PurchaseInvoiceOption[] {
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

function getCardLogo(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(' ');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if (error.response?.status === 401) {
      return 'Sua sessão expirou. Entre novamente para registrar a compra.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toIsoDate(value: string) {
  return value.split('T')[0];
}

export function NewTransactionPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const { formatCurrency } = usePreferences();
  const isEditMode = Boolean(transactionId);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('current');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayIsoDate);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [note, setNote] = useState('');
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasHydratedTransaction, setHasHydratedTransaction] = useState(false);
  const [hasHydratedInvoice, setHasHydratedInvoice] = useState(false);

  const amountValue = useMemo(() => parseCurrencyInput(amount), [amount]);
  const summaryInstallments = paymentMode === 'cash' ? 1 : installmentCount;

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
    () => categories.filter((category) => category.type === 'EXPENSE'),
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

  const loadCards = useCallback(async () => {
    try {
      setLoadingCards(true);
      setErrorCards(null);
      const loadedCards = await getCreditCards();
      setCards(loadedCards);
    } catch (error) {
      setErrorCards(getApiErrorMessage(error));
    } finally {
      setLoadingCards(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setErrorCategories(null);
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      setErrorCategories(getApiErrorMessage(error));
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadTransaction = useCallback(async () => {
    if (!transactionId) {
      setTransactionToEdit(null);
      setTransactionError(null);
      setHasHydratedTransaction(false);
      setHasHydratedInvoice(false);
      return;
    }

    try {
      setLoadingTransaction(true);
      setTransactionError(null);
      setHasHydratedTransaction(false);
      setHasHydratedInvoice(false);
      const loadedTransaction = await getTransactionById(transactionId);
      setTransactionToEdit(loadedTransaction);
    } catch (error) {
      setTransactionToEdit(null);
      setTransactionError(getApiErrorMessage(error));
    } finally {
      setLoadingTransaction(false);
    }
  }, [transactionId]);

  useEffect(() => {
    void loadCards();
    void loadCategories();
  }, [loadCards, loadCategories]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  useEffect(() => {
    if (!isEditMode || !transactionToEdit || hasHydratedTransaction) {
      return;
    }

    setDescription(transactionToEdit.description);
    setAmount(formatCurrency(Math.abs(transactionToEdit.amount)));
    setPurchaseDate(toIsoDate(transactionToEdit.purchaseDate));
    setPaymentMode(
      transactionToEdit.installmentsCount > 1 ? 'installments' : 'cash',
    );
    setInstallmentCount(Math.max(transactionToEdit.installmentsCount || 1, 1));
    setSelectedCardId(transactionToEdit.creditCardId ?? '');
    setSelectedCategoryId(transactionToEdit.categoryId);
    setSelectedInvoiceId('current');
    setNote(transactionToEdit.notes ?? '');
    setHasHydratedTransaction(true);
  }, [
    formatCurrency,
    hasHydratedTransaction,
    isEditMode,
    transactionToEdit,
  ]);

  useEffect(() => {
    if (
      !isEditMode ||
      !transactionToEdit ||
      hasHydratedInvoice ||
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

    setHasHydratedInvoice(true);
  }, [hasHydratedInvoice, invoiceOptions, isEditMode, transactionToEdit]);

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

      if (expenseCategories.some((category) => category.id === currentCategoryId)) {
        return currentCategoryId;
      }

      return expenseCategories[0]?.id ?? '';
    });
  }, [expenseCategories, isEditMode]);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  function handleAmountChange(value: string) {
    setAmount(formatCurrencyInput(value, formatCurrency));
  }

  function handlePaymentModeChange(mode: PaymentMode) {
    setPaymentMode(mode);

    if (mode === 'cash') {
      setInstallmentCount(1);
    }
  }

  function buildTransactionPayload(): CreateTransactionPayload {
    const trimmedDescription = description.trim();
    const trimmedNote = note.trim();
    const selectedInvoice = invoiceOptions.find(
      (invoice) => invoice.id === selectedInvoiceId,
    );

    if (!trimmedDescription) {
      throw new Error('Informe a descrição da compra.');
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new Error('Informe um valor válido.');
    }

    if (!isIsoDate(purchaseDate)) {
      throw new Error('Selecione a data da compra.');
    }

    if (!selectedCategoryId) {
      throw new Error('Selecione uma categoria.');
    }

    if (!selectedCardId) {
      throw new Error('Selecione um cartão.');
    }

    if (!selectedInvoice) {
      throw new Error('Selecione a fatura de destino.');
    }

    if (!Number.isInteger(summaryInstallments) || summaryInstallments < 1) {
      throw new Error('Informe uma quantidade válida de parcelas.');
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    let payload: CreateTransactionPayload;

    try {
      payload = buildTransactionPayload();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && transactionId) {
        await updateTransaction(transactionId, payload);
      } else {
        await createTransaction(payload);
      }
      navigate('/transactions');
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditMode && loadingTransaction) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <AuthMessage tone="info">Carregando movimentação...</AuthMessage>
      </div>
    );
  }

  if (isEditMode && transactionError) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <AuthMessage tone="error">{transactionError}</AuthMessage>
        <Button type="button" variant="secondary" onClick={handleBack}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3">
        <button
          type="button"
          aria-label="Voltar"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text shadow-lg shadow-black/15 transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="min-w-0 text-center">
          <h1 className="truncate text-[1.36rem] font-bold leading-tight text-app-text">
            {isEditMode ? 'Editar compra' : 'Nova compra'}
          </h1>
          <p className="mt-1 truncate text-[0.8rem] leading-5 text-app-muted">
            {isEditMode
              ? 'Atualize os dados desta compra'
              : 'Adicione uma nova compra ao seu cartão'}
          </p>
        </div>

        <button
          type="button"
          aria-label={isEditMode ? 'Ajuda sobre edição' : 'Ajuda sobre nova compra'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-800/60 bg-app-icon text-brand-400 shadow-lg shadow-brand-950/25 transition-colors hover:bg-brand-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <CircleHelp aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {submitError ? <AuthMessage tone="error">{submitError}</AuthMessage> : null}

      <PurchaseInfoCard
        description={description}
        amount={amount}
        purchaseDate={purchaseDate}
        onDescriptionChange={setDescription}
        onAmountChange={handleAmountChange}
        onPurchaseDateChange={setPurchaseDate}
      />

      <PurchaseDetailsCard
        cards={cardOptions}
        categories={categoryOptions}
        invoices={invoiceOptions}
        selectedCardId={selectedCardId}
        selectedCategoryId={selectedCategoryId}
        selectedInvoiceId={selectedInvoiceId}
        loadingCards={loadingCards}
        loadingCategories={loadingCategories}
        errorCards={errorCards}
        errorCategories={errorCategories}
        onCardChange={setSelectedCardId}
        onCategoryChange={setSelectedCategoryId}
        onInvoiceChange={setSelectedInvoiceId}
      />

      <PaymentMethodCard
        paymentMode={paymentMode}
        installmentCount={installmentCount}
        onPaymentModeChange={handlePaymentModeChange}
        onInstallmentCountChange={setInstallmentCount}
      />

      <PurchaseNoteCard
        note={note}
        maxLength={noteMaxLength}
        onNoteChange={setNote}
      />

      <PurchaseSummaryCard
        amount={amountValue}
        installmentCount={summaryInstallments}
      />

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        disabled={loadingCards || loadingCategories}
        leftIcon={<Save aria-hidden="true" className="h-4 w-4" />}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
      >
        {isSubmitting
          ? 'Salvando...'
          : isEditMode
            ? 'Salvar alterações'
            : 'Salvar compra'}
      </Button>
    </form>
  );
}
