import { ReceiptText } from 'lucide-react';

type PurchaseSummaryCardProps = {
  amount: number;
  installmentCount: number;
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function PurchaseSummaryCard({
  amount,
  installmentCount,
}: PurchaseSummaryCardProps) {
  const safeInstallments = Math.max(installmentCount, 1);
  const installmentValue = amount / safeInstallments;

  return (
    <section
      className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface/75 p-3 shadow-lg shadow-black/15"
      aria-label="Resumo da compra"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
        <ReceiptText aria-hidden="true" className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[0.92rem] font-semibold leading-5 text-app-text">
          Resumo da compra
        </h2>
        <p className="mt-1 text-[0.74rem] leading-4 text-app-muted">Valor</p>
        <p className="text-[0.9rem] font-semibold leading-5 text-brand-400">
          {moneyFormatter.format(amount)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[0.74rem] leading-4 text-app-muted">Parcelas</p>
        <p className="mt-1 text-[0.86rem] font-semibold leading-5 text-app-text">
          {safeInstallments}x de {moneyFormatter.format(installmentValue)}
        </p>
      </div>
    </section>
  );
}
