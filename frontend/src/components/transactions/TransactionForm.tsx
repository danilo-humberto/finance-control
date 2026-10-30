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
  subcategoryOptions?: PurchaseCategoryOption[];
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
  selectedSubcategoryId?: string;
  selectedInvoiceId: string;
  submitError: string | null;
  summaryInstallments: number;
  onAmountChange: (value: string) => void;
  onBack: () => void;
  onCardChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange?: (value: string) => void;
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
  subcategoryOptions,
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
  selectedSubcategoryId,
  selectedInvoiceId,
  submitError,
  summaryInstallments,
  onAmountChange,
  onBack,
  onCardChange,
  onCategoryChange,
  onSubcategoryChange,
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
      useDesktopControls={presentation === 'dialog'}
      onDescriptionChange={onDescriptionChange}
      onAmountChange={onAmountChange}
      onPurchaseDateChange={onPurchaseDateChange}
    />
  );

  const purchaseDetails = (
    <PurchaseDetailsCard
      cards={cardOptions}
      categories={categoryOptions}
      subcategories={subcategoryOptions}
      invoices={invoiceOptions}
      selectedCardId={selectedCardId}
      selectedCategoryId={selectedCategoryId}
      selectedSubcategoryId={selectedSubcategoryId}
      selectedInvoiceId={selectedInvoiceId}
      loadingCards={loadingCards}
      loadingCategories={loadingCategories}
      errorCards={errorCards}
      errorCategories={errorCategories}
      isRecurring={paymentMode === 'recurring'}
      useDesktopControls={presentation === 'dialog'}
      onCardChange={onCardChange}
      onCategoryChange={onCategoryChange}
      onSubcategoryChange={onSubcategoryChange}
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
      isRecurring={paymentMode === 'recurring'}
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
            onClick={onBack}
            className="h-11 rounded-xl px-5 text-[0.86rem]"
          >
            Cancelar
          </Button>
          {submitButton}
        </div>
      </form>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-app-bg text-app-text">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-app-border bg-app-surface/95 px-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para a lista de movimentações"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>

        <h1 className="text-base font-semibold leading-tight">
          {isEditMode ? 'Editar compra' : 'Nova compra'}
        </h1>

        <button
          type="button"
          aria-label="Ajuda sobre o cadastro de compras"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <CircleHelp aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 px-3 py-4">
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
          {submitError ? (
            <AuthMessage tone="error">{submitError}</AuthMessage>
          ) : null}

          {purchaseInfo}
          {purchaseDetails}
          {paymentMethod}
          {purchaseNote}
          {purchaseSummary}

          <div className="pt-2">{submitButton}</div>
        </form>
      </main>
    </div>
  );
}
