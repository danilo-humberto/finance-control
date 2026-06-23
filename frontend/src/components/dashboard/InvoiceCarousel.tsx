import { CurrentInvoiceCard } from '@/components/dashboard/CurrentInvoiceCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

import { type MockCurrentInvoice } from '@/mocks/financeMocks';

type InvoiceCarouselProps = {
  invoices: MockCurrentInvoice[];
};

export function InvoiceCarousel({ invoices }: InvoiceCarouselProps) {
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

      {invoices.length > 0 ? (
        <>
          <div
            ref={carouselRef}
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          title="Nenhum cartao cadastrado"
          description="Cadastre um cartao para acompanhar sua fatura atual."
          action={<Button disabled>Adicionar cartao</Button>}
        />
      )}
    </section>
  );
}
