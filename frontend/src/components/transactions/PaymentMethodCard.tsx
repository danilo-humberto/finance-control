import { cn } from '@/lib/utils';
import { CreditCard, Layers3, Minus, Plus } from 'lucide-react';
import { type ReactNode } from 'react';

export type PaymentMode = 'cash' | 'installments';

type PaymentMethodCardProps = {
  paymentMode: PaymentMode;
  installmentCount: number;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onInstallmentCountChange: (count: number) => void;
};

export function PaymentMethodCard({
  paymentMode,
  installmentCount,
  onPaymentModeChange,
  onInstallmentCountChange,
}: PaymentMethodCardProps) {
  const isCash = paymentMode === 'cash';
  const visibleInstallments = isCash ? 1 : installmentCount;

  function updateInstallments(nextCount: number) {
    onInstallmentCountChange(Math.min(Math.max(nextCount, 1), 12));
  }

  return (
    <section className="space-y-2.5" aria-labelledby="payment-title">
      <h2 id="payment-title" className="text-base font-semibold leading-tight">
        Pagamento
      </h2>

      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        <div className="grid grid-cols-2 gap-1 p-2">
          <PaymentModeButton
            active={isCash}
            icon={<CreditCard aria-hidden="true" className="h-4 w-4" />}
            label="À vista"
            onClick={() => onPaymentModeChange('cash')}
          />
          <PaymentModeButton
            active={!isCash}
            icon={<Layers3 aria-hidden="true" className="h-4 w-4" />}
            label="Parcelado"
            onClick={() => onPaymentModeChange('installments')}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-app-border p-3">
          <div className="min-w-0">
            <p className="text-[0.78rem] font-medium leading-none text-app-muted">
              Número de parcelas
            </p>
            <div className="mt-2 flex min-w-0 items-center gap-2.5">
              <Layers3 aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-400" />
              <p className="truncate text-[0.86rem] font-semibold text-app-text">
                {visibleInstallments}{' '}
                {visibleInstallments === 1 ? 'parcela' : 'parcelas'}
                {isCash ? ' (à vista)' : null}
              </p>
            </div>
          </div>

          <div className="grid h-10 w-[7.9rem] shrink-0 grid-cols-3 overflow-hidden rounded-xl bg-app-elevated/65">
            <StepperButton
              label="Diminuir parcelas"
              disabled={isCash || visibleInstallments <= 1}
              onClick={() => updateInstallments(visibleInstallments - 1)}
            >
              <Minus aria-hidden="true" className="h-4 w-4" />
            </StepperButton>
            <span className="flex items-center justify-center text-sm font-semibold text-app-text">
              {visibleInstallments}
            </span>
            <StepperButton
              label="Aumentar parcelas"
              disabled={isCash || visibleInstallments >= 12}
              onClick={() => updateInstallments(visibleInstallments + 1)}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
            </StepperButton>
          </div>
        </div>
      </div>
    </section>
  );
}

type PaymentModeButtonProps = {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function PaymentModeButton({ active, icon, label, onClick }: PaymentModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center gap-2 rounded-xl text-[0.82rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        active
          ? 'bg-brand-950/85 text-app-text'
          : 'bg-app-bg/25 text-app-muted hover:bg-app-elevated hover:text-app-text',
      )}
    >
      <span className={active ? 'text-brand-400' : 'text-app-muted'}>{icon}</span>
      {label}
    </button>
  );
}

type StepperButtonProps = {
  label: string;
  disabled: boolean;
  children: ReactNode;
  onClick: () => void;
};

function StepperButton({ label, disabled, children, onClick }: StepperButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center text-app-muted transition-colors hover:bg-app-icon hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
