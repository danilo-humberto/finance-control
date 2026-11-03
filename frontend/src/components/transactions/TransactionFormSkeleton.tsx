import { type ReactNode } from 'react';

import { type TransactionFormPresentation } from '@/components/transactions/TransactionForm';

type TransactionFormSkeletonProps = {
  presentation?: TransactionFormPresentation;
};

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-app-elevated ${className}`}
    />
  );
}

export function TransactionFormSkeleton({
  presentation = 'page',
}: TransactionFormSkeletonProps) {
  const infoSection = (
    <SkeletonSection titleWidth="w-40">
      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        <div className="space-y-4 p-2.5">
          <SkeletonInputRow />
          <SkeletonInputRow />
        </div>
        <div className="border-t border-app-border p-2.5">
          <SkeletonBlock className="mb-2 h-2.5 w-24" />
          <SkeletonControl />
        </div>
      </div>
    </SkeletonSection>
  );

  const detailsSection = (
    <SkeletonSection titleWidth="w-20">
      <div className="space-y-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
        <SkeletonSelectRow />
        <SkeletonSelectRow />
        <SkeletonSelectRow />
      </div>
    </SkeletonSection>
  );

  const paymentSection = (
    <SkeletonSection titleWidth="w-24">
      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        <div className="grid grid-cols-3 gap-1 p-1.5">
          <SkeletonBlock className="h-9 rounded-xl" />
          <SkeletonBlock className="h-9 rounded-xl" />
          <SkeletonBlock className="h-9 rounded-xl" />
        </div>
        <div className="flex items-center justify-between gap-2.5 border-t border-app-border p-2.5">
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-2.5 w-28" />
            <SkeletonBlock className="h-3 w-36 max-w-full" />
          </div>
          <SkeletonBlock className="h-9 w-[7rem] rounded-xl" />
        </div>
      </div>
    </SkeletonSection>
  );

  const noteSection = (
    <div className="rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
      <SkeletonBlock className="mb-2 h-2.5 w-32" />
      <SkeletonBlock className="h-16 w-full rounded-xl" />
    </div>
  );

  const summarySection = (
    <div className="flex items-center gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
      <SkeletonBlock className="h-10 w-10" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <div className="shrink-0 space-y-2">
        <SkeletonBlock className="ml-auto h-2.5 w-16" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  );

  if (presentation === 'dialog') {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        aria-busy="true"
        aria-label="Carregando movimentacao"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5">
              {infoSection}
              {detailsSection}
            </div>
            <div className="space-y-5">
              {paymentSection}
              {noteSection}
              {summarySection}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-app-border bg-app-surface/95 px-6 py-4">
          <SkeletonBlock className="h-11 w-24 rounded-xl" />
          <SkeletonBlock className="h-11 w-40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-md space-y-4"
      aria-busy="true"
      aria-label="Carregando movimentacao"
    >
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />
        <div className="min-w-0 space-y-2">
          <SkeletonBlock className="mx-auto h-5 w-36" />
          <SkeletonBlock className="mx-auto h-3 w-48 max-w-full" />
        </div>
        <SkeletonBlock className="h-10 w-10" />
      </header>

      {infoSection}
      {detailsSection}
      {paymentSection}
      {noteSection}
      {summarySection}

      <SkeletonBlock className="h-11 w-full rounded-xl" />
    </div>
  );
}

function SkeletonSection({
  children,
  titleWidth,
}: {
  children: ReactNode;
  titleWidth: string;
}) {
  return (
    <section className="space-y-2">
      <SkeletonBlock className={`h-4 ${titleWidth}`} />
      {children}
    </section>
  );
}

function SkeletonInputRow() {
  return (
    <div className="space-y-1.5">
      <SkeletonBlock className="h-2.5 w-20" />
      <SkeletonControl />
    </div>
  );
}

function SkeletonSelectRow() {
  return (
    <div className="space-y-1.5">
      <SkeletonBlock className="h-2.5 w-20" />
      <SkeletonControl />
    </div>
  );
}

function SkeletonControl() {
  return <SkeletonBlock className="h-10 w-full rounded-xl" />;
}
