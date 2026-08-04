import { ArrowLeft, CircleHelp, Save } from 'lucide-react';
import { type FormEvent } from 'react';

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

const noteMaxLength = 200;

export type TransactionFormPresentation = 'page' | 'dialog';

type TransactionFormProps = {
  amount: string;
  amountValue: number;
  cardOptions: PurchaseCardOption[];
  categoryOptions: PurchaseCategoryOption[];
  description: string;
  errorCards: string | null;
  errorCategories: string | null;
  installmentCount: number;
  invoiceOptions: PurchaseInvoiceOption[];
  isEditMode: boolean;
  isSubmitting: boolean;
  loadingCards: boolean;
  loadingCategories: boolean;
  note: string;
  paymentMode: PaymentMode;
  purchaseDate: string;
  presentation?: TransactionFormPresentation;
  selectedCardId: string;
  selectedCategoryId: string;
  selectedInvoiceId: string;
  submitError: string | null;
  summaryInstallments: number;
  onAmountChange: (value: string) => void;
  onBack: () => void;
  onCardChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onInstallmentCountChange: (value: number) => void;
  onInvoiceChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onPurchaseDateChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TransactionForm({
  amount,
  amountValue,
  cardOptions,
  categoryOptions,
  description,
  errorCards,
  errorCategories,
  installmentCount,
  invoiceOptions,
  isEditMode,
  isSubmitting,
  loadingCards,
  loadingCategories,
  note,
  paymentMode,
  purchaseDate,
  presentation = 'page',
  selectedCardId,
  selectedCategoryId,
  selectedInvoiceId,
  submitError,
  summaryInstallments,
  onAmountChange,
  onBack,
  onCardChange,
  onCategoryChange,
  onDescriptionChange,
  onInstallmentCountChange,
  onInvoiceChange,
  onNoteChange,
  onPaymentModeChange,
  onPurchaseDateChange,
  onSubmit,
}: TransactionFormProps) {
  const submitButton = (
    <Button
      type="submit"
      size="lg"
      loading={isSubmitting}
      disabled={loadingCards || loadingCategories}
      leftIcon={<Save aria-hidden="true" className="h-4 w-4" />}
      className={
        presentation === 'dialog'
          ? 'h-11 min-w-40 rounded-xl px-5 text-[0.86rem]'
          : 'h-11 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.86rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400'
      }
    >
      {isSubmitting
        ? 'Salvando...'
        : isEditMode
          ? 'Salvar alterações'
          : 'Salvar compra'}
    </Button>
  );

  const purchaseInfo = (
    <PurchaseInfoCard
      description={description}
      amount={amount}
      purchaseDate={purchaseDate}
      onDescriptionChange={onDescriptionChange}
      onAmountChange={onAmountChange}
      onPurchaseDateChange={onPurchaseDateChange}
    />
  );

  const purchaseDetails = (
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
      onCardChange={onCardChange}
      onCategoryChange={onCategoryChange}
      onInvoiceChange={onInvoiceChange}
    />
  );

  const paymentMethod = (
    <PaymentMethodCard
      paymentMode={paymentMode}
      installmentCount={installmentCount}
      onPaymentModeChange={onPaymentModeChange}
      onInstallmentCountChange={onInstallmentCountChange}
    />
  );

  const purchaseNote = (
    <PurchaseNoteCard
      note={note}
      maxLength={noteMaxLength}
      onNoteChange={onNoteChange}
    />
  );

  const purchaseSummary = (
    <PurchaseSummaryCard
      amount={amountValue}
      installmentCount={summaryInstallments}
    />
  );

  if (presentation === 'dialog') {
    return (
      <form
        onSubmit={onSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {submitError ? (
            <div className="mb-5">
              <AuthMessage tone="error">{submitError}</AuthMessage>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5">
              {purchaseInfo}
              {purchaseDetails}
            </div>
            <div className="space-y-5">
              {paymentMethod}
              {purchaseNote}
              {purchaseSummary}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-app-border bg-app-surface/95 px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onBack}
            className="h-11 min-w-28 rounded-xl"
          >
            Cancelar
          </Button>
          {submitButton}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3">
        <button
          type="button"
          aria-label="Voltar"
          onClick={onBack}
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

      {purchaseInfo}
      {purchaseDetails}
      {paymentMethod}
      {purchaseNote}
      {purchaseSummary}
      {submitButton}
    </form>
  );
}
