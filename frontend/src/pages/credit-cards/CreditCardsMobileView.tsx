import {
  CardsSummary,
} from '@/components/credit-cards/CardsSummary';
import { CreditCardListItem } from '@/components/credit-cards/CreditCardListItem';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CreditCard as CreditCardIcon,
  LoaderCircle,
  Plus,
} from 'lucide-react';

import { type CreditCardsPageData } from './useCreditCardsPageData';

type CreditCardsMobileViewProps = CreditCardsPageData;

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

export function CreditCardsMobileView({
  cardItems,
  feedbackMessage,
  loadError,
  loading,
  onCardMenuClick,
  onCreateClick,
  onRetryLoad,
  summary,
}: CreditCardsMobileViewProps) {
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
          onClick={onCreateClick}
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
              <Button type="button" onClick={onRetryLoad}>
                Tentar novamente
              </Button>
            }
          />
        ) : cardItems.length === 0 ? (
          <EmptyState
            icon={<CreditCardIcon aria-hidden="true" className="h-5 w-5" />}
            title="Nenhum cartão cadastrado"
            description="Cadastre seu primeiro cartão para acompanhar suas faturas."
            action={
              <Button
                type="button"
                leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
                onClick={onCreateClick}
              >
                Adicionar cartão
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {cardItems.map((cardItem) => (
              <CreditCardListItem
                key={cardItem.id}
                card={cardItem}
                onMenuClick={() => onCardMenuClick(cardItem.source)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
