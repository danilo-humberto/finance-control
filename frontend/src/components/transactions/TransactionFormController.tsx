import { isAxiosError } from 'axios';
import { useEffect, useState, type FormEvent } from 'react';

import { AuthMessage } from '@/components/auth/AuthMessage';
import {
  TransactionForm,
  type TransactionFormPresentation,
} from '@/components/transactions/TransactionForm';
import { TransactionFormSkeleton } from '@/components/transactions/TransactionFormSkeleton';
import { Button } from '@/components/ui/Button';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '@/hooks/useTransactionsQuery';
import { type CreateTransactionPayload } from '@/types/transaction';
import { buildTransactionPayload } from '@/utils/transactionPayload';

type TransactionFormControllerProps = {
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmittingChange?: (submitting: boolean) => void;
  onSuccess: () => void;
  presentation?: TransactionFormPresentation;
  transactionId?: string;
};

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
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

export function TransactionFormController({
  onCancel,
  onDirtyChange,
  onSubmittingChange,
  onSuccess,
  presentation = 'page',
  transactionId,
}: TransactionFormControllerProps) {
  const createTransactionMutation = useCreateTransactionMutation();
  const updateTransactionMutation = useUpdateTransactionMutation();
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
  const isSubmitting =
    createTransactionMutation.isPending || updateTransactionMutation.isPending;

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  function markDirty() {
    onDirtyChange?.(true);
  }

  function handleDescriptionChange(value: string) {
    markDirty();
    setDescription(value);
  }

  function handlePurchaseAmountChange(value: string) {
    markDirty();
    handleAmountChange(value);
  }

  function handlePurchaseDateChange(value: string) {
    markDirty();
    setPurchaseDate(value);
  }

  function handleCardChange(value: string) {
    markDirty();
    setSelectedCardId(value);
  }

  function handleCategoryChange(value: string) {
    markDirty();
    setSelectedCategoryId(value);
  }

  function handleInvoiceChange(value: string) {
    markDirty();
    setSelectedInvoiceId(value);
  }

  function handlePaymentModeSelect(value: typeof paymentMode) {
    markDirty();
    handlePaymentModeChange(value);
  }

  function handleInstallmentCountChange(value: number) {
    markDirty();
    setInstallmentCount(value);
  }

  function handleNoteChange(value: string) {
    markDirty();
    setNote(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    let payload: CreateTransactionPayload;

    try {
      payload = buildTransactionPayload({
        amountValue,
        description,
        invoiceOptions,
        isEditMode,
        note,
        purchaseDate,
        selectedCardId,
        selectedCategoryId,
        selectedInvoiceId,
        summaryInstallments,
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
      return;
    }

    try {
      if (isEditMode && transactionId) {
        await updateTransactionMutation.mutateAsync({
          id: transactionId,
          payload,
        });
      } else {
        await createTransactionMutation.mutateAsync(payload);
      }

      onDirtyChange?.(false);
      onSuccess();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  if (isEditMode && loadingTransaction) {
    return <TransactionFormSkeleton />;
  }

  if (isEditMode && transactionError) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <AuthMessage tone="error">{transactionError}</AuthMessage>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <TransactionForm
      amount={amount}
      amountValue={amountValue}
      cardOptions={cardOptions}
      categoryOptions={categoryOptions}
      description={description}
      errorCards={errorCards}
      errorCategories={errorCategories}
      installmentCount={installmentCount}
      invoiceOptions={invoiceOptions}
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      loadingCards={loadingCards}
      loadingCategories={loadingCategories}
      note={note}
      paymentMode={paymentMode}
      presentation={presentation}
      purchaseDate={purchaseDate}
      selectedCardId={selectedCardId}
      selectedCategoryId={selectedCategoryId}
      selectedInvoiceId={selectedInvoiceId}
      submitError={submitError}
      summaryInstallments={summaryInstallments}
      onAmountChange={handlePurchaseAmountChange}
      onBack={onCancel}
      onCardChange={handleCardChange}
      onCategoryChange={handleCategoryChange}
      onDescriptionChange={handleDescriptionChange}
      onInstallmentCountChange={handleInstallmentCountChange}
      onInvoiceChange={handleInvoiceChange}
      onNoteChange={handleNoteChange}
      onPaymentModeChange={handlePaymentModeSelect}
      onPurchaseDateChange={handlePurchaseDateChange}
      onSubmit={handleSubmit}
    />
  );
}
