import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import {
  type CardsSummaryData,
} from '@/components/credit-cards/CardsSummary';
import {
  type CreditCardListItemData,
} from '@/components/credit-cards/CreditCardListItem';
import { type CardFormValues } from '@/components/sheets/CardFormSheet';
import {
  type CreditCardWithUsage,
  useCreateCreditCardMutation,
  useCreditCardsWithUsageQuery,
  useDeleteCreditCardMutation,
  useUpdateCreditCardMutation,
} from '@/hooks/useCreditCardsQuery';
import { queryKeys } from '@/lib/queryKeys';
import { type CreateCreditCardPayload } from '@/types/credit-card';
import {
  getCurrentInvoiceMonthYear,
  getInvoiceDueDateLabel,
} from '@/utils/invoiceCycle';
import { QUICK_CREATE_CREDIT_CARD_CREATED_EVENT } from '@/utils/quickCreateEvents';

export type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

export type CreditCardPageItem = CreditCardListItemData & {
  availableLimit: number;
  isActive: boolean;
  source: CreditCardWithUsage;
  usedPercentage: number;
};

export const defaultCardColor = '#22c55e';

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
      return 'Sua sessão expirou. Entre novamente para acessar seus cartões.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

function parseMoneyValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  if (/^\d+(?:\.\d+)?$/.test(trimmedValue)) {
    return Number.parseFloat(trimmedValue);
  }

  const digits = trimmedValue.replace(/\D/g, '');

  return digits ? Number.parseInt(digits, 10) / 100 : 0;
}

function parseDay(value: string, label: string) {
  const day = Number.parseInt(value, 10);

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`${label} deve ser um número entre 1 e 31.`);
  }

  return day;
}

function buildCreditCardPayload(
  values: CardFormValues,
  selectedCard?: CreditCardWithUsage | null,
): CreateCreditCardPayload {
  const name = values.name.trim();

  if (name.length < 2) {
    throw new Error('Informe o nome do cartão.');
  }

  const limitAmount = parseMoneyValue(values.limit);

  if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
    throw new Error('Informe um limite válido para o cartão.');
  }

  return {
    name,
    limitAmount,
    closingDay: parseDay(values.closingDay, 'Data de fechamento'),
    dueDay: parseDay(values.dueDay, 'Data de vencimento'),
    color: values.color || selectedCard?.color || defaultCardColor,
    isActive: selectedCard?.isActive ?? true,
  };
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

function getDueDateLabel(closingDay: number, dueDay: number) {
  const currentInvoiceMonthYear = getCurrentInvoiceMonthYear(
    closingDay,
    dueDay,
  );

  return getInvoiceDueDateLabel(
    dueDay,
    currentInvoiceMonthYear.month,
    currentInvoiceMonthYear.year,
  );
}

function toCardPageItem(card: CreditCardWithUsage): CreditCardPageItem {
  const limit = Number(card.limitAmount) || 0;
  const used = card.usedLimit;
  const usedPercentage = limit > 0 ? (used / limit) * 100 : 0;

  return {
    id: card.id,
    name: card.name,
    logo: getCardLogo(card.name) || 'CC',
    limit,
    used,
    currentInvoiceTotal: card.currentInvoiceTotal,
    dueDateLabel: getDueDateLabel(card.closingDay, card.dueDay),
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    color: card.color || defaultCardColor,
    availableLimit: limit - used,
    isActive: card.isActive,
    source: card,
    usedPercentage,
  };
}

function getCardsSummary(cards: CreditCardWithUsage[]): CardsSummaryData {
  const totalLimit = cards.reduce(
    (total, card) => total + (Number(card.limitAmount) || 0),
    0,
  );
  const usedLimit = cards.reduce((total, card) => total + card.usedLimit, 0);
  const openInvoiceTotal = cards.reduce(
    (total, card) => total + card.currentInvoiceTotal,
    0,
  );

  return {
    totalLimit,
    usedLimit,
    availableLimit: totalLimit - usedLimit,
    openInvoiceTotal,
    openCardsCount: cards.filter((card) => card.currentInvoiceTotal > 0).length,
    usedPercentage: totalLimit > 0 ? (usedLimit / totalLimit) * 100 : 0,
  };
}

export function useCreditCardsPageData() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creditCardsQuery = useCreditCardsWithUsageQuery();
  const createCreditCardMutation = useCreateCreditCardMutation();
  const updateCreditCardMutation = useUpdateCreditCardMutation();
  const deleteCreditCardMutation = useDeleteCreditCardMutation();
  const [selectedCard, setSelectedCard] = useState<CreditCardWithUsage | null>(
    null,
  );
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null);

  const cards = creditCardsQuery.data ?? [];
  const loading = creditCardsQuery.isPending;
  const loadError = creditCardsQuery.isError
    ? getApiErrorMessage(creditCardsQuery.error)
    : null;
  const submittingCard =
    createCreditCardMutation.isPending || updateCreditCardMutation.isPending;
  const deletingCard = deleteCreditCardMutation.isPending;
  const summary = useMemo(() => getCardsSummary(cards), [cards]);
  const cardItems = useMemo(() => cards.map(toCardPageItem), [cards]);
  const selectedCardItem = useMemo(() => {
    if (selectedCard) {
      return (
        cardItems.find((cardItem) => cardItem.id === selectedCard.id) ?? null
      );
    }

    return cardItems[0] ?? null;
  }, [cardItems, selectedCard]);
  const cardFormInitialData =
    selectedCard && cardFormMode === 'edit'
      ? {
          name: selectedCard.name,
          color: selectedCard.color || defaultCardColor,
          closingDay: String(selectedCard.closingDay),
          dueDay: String(selectedCard.dueDay),
          limit: String(selectedCard.limitAmount),
        }
      : undefined;

  useEffect(() => {
    function handleQuickCreateCreditCardCreated() {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creditCards.all,
      });
    }

    window.addEventListener(
      QUICK_CREATE_CREDIT_CARD_CREATED_EVENT,
      handleQuickCreateCreditCardCreated,
    );

    return () => {
      window.removeEventListener(
        QUICK_CREATE_CREDIT_CARD_CREATED_EVENT,
        handleQuickCreateCreditCardCreated,
      );
    };
  }, [queryClient]);

  function handleCreateClick() {
    setFeedbackMessage(null);
    setSelectedCard(null);
    setCardFormMode('create');
    setCardSheetOpen(true);
  }

  function handleCardMenuClick(card: CreditCardWithUsage) {
    setFeedbackMessage(null);
    setSelectedCard(card);
    setActionSheetOpen(true);
  }

  function handleSelectCard(card: CreditCardWithUsage) {
    setSelectedCard(card);
  }

  function handleEditClick(card?: CreditCardWithUsage | null) {
    const cardToEdit = card ?? selectedCard;

    if (!cardToEdit) {
      return;
    }

    setFeedbackMessage(null);
    setSelectedCard(cardToEdit);
    setCardFormMode('edit');
    setActionSheetOpen(false);
    setCardSheetOpen(true);
  }

  function handleDeleteClick(card?: CreditCardWithUsage | null) {
    const cardToDelete = card ?? selectedCard;

    if (!cardToDelete) {
      return;
    }

    setFeedbackMessage(null);
    setSelectedCard(cardToDelete);
    setActionSheetOpen(false);
    setDeleteDialogOpen(true);
  }

  function handleViewInvoice(card?: CreditCardWithUsage | null) {
    const cardToView = card ?? selectedCard;

    if (!cardToView) {
      return;
    }

    navigate(`/invoices?creditCardId=${encodeURIComponent(cardToView.id)}`);
  }

  async function handleCardSubmit(values: CardFormValues) {
    setFeedbackMessage(null);

    let payload: CreateCreditCardPayload;

    try {
      payload = buildCreditCardPayload(values, selectedCard);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
      return;
    }

    try {
      if (cardFormMode === 'create') {
        await createCreditCardMutation.mutateAsync(payload);
        setFeedbackMessage({
          tone: 'success',
          message: 'Cartão cadastrado com sucesso.',
        });
        setSelectedCard(null);
      } else if (selectedCard) {
        const updatedCard = await updateCreditCardMutation.mutateAsync({
          id: selectedCard.id,
          payload,
        });
        setFeedbackMessage({
          tone: 'success',
          message: 'Cartão atualizado com sucesso.',
        });
        setSelectedCard({
          ...selectedCard,
          ...updatedCard,
        });
      }

      setCardSheetOpen(false);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    }
  }

  async function handleConfirmDelete() {
    if (!selectedCard) {
      return;
    }

    try {
      await deleteCreditCardMutation.mutateAsync(selectedCard.id);
      setFeedbackMessage({
        tone: 'success',
        message: 'Cartão excluído com sucesso.',
      });
      setSelectedCard(null);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    }
  }

  return {
    actionSheetOpen,
    cardFormInitialData,
    cardFormMode,
    cardItems,
    cards,
    cardSheetOpen,
    deleteDialogOpen,
    deletingCard,
    feedbackMessage,
    loadError,
    loading,
    onActionSheetOpenChange: setActionSheetOpen,
    onCardFormDelete: () => {
      setCardSheetOpen(false);
      setDeleteDialogOpen(true);
    },
    onCardMenuClick: handleCardMenuClick,
    onCardSheetOpenChange: setCardSheetOpen,
    onCardSubmit: handleCardSubmit,
    onConfirmDelete: handleConfirmDelete,
    onCreateClick: handleCreateClick,
    onDeleteCard: handleDeleteClick,
    onDeleteDialogOpenChange: setDeleteDialogOpen,
    onEditCard: handleEditClick,
    onRetryLoad: () => void creditCardsQuery.refetch(),
    onSelectCard: handleSelectCard,
    onViewInvoice: handleViewInvoice,
    selectedCard,
    selectedCardItem,
    submittingCard,
    summary,
  };
}

export type CreditCardsPageData = ReturnType<typeof useCreditCardsPageData>;
