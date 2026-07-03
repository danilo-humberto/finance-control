import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCreditCard,
  deleteCreditCard,
  getCreditCards,
  updateCreditCard,
} from '@/services/creditCardsService';
import { getInvoice } from '@/services/invoicesService';
import {
  type CreateCreditCardPayload,
  type CreditCard,
  type UpdateCreditCardPayload,
} from '@/types/credit-card';
import { queryKeys } from '@/lib/queryKeys';
import { getCurrentInvoiceMonthYear } from '@/utils/invoiceCycle';

const creditCardsStaleTime = 5 * 60 * 1000;

export type CreditCardWithUsage = CreditCard & {
  currentInvoiceTotal: number;
  usedLimit: number;
};

export function useCreditCardsQuery() {
  return useQuery({
    queryKey: queryKeys.creditCards.list(),
    queryFn: getCreditCards,
    staleTime: creditCardsStaleTime,
  });
}

export function useCreditCardsWithUsageQuery() {
  return useQuery({
    queryKey: queryKeys.creditCards.withUsage(),
    queryFn: getCreditCardsWithUsage,
    staleTime: creditCardsStaleTime,
  });
}

export function useCreateCreditCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCreditCard,
    onSuccess: (createdCard) => {
      queryClient.setQueryData<CreditCard[]>(
        queryKeys.creditCards.list(),
        (currentCards = []) => [...currentCards, createdCard],
      );
      queryClient.setQueryData<CreditCardWithUsage[]>(
        queryKeys.creditCards.withUsage(),
        (currentCards = []) => [...currentCards, withEmptyUsage(createdCard)],
      );
    },
  });
}

export function useUpdateCreditCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCreditCardPayload;
    }) => updateCreditCard(id, payload),
    onSuccess: (updatedCard) => {
      queryClient.setQueryData<CreditCard[]>(
        queryKeys.creditCards.list(),
        (currentCards = []) =>
          currentCards.map((card) =>
            card.id === updatedCard.id ? updatedCard : card,
          ),
      );
      queryClient.setQueryData<CreditCardWithUsage[]>(
        queryKeys.creditCards.withUsage(),
        (currentCards = []) =>
          currentCards.map((card) =>
            card.id === updatedCard.id
              ? {
                  ...updatedCard,
                  currentInvoiceTotal: card.currentInvoiceTotal,
                  usedLimit: card.usedLimit,
                }
              : card,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.creditCards.withUsage(),
      });
    },
  });
}

export function useDeleteCreditCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: (_, deletedCardId) => {
      queryClient.setQueryData<CreditCard[]>(
        queryKeys.creditCards.list(),
        (currentCards = []) =>
          currentCards.filter((card) => card.id !== deletedCardId),
      );
      queryClient.setQueryData<CreditCardWithUsage[]>(
        queryKeys.creditCards.withUsage(),
        (currentCards = []) =>
          currentCards.filter((card) => card.id !== deletedCardId),
      );
    },
  });
}

async function getCreditCardsWithUsage(): Promise<CreditCardWithUsage[]> {
  const creditCards = await getCreditCards();

  return Promise.all(creditCards.map((card) => withCurrentUsage(card)));
}

async function getCreditCardUsage(card: CreditCard) {
  const { month, year } = getCurrentInvoiceMonthYear(
    card.closingDay,
    card.dueDay,
  );
  const invoice = await getInvoice({
    month,
    year,
    creditCardId: card.id,
  });
  const currentInvoiceTotal =
    invoice.total || invoice.items.reduce((sum, item) => sum + item.amount, 0);

  return {
    currentInvoiceTotal,
    usedLimit: currentInvoiceTotal,
  };
}

async function withCurrentUsage(card: CreditCard): Promise<CreditCardWithUsage> {
  const usage = await getCreditCardUsage(card);

  return {
    ...card,
    ...usage,
  };
}

function withEmptyUsage(card: CreditCard): CreditCardWithUsage {
  return {
    ...card,
    currentInvoiceTotal: 0,
    usedLimit: 0,
  };
}

export type CreditCardMutationPayload = CreateCreditCardPayload;
