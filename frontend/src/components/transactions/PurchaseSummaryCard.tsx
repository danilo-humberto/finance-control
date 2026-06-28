import { usePreferences } from '@/hooks/usePreferences';
import { ReceiptText } from 'lucide-react';

type PurchaseSummaryCardProps = {
  amount: number;
  installmentCount: number;
};

export function PurchaseSummaryCard({
  amount,
  installmentCount,
}: PurchaseSummaryCardProps) {
  const { formatCurrency } = usePreferences();
  const safeInstallments = Math.max(installmentCount, 1);
  const installmentValue = amount / safeInstallments;

  return (
    <section
      className="flex items-center gap-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15"
      aria-label="Resumo da compra"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
        <ReceiptText aria-hidden="true" className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[0.86rem] font-semibold leading-5 text-app-text">
          Resumo da compra
        </h2>
        <p className="mt-0.5 text-[0.68rem] leading-4 text-app-muted">Valor</p>
        <p className="text-[0.82rem] font-semibold leading-5 text-brand-400">
          {formatCurrency(amount)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[0.68rem] leading-4 text-app-muted">Parcelas</p>
        <p className="mt-0.5 text-[0.8rem] font-semibold leading-5 text-app-text">
          {safeInstallments}x de {formatCurrency(installmentValue)}
        </p>
      </div>
    </section>
  );
}
