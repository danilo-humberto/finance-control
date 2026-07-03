import { isAxiosError } from 'axios';
import {
  Ban,
  CheckCircle2,
  CreditCard,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
import {
  type InstallmentAction,
  useInstallmentActionMutation,
  useInvoiceQuery,
} from '@/hooks/useInvoicesQuery';
import { useCategoriesQuery } from '@/hooks/useCategoriesQuery';
import { useCreditCardsQuery } from '@/hooks/useCreditCardsQuery';
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

function parseInvoiceMonthYearParams(
  monthParam: string | null,
  yearParam: string | null,
) {
  const month = Number(monthParam);
  const year = Number(yearParam);

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year)
  ) {
    return null;
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
  const [searchParams] = useSearchParams();
  const currentMonthYear = useMemo(() => getCurrentMonthYear(), []);
  const initialInvoiceMonthYear = useMemo(
    () =>
      parseInvoiceMonthYearParams(
        searchParams.get('month'),
        searchParams.get('year'),
      ),
    [searchParams],
  );
  const initialCreditCardId = searchParams.get('creditCardId') ?? '';
  const [month, setMonth] = useState(
    initialInvoiceMonthYear?.month ?? currentMonthYear.month,
  );
  const [year, setYear] = useState(
    initialInvoiceMonthYear?.year ?? currentMonthYear.year,
  );
  const [selectedCardId, setSelectedCardId] = useState(initialCreditCardId);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [monthManuallyChanged, setMonthManuallyChanged] = useState(
    Boolean(initialInvoiceMonthYear),
  );
  const [selectedInstallment, setSelectedInstallment] =
    useState<InvoiceInstallment | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] =
    useState<FeedbackMessage>(null);

  const cardsQuery = useCreditCardsQuery();
  const categoriesQuery = useCategoriesQuery();
  const installmentActionMutation = useInstallmentActionMutation();

  const cards = cardsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loadingCards = cardsQuery.isPending;
  const loadingCategories = categoriesQuery.isPending;
  const errorCards = cardsQuery.isError
    ? getApiErrorMessage(cardsQuery.error)
    : null;
  const errorCategories = categoriesQuery.isError
    ? getApiErrorMessage(categoriesQuery.error)
    : null;

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

  const invoiceFilters = useMemo(
    () => ({
      month,
      year,
      ...(selectedCardId ? { creditCardId: selectedCardId } : {}),
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
    }),
    [month, selectedCardId, selectedCategoryId, year],
  );
  const waitingForDefaultCard =
    !loadingCards && cards.length > 0 && !selectedCardId;
  const invoiceQueryEnabled = !loadingCards && !waitingForDefaultCard;
  const invoiceQuery = useInvoiceQuery(invoiceFilters, invoiceQueryEnabled);
  const invoice = invoiceQuery.data ?? null;
  const loadingInvoice = waitingForDefaultCard || invoiceQuery.isPending;
  const errorInvoice = invoiceQuery.isError
    ? getApiErrorMessage(invoiceQuery.error)
    : null;
  const actionLoading = installmentActionMutation.isPending;

  const invoiceSummary = useMemo(
    () => buildInvoiceSummary(invoice, selectedCard, month, year),
    [invoice, month, selectedCard, year],
  );

  useEffect(() => {
    const invoiceMonthYear = parseInvoiceMonthYearParams(
      searchParams.get('month'),
      searchParams.get('year'),
    );
    const creditCardId = searchParams.get('creditCardId');

    if (creditCardId) {
      setSelectedCardId(creditCardId);
    }

    if (invoiceMonthYear) {
      setMonth(invoiceMonthYear.month);
      setYear(invoiceMonthYear.year);
      setMonthManuallyChanged(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (loadingCards) {
      return;
    }

    if (cards.length === 0) {
      setSelectedCardId('');
      return;
    }

    setSelectedCardId((currentCardId) => {
      if (cards.some((card) => card.id === currentCardId)) {
        return currentCardId;
      }

      return cards[0]?.id ?? '';
    });
  }, [cards, loadingCards]);

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
    action: InstallmentAction,
    installment: InvoiceInstallment,
  ) {
    setFeedbackMessage(null);

    try {
      await installmentActionMutation.mutateAsync({
        action,
        installmentId: installment.id,
      });

      if (action === 'pay') {
        setFeedbackMessage({
          tone: 'success',
          message: 'Parcela marcada como paga.',
        });
      } else if (action === 'reopen') {
        setFeedbackMessage({
          tone: 'success',
          message: 'Parcela reaberta com sucesso.',
        });
      } else {
        setFeedbackMessage({
          tone: 'success',
          message: 'Parcela cancelada com sucesso.',
        });
      }
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
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
        onRetry={() => void invoiceQuery.refetch()}
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
