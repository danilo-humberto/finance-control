import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFormSkeleton } from '@/components/transactions/TransactionFormSkeleton';
import { Button } from '@/components/ui/Button';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { queryKeys } from '@/lib/queryKeys';
import {
  createTransaction,
  updateTransaction,
} from '@/services/transactionsService';
import { type CreateTransactionPayload } from '@/types/transaction';
import { buildTransactionPayload } from '@/utils/transactionPayload';

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
  const queryClient = useQueryClient();
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      setIsSubmitting(true);
      if (isEditMode && transactionId) {
        await updateTransaction(transactionId, payload);
      } else {
        await createTransaction(payload);
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creditCards.all,
      });
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
      purchaseDate={purchaseDate}
      selectedCardId={selectedCardId}
      selectedCategoryId={selectedCategoryId}
      selectedInvoiceId={selectedInvoiceId}
      submitError={submitError}
      summaryInstallments={summaryInstallments}
      onAmountChange={handleAmountChange}
      onBack={handleBack}
      onCardChange={setSelectedCardId}
      onCategoryChange={setSelectedCategoryId}
      onDescriptionChange={setDescription}
      onInstallmentCountChange={setInstallmentCount}
      onInvoiceChange={setSelectedInvoiceId}
      onNoteChange={setNote}
      onPaymentModeChange={handlePaymentModeChange}
      onPurchaseDateChange={setPurchaseDate}
      onSubmit={handleSubmit}
    />
  );
}
