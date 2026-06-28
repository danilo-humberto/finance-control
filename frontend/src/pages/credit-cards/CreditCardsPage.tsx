import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CardsSummary,
  type CardsSummaryData,
} from '@/components/credit-cards/CardsSummary';
import {
  CreditCardListItem,
  type CreditCardListItemData,
} from '@/components/credit-cards/CreditCardListItem';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import {
  CardFormSheet,
  type CardFormValues,
} from '@/components/sheets/CardFormSheet';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  createCreditCard,
  deleteCreditCard,
  getCreditCards,
  updateCreditCard,
} from '@/services/creditCardsService';
import {
  type CreateCreditCardPayload,
  type CreditCard,
} from '@/types/credit-card';
import {
  ChevronRight,
  CreditCard as CreditCardIcon,
  Edit3,
  Info,
  LoaderCircle,
  PieChart,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { isAxiosError } from 'axios';

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

const defaultCardColor = '#22c55e';

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
  selectedCard?: CreditCard | null,
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

function getDueDateLabel(dueDay: number) {
  const currentMonth = new Date().getMonth() + 1;

  return `${String(dueDay).padStart(2, '0')}/${String(currentMonth).padStart(
    2,
    '0',
  )}`;
}

function toCardListItem(card: CreditCard): CreditCardListItemData {
  const limitAmount = Number(card.limitAmount) || 0;

  return {
    id: card.id,
    name: card.name,
    logo: getCardLogo(card.name) || 'CC',
    limit: limitAmount,
    used: 0,
    currentInvoiceTotal: 0,
    dueDateLabel: getDueDateLabel(card.dueDay),
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    color: card.color || defaultCardColor,
  };
}

function getCardsSummary(cards: CreditCard[]): CardsSummaryData {
  const totalLimit = cards.reduce(
    (total, card) => total + (Number(card.limitAmount) || 0),
    0,
  );
  const usedLimit = 0;

  return {
    totalLimit,
    usedLimit,
    availableLimit: totalLimit - usedLimit,
    openInvoiceTotal: 0,
    openCardsCount: 0,
    usedPercentage: totalLimit > 0 ? (usedLimit / totalLimit) * 100 : 0,
  };
}

function CreditCardsLoadingState() {
  return (
    <div className="space-y-2.5" aria-label="Carregando cartões">
      {[0, 1, 2].map((item) => (
        <article
          key={item}
          className="grid grid-cols-[5.75rem_1fr] gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15"
        >
          <div className="h-[4.05rem] animate-pulse rounded-xl bg-app-elevated" />
          <div className="space-y-2 py-1">
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-app-elevated" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-2.5 w-28 animate-pulse rounded-full bg-app-elevated" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function CreditCardsPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showOrderHint, setShowOrderHint] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submittingCard, setSubmittingCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage>(null);

  const summary = useMemo(() => getCardsSummary(cards), [cards]);

  const loadCreditCards = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const creditCards = await getCreditCards();
      setCards(creditCards);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCreditCards();
  }, [loadCreditCards]);

  function handleCreateClick() {
    setFeedbackMessage(null);
    setSelectedCard(null);
    setCardFormMode('create');
    setCardSheetOpen(true);
  }

  function handleMenuClick(card: CreditCard) {
    setFeedbackMessage(null);
    setSelectedCard(card);
    setActionSheetOpen(true);
  }

  function handleEditClick() {
    setCardFormMode('edit');
    setCardSheetOpen(true);
  }

  function handleDeleteClick() {
    setDeleteDialogOpen(true);
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
      setSubmittingCard(true);

      if (cardFormMode === 'create') {
        const createdCard = await createCreditCard(payload);
        setCards((currentCards) => [...currentCards, createdCard]);
        setFeedbackMessage({
          tone: 'success',
          message: 'Cartão cadastrado com sucesso.',
        });
      } else if (selectedCard) {
        const updatedCard = await updateCreditCard(selectedCard.id, payload);
        setCards((currentCards) =>
          currentCards.map((card) =>
            card.id === selectedCard.id ? updatedCard : card,
          ),
        );
        setFeedbackMessage({
          tone: 'success',
          message: 'Cartão atualizado com sucesso.',
        });
      }

      setSelectedCard(null);
      setCardSheetOpen(false);
    } catch (error) {
      setFeedbackMessage({
        tone: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingCard(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedCard) {
      return;
    }

    try {
      setDeletingCard(true);
      await deleteCreditCard(selectedCard.id);
      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== selectedCard.id),
      );
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
    } finally {
      setDeletingCard(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Cartões
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Gerencie seus cartões de crédito
          </p>
        </div>

        <button
          type="button"
          aria-label="Adicionar cartão"
          onClick={handleCreateClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <CardsSummary summary={summary} />

      <section className="space-y-2" aria-labelledby="credit-cards-title">
        <h2
          id="credit-cards-title"
          className="text-[0.94rem] font-semibold leading-tight"
        >
          Meus cartões
        </h2>

        {loading ? (
          <CreditCardsLoadingState />
        ) : loadError ? (
          <EmptyState
            icon={
              <LoaderCircle
                aria-hidden="true"
                className="h-5 w-5 text-brand-400"
              />
            }
            title="Não foi possível carregar os cartões"
            description={loadError}
            action={
              <Button type="button" onClick={() => void loadCreditCards()}>
                Tentar novamente
              </Button>
            }
          />
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<CreditCardIcon aria-hidden="true" className="h-5 w-5" />}
            title="Nenhum cartão cadastrado"
            description="Cadastre seu primeiro cartão para acompanhar suas faturas."
            action={
              <Button
                type="button"
                leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
                onClick={handleCreateClick}
              >
                Adicionar cartão
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {cards.map((card) => {
              const cardItem = toCardListItem(card);

              return (
                <CreditCardListItem
                  key={card.id}
                  card={cardItem}
                  onMenuClick={() => handleMenuClick(card)}
                />
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        className="flex h-10 w-full items-center gap-2.5 rounded-2xl border border-brand-800/65 bg-brand-950/35 px-3 text-left text-[0.8rem] font-semibold text-brand-400 shadow-lg shadow-black/15 transition-colors hover:bg-brand-900/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <PieChart aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Ver relatório de cartões</span>
        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0" />
      </button>

      {showOrderHint ? (
        <aside className="flex items-start gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
            <Info aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.76rem] font-semibold leading-4 text-app-text">
              Arraste os cartões para reordenar
            </p>
            <p className="mt-0.5 text-[0.66rem] leading-4 text-app-muted">
              A ordem exibida aqui será refletida no dashboard.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar aviso de ordenação"
            onClick={() => setShowOrderHint(false)}
            className="rounded-full p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </aside>
      ) : null}

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={selectedCard ? selectedCard.name : 'Cartão'}
        actions={[
          {
            label: 'Editar cartão',
            description: 'Alterar dados e limite do cartão',
            icon: Edit3,
            onClick: handleEditClick,
          },
          {
            label: 'Excluir cartão',
            description: 'Remover este cartão da lista',
            icon: Trash2,
            variant: 'danger',
            onClick: handleDeleteClick,
          },
        ]}
      />

      <CardFormSheet
        open={cardSheetOpen}
        onOpenChange={setCardSheetOpen}
        mode={cardFormMode}
        closeOnSubmit={false}
        submitting={submittingCard}
        initialData={
          selectedCard && cardFormMode === 'edit'
            ? {
                name: selectedCard.name,
                color: selectedCard.color || defaultCardColor,
                closingDay: String(selectedCard.closingDay),
                dueDay: String(selectedCard.dueDay),
                limit: String(selectedCard.limitAmount),
              }
            : undefined
        }
        onSubmit={handleCardSubmit}
        onDelete={() => {
          setCardSheetOpen(false);
          setDeleteDialogOpen(true);
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir cartão"
        description="Tem certeza que deseja excluir este cartão?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        confirming={deletingCard}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
