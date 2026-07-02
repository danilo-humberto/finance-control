import { isAxiosError } from 'axios';
import { ArrowLeft, CircleHelp, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { PaymentMethodCard } from '@/components/transactions/PaymentMethodCard';
import { PurchaseDetailsCard } from '@/components/transactions/PurchaseDetailsCard';
import { PurchaseInfoCard } from '@/components/transactions/PurchaseInfoCard';
import { PurchaseNoteCard } from '@/components/transactions/PurchaseNoteCard';
import { PurchaseSummaryCard } from '@/components/transactions/PurchaseSummaryCard';
import { TransactionFormSkeleton } from '@/components/transactions/TransactionFormSkeleton';
import { Button } from '@/components/ui/Button';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import {
  createTransaction,
  updateTransaction,
} from '@/services/transactionsService';
import { type CreateTransactionPayload } from '@/types/transaction';
import { isIsoDate } from '@/utils/transactionForm';

const noteMaxLength = 200;

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

export function NewTransactionPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const {
    amount,
    amountValue,
    cardOptions,
    categoryOptions,
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
    selectedInvoiceId,
    setDescription,
    setInstallmentCount,
    setNote,
    setPurchaseDate,
    setSelectedCardId,
    setSelectedCategoryId,
    setSelectedInvoiceId,
    summaryInstallments,
    transactionError,
  } = useTransactionForm({
    transactionId,
    getErrorMessage: getApiErrorMessage,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
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
    return <TransactionFormSkeleton />;
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
