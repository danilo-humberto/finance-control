import { CardsSummary } from '@/components/credit-cards/CardsSummary';
import { CreditCardListItem } from '@/components/credit-cards/CreditCardListItem';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import {
  CardFormSheet,
  type CardFormValues,
} from '@/components/sheets/CardFormSheet';
import {
  mockCardsSummary,
  mockCreditCards,
  type MockCreditCard,
} from '@/mocks/financeMocks';
import {
  ChevronRight,
  Edit3,
  Info,
  PieChart,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';

function parseMoneyValue(value: string) {
  const normalizedValue = value
    .replace(/[^\d,.]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function createCardFromValues(values: CardFormValues): MockCreditCard {
  const name = values.name.trim() || 'Novo cartão';
  const dueDay = Number.parseInt(values.dueDay, 10) || 1;
  const closingDay = Number.parseInt(values.closingDay, 10) || 1;

  return {
    id: `card-${Date.now()}`,
    name,
    logo: name.slice(0, 2).toUpperCase(),
    brand: values.brand || 'Outra',
    type: values.type || 'Crédito',
    lastFourDigits: '0000',
    limit: parseMoneyValue(values.limit),
    used: 0,
    currentInvoiceTotal: 0,
    dueDateLabel: `${String(dueDay).padStart(2, '0')}/06`,
    closingDay,
    dueDay,
    color: '#22c55e',
  };
}

function updateCardFromValues(
  card: MockCreditCard,
  values: CardFormValues,
): MockCreditCard {
  const dueDay = Number.parseInt(values.dueDay, 10) || card.dueDay;
  const closingDay = Number.parseInt(values.closingDay, 10) || card.closingDay;
  const name = values.name.trim() || card.name;

  return {
    ...card,
    name,
    logo: name.slice(0, 2).toUpperCase() || card.logo,
    brand: values.brand || card.brand,
    type: values.type || card.type,
    limit: parseMoneyValue(values.limit) || card.limit,
    dueDateLabel: `${String(dueDay).padStart(2, '0')}/06`,
    closingDay,
    dueDay,
  };
}

export function CreditCardsPage() {
  const [cards, setCards] = useState<MockCreditCard[]>(mockCreditCards);
  const [selectedCard, setSelectedCard] = useState<MockCreditCard | null>(null);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showOrderHint, setShowOrderHint] = useState(true);

  function handleCreateClick() {
    setSelectedCard(null);
    setCardFormMode('create');
    setCardSheetOpen(true);
  }

  function handleMenuClick(card: MockCreditCard) {
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

  function handleCardSubmit(values: CardFormValues) {
    if (cardFormMode === 'create') {
      setCards((currentCards) => [...currentCards, createCardFromValues(values)]);
      return;
    }

    if (!selectedCard) {
      return;
    }

    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === selectedCard.id ? updateCardFromValues(card, values) : card,
      ),
    );
  }

  function handleConfirmDelete() {
    if (!selectedCard) {
      return;
    }

    setCards((currentCards) =>
      currentCards.filter((card) => card.id !== selectedCard.id),
    );
    setSelectedCard(null);
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

      <CardsSummary summary={mockCardsSummary} />

      <section className="space-y-2" aria-labelledby="credit-cards-title">
        <h2 id="credit-cards-title" className="text-[0.94rem] font-semibold leading-tight">
          Meus cartões
        </h2>

        <div className="space-y-2.5">
          {cards.map((card) => (
            <CreditCardListItem
              key={card.id}
              card={card}
              onMenuClick={handleMenuClick}
            />
          ))}
        </div>
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
        initialData={
          selectedCard && cardFormMode === 'edit'
            ? {
                name: selectedCard.name,
                type: selectedCard.type,
                brand: selectedCard.brand,
                closingDay: String(selectedCard.closingDay),
                dueDay: String(selectedCard.dueDay),
                limit: String(selectedCard.limit),
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
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
