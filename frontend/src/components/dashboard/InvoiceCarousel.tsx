import { CurrentInvoiceCard } from '@/components/dashboard/CurrentInvoiceCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { type DashboardCurrentInvoice } from '@/types/dashboard';
import { CreditCard, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type InvoiceCarouselProps = {
  invoices: DashboardCurrentInvoice[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddCard: () => void;
};

export function InvoiceCarousel({
  invoices,
  loading,
  error,
  onRetry,
  onAddCard,
}: InvoiceCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(invoices.length - 1, 0)),
    );
  }, [invoices.length]);

  function getClosestInvoiceIndex() {
    const carousel = carouselRef.current;

    if (!carousel) {
      return 0;
    }

    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const items = Array.from(carousel.children) as HTMLElement[];

    return items.reduce(
      (closestIndex, item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(carouselCenter - itemCenter);

        if (distance < closestIndex.distance) {
          return { index, distance };
        }

        return closestIndex;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    ).index;
  }

  function handleCarouselScroll() {
    setActiveIndex(getClosestInvoiceIndex());
  }

  function handleDotClick(index: number) {
    const carousel = carouselRef.current;
    const target = carousel?.children[index] as HTMLElement | undefined;

    if (!carousel || !target) {
      return;
    }

    const carouselRect = carousel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const paddingLeft = Number.parseFloat(getComputedStyle(carousel).paddingLeft);
    const left = targetRect.left - carouselRect.left + carousel.scrollLeft - paddingLeft;

    carousel.scrollTo({ left, behavior: 'smooth' });
    setActiveIndex(index);
  }

  return (
    <section className="space-y-2.5" aria-labelledby="current-invoice-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="current-invoice-title" className="text-base font-semibold">
          Fatura atual
        </h2>

        <Link
          to="/invoices"
          className="text-[0.82rem] font-semibold text-brand-400 transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Ver todas
        </Link>
      </div>

      {loading ? (
        <InvoiceCarouselLoadingState />
      ) : error ? (
        <EmptyState
          icon={<LoaderCircle aria-hidden="true" className="h-5 w-5" />}
          title="Não foi possível carregar as faturas"
          description={error}
          action={
            <Button type="button" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          }
        />
      ) : invoices.length > 0 ? (
        <>
          <div
            ref={carouselRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Carrossel de faturas atuais"
            onScroll={handleCarouselScroll}
          >
            {invoices.map((invoice) => (
              <CurrentInvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-0.5">
            {invoices.map((invoice, index) => (
              <button
                type="button"
                key={invoice.id}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg',
                  index === activeIndex ? 'bg-brand-500' : 'bg-app-elevated',
                )}
                aria-label={`Ir para fatura ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
          title="Nenhum cartão cadastrado"
          description="Cadastre um cartão para acompanhar suas faturas."
          action={
            <Button type="button" size="sm" onClick={onAddCard}>
              Adicionar cartão
            </Button>
          }
        />
      )}
    </section>
  );
}

function InvoiceCarouselLoadingState() {
  return (
    <div
      className="flex snap-x snap-mandatory gap-3 overflow-hidden pb-0.5"
      aria-label="Carregando faturas atuais"
    >
      {[0, 1].map((item) => (
        <article
          key={item}
          className="w-[min(19rem,calc(100vw-5.5rem))] shrink-0 rounded-2xl border border-brand-800/65 bg-app-surface p-3.5 shadow-lg shadow-black/20"
        >
          <div className="flex items-start gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-app-elevated" />
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-app-elevated" />
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-app-elevated" />
            </div>
          </div>
          <div className="mt-4 h-3 w-32 animate-pulse rounded-full bg-app-elevated" />
          <div className="mt-4 h-7 w-44 animate-pulse rounded-full bg-app-elevated" />
          <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-app-elevated" />
          <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-app-elevated" />
        </article>
      ))}
    </div>
  );
}
