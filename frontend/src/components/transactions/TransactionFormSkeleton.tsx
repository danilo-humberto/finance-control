import { type ReactNode } from 'react';

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-app-elevated ${className}`}
    />
  );
}

export function TransactionFormSkeleton() {
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

      <SkeletonSection titleWidth="w-20">
        <div className="space-y-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
          <SkeletonSelectRow />
          <SkeletonSelectRow />
          <SkeletonSelectRow />
        </div>
      </SkeletonSection>

      <SkeletonSection titleWidth="w-24">
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
          <div className="grid grid-cols-2 gap-1 p-1.5">
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

      <div className="rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
        <SkeletonBlock className="mb-2 h-2.5 w-32" />
        <SkeletonBlock className="h-16 w-full rounded-xl" />
      </div>

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
