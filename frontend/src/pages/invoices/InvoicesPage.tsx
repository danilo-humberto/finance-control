import { isAxiosError } from 'axios';
import {
  Ban,
  CheckCircle2,
  CreditCard,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthMessage } from '@/components/auth/AuthMessage';
import {
  InvoiceFilters,
  type InvoiceFilterOption,
} from '@/components/invoices/InvoiceFilters';
import { InvoiceItemsList } from '@/components/invoices/InvoiceItemsList';
import {
  InvoiceSummaryCard,
  type InvoiceSummaryData,
} from '@/components/invoices/InvoiceSummaryCard';
import { ActionSheet, type ActionSheetAction } from '@/components/modals/ActionSheet';
import { Button } from '@/components/ui/Button';
import { getCategories } from '@/services/categoriesService';
import { getCreditCards } from '@/services/creditCardsService';
import {
  cancelInstallment,
  markInstallmentAsPaid,
  reopenInstallment,
} from '@/services/installmentsService';
import { getInvoice } from '@/services/invoicesService';
import { type Category } from '@/types/category';
import { type CreditCard as CreditCardType } from '@/types/credit-card';
import { type Invoice, type InvoiceInstallment } from '@/types/invoice';
import {
  addMonthsToMonthYear,
  getCurrentInvoiceMonthYear,
  getCurrentMonthYear,
  getInvoiceClosingDateLabel,
  getInvoiceDueDateLabel,
} from '@/utils/invoiceCycle';

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

const defaultColor = '#22c55e';
const monthLabels = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function getMonthKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getMonthOptions(month: number, year: number): InvoiceFilterOption[] {
  return Array.from({ length: 25 }, (_item, index) => {
    const optionDate = addMonthsToMonthYear({ month, year }, index - 12);

    return {
      id: getMonthKey(optionDate.month, optionDate.year),
      label: `${monthLabels[optionDate.month - 1]}/${optionDate.year}`,
    };
  });
}

function parseMonthKey(value: string) {
  const [year, month] = value.split('-').map(Number);

  if (!Number.isInteger(month) || !Number.isInteger(year)) {
    return getCurrentMonthYear();
  }

  return { month, year };
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
      return 'Sua sessão expirou. Entre novamente para acessar suas faturas.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

function buildInvoiceSummary(
  invoice: Invoice | null,
  selectedCard: CreditCardType | undefined,
  month: number,
  year: number,
): InvoiceSummaryData {
  const total = invoice?.total ?? 0;
  const limit = Number(selectedCard?.limitAmount) || 0;
  const usedPercentage = limit > 0 ? Math.round((total / limit) * 100) : 0;

  return {
    cardName: selectedCard?.name ?? 'Fatura',
    cardLogo: selectedCard ? getCardLogo(selectedCard.name) || 'CC' : 'FC',
    cardColor: selectedCard?.color || defaultColor,
    status: 'OPEN',
    dueDate: getInvoiceDueDateLabel(selectedCard?.dueDay, month, year),
    closingDate: getInvoiceClosingDateLabel(
      selectedCard?.closingDay,
      selectedCard?.dueDay,
      month,
      year,
    ),
    total,
    limit,
    openAmount: total,
    paidAmount: 0,
    usedPercentage,
  };
}

export function InvoicesPage() {
  const navigate = useNavigate();
  const currentMonthYear = useMemo(() => getCurrentMonthYear(), []);
  const [month, setMonth] = useState(currentMonthYear.month);
  const [year, setYear] = useState(currentMonthYear.year);
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [monthManuallyChanged, setMonthManuallyChanged] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [selectedInstallment, setSelectedInstallment] =
    useState<InvoiceInstallment | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorInvoice, setErrorInvoice] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] =
    useState<FeedbackMessage>(null);

  const selectedMonthId = getMonthKey(month, year);
  const monthOptions = useMemo(
    () => getMonthOptions(currentMonthYear.month, currentMonthYear.year),
    [currentMonthYear.month, currentMonthYear.year],
  );

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId),
    [cards, selectedCardId],
  );

  const cardOptions = useMemo<InvoiceFilterOption[]>(
    () =>
      cards.length > 0
        ? cards.map((card) => ({
            id: card.id,
            label: card.name,
          }))
        : [{ id: '', label: 'Sem cartões' }],
    [cards],
  );

  const categoryOptions = useMemo<InvoiceFilterOption[]>(
    () => [
      { id: '', label: 'Todas categorias' },
      ...categories
        .filter((category) => category.type === 'EXPENSE')
        .map((category) => ({
          id: category.id,
          label: category.name,
        })),
    ],
    [categories],
  );

  const invoiceSummary = useMemo(
    () => buildInvoiceSummary(invoice, selectedCard, month, year),
    [invoice, month, selectedCard, year],
  );

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

  const loadInvoice = useCallback(async () => {
    if (loadingCards || (cards.length > 0 && !selectedCardId)) {
      return;
    }

    try {
      setLoadingInvoice(true);
      setErrorInvoice(null);
      const loadedInvoice = await getInvoice({
        month,
        year,
        ...(selectedCardId ? { creditCardId: selectedCardId } : {}),
        ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
      });
      setInvoice(loadedInvoice);
    } catch (error) {
      setInvoice(null);
      setErrorInvoice(getApiErrorMessage(error));
    } finally {
      setLoadingInvoice(false);
    }
  }, [cards.length, loadingCards, month, selectedCardId, selectedCategoryId, year]);

  useEffect(() => {
    void loadCards();
    void loadCategories();
  }, [loadCards, loadCategories]);

  useEffect(() => {
    setSelectedCardId((currentCardId) => {
      if (cards.some((card) => card.id === currentCardId)) {
        return currentCardId;
      }

      return cards[0]?.id ?? '';
    });
  }, [cards]);

  useEffect(() => {
    if (!selectedCard || monthManuallyChanged) {
      return;
    }

    const currentInvoiceMonthYear = getCurrentInvoiceMonthYear(
      selectedCard.closingDay,
      selectedCard.dueDay,
    );
    setMonth(currentInvoiceMonthYear.month);
    setYear(currentInvoiceMonthYear.year);
  }, [monthManuallyChanged, selectedCard]);

  useEffect(() => {
    setSelectedCategoryId((currentCategoryId) => {
      if (
        !currentCategoryId ||
        categories.some((category) => category.id === currentCategoryId)
      ) {
        return currentCategoryId;
      }

      return '';
    });
  }, [categories]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  function handleMonthChange(value: string) {
    const selectedMonthYear = parseMonthKey(value);
    setMonthManuallyChanged(true);
    setMonth(selectedMonthYear.month);
    setYear(selectedMonthYear.year);
  }

  function handleCardChange(cardId: string) {
    setSelectedCardId(cardId);
    setMonthManuallyChanged(false);

    const card = cards.find((currentCard) => currentCard.id === cardId);

    if (card) {
      const currentInvoiceMonthYear = getCurrentInvoiceMonthYear(
        card.closingDay,
        card.dueDay,
      );
      setMonth(currentInvoiceMonthYear.month);
      setYear(currentInvoiceMonthYear.year);
    }
  }

  function handleInstallmentActionClick(item: InvoiceInstallment) {
    setSelectedInstallment(item);
    setActionSheetOpen(true);
  }

  async function handleInstallmentAction(
    action: 'pay' | 'reopen' | 'cancel',
    installment: InvoiceInstallment,
  ) {
    setFeedbackMessage(null);

    try {
      setActionLoading(true);

      if (action === 'pay') {
        await markInstallmentAsPaid(installment.id);
        setFeedbackMessage({
          tone: 'success',
          message: 'Parcela marcada como paga.',
        });
      } else if (action === 'reopen') {
        await reopenInstallment(installment.id);
        setFeedbackMessage({
          tone: 'success',
          message: 'Parcela reaberta com sucesso.',
        });
      } else {
        await cancelInstallment(installment.id);
        setFeedbackMessage({
          tone: 'success',
          message: 'Parcela cancelada com sucesso.',
        });
      }

      await loadInvoice();
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setActionLoading(false);
      setSelectedInstallment(null);
    }
  }

  const installmentActions = useMemo<ActionSheetAction[]>(() => {
    if (!selectedInstallment) {
      return [];
    }

    if (actionLoading) {
      return [
        {
          label: 'Processando...',
          description: 'Aguarde a atualização da parcela.',
          icon: RotateCcw,
          onClick: () => undefined,
        },
      ];
    }

    if (selectedInstallment.status === 'OPEN') {
      return [
        {
          label: 'Marcar como paga',
          description: 'Atualizar o status desta parcela para paga',
          icon: CheckCircle2,
          onClick: () =>
            void handleInstallmentAction('pay', selectedInstallment),
        },
        {
          label: 'Cancelar parcela',
          description: 'Atualizar o status desta parcela para cancelada',
          icon: Ban,
          variant: 'danger',
          onClick: () =>
            void handleInstallmentAction('cancel', selectedInstallment),
        },
      ];
    }

    return [
      {
        label: 'Reabrir parcela',
        description: 'Voltar o status desta parcela para aberta',
        icon: RotateCcw,
        onClick: () =>
          void handleInstallmentAction('reopen', selectedInstallment),
      },
    ];
  }, [actionLoading, selectedInstallment]);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Fatura
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Acompanhe seus gastos por fatura
          </p>
        </div>

        <button
          type="button"
          aria-label="Abrir filtros da fatura"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-800/60 bg-app-icon text-brand-400 shadow-lg shadow-brand-950/25 transition-colors hover:bg-brand-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : errorCards ? (
        <AuthMessage tone="error">{errorCards}</AuthMessage>
      ) : errorCategories ? (
        <AuthMessage tone="error">{errorCategories}</AuthMessage>
      ) : null}

      <div className="space-y-2.5">
        <InvoiceSummaryCard invoice={invoiceSummary} />
      </div>

      <InvoiceFilters
        monthOptions={monthOptions}
        cardOptions={cardOptions}
        categoryOptions={categoryOptions}
        selectedMonthId={selectedMonthId}
        selectedCardId={selectedCardId}
        selectedCategoryId={selectedCategoryId}
        onMonthChange={handleMonthChange}
        onCardChange={handleCardChange}
        onCategoryChange={setSelectedCategoryId}
      />

      <InvoiceItemsList
        items={invoice?.items ?? []}
        total={invoice?.total ?? 0}
        loading={loadingInvoice || loadingCards || loadingCategories}
        error={errorInvoice}
        onRetry={() => void loadInvoice()}
        onNewPurchase={() => navigate('/transactions/new')}
        onItemActionClick={handleInstallmentActionClick}
      />

      <Button
        type="button"
        size="lg"
        disabled
        title="O backend ainda não possui endpoint para marcar a fatura inteira como paga."
        leftIcon={<CreditCard aria-hidden="true" className="h-4 w-4" />}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
      >
        Marcar fatura como paga
      </Button>

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={selectedInstallment?.description ?? 'Parcela'}
        actions={installmentActions}
      />
    </div>
  );
}
