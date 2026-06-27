import {
  PaymentMethodCard,
  type PaymentMode,
} from '@/components/transactions/PaymentMethodCard';
import { PurchaseDetailsCard } from '@/components/transactions/PurchaseDetailsCard';
import { PurchaseInfoCard } from '@/components/transactions/PurchaseInfoCard';
import { PurchaseNoteCard } from '@/components/transactions/PurchaseNoteCard';
import { PurchaseSummaryCard } from '@/components/transactions/PurchaseSummaryCard';
import { Button } from '@/components/ui/Button';
import { mockPurchaseFormDefaults } from '@/mocks/financeMocks';
import { ArrowLeft, CircleHelp, Save } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const noteMaxLength = 200;
const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  const parsedValue = Number.parseInt(digits, 10);

  return Number.isFinite(parsedValue) ? parsedValue / 100 : 0;
}

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits || /^0+$/.test(digits)) {
    return '';
  }

  return brlFormatter.format(Number.parseInt(digits, 10) / 100);
}

export function NewTransactionPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [note, setNote] = useState('');

  const amountValue = useMemo(() => parseCurrencyInput(amount), [amount]);
  const summaryInstallments = paymentMode === 'cash' ? 1 : installmentCount;

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  function handleAmountChange(value: string) {
    setAmount(formatCurrencyInput(value));
  }

  function handlePaymentModeChange(mode: PaymentMode) {
    setPaymentMode(mode);

    if (mode === 'cash') {
      setInstallmentCount(1);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log('Purchase form submit', {
      description,
      amount: amountValue,
      purchaseDate: mockPurchaseFormDefaults.purchaseDate,
      card: mockPurchaseFormDefaults.card.name,
      category: mockPurchaseFormDefaults.category.name,
      invoice: mockPurchaseFormDefaults.invoice.label,
      paymentMode,
      installmentCount: summaryInstallments,
      note,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3">
        <button
          type="button"
          aria-label="Voltar"
          onClick={handleBack}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text shadow-lg shadow-black/15 transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="min-w-0 text-center">
          <h1 className="truncate text-[1.48rem] font-bold leading-tight text-app-text">
            Nova compra
          </h1>
          <p className="mt-1 truncate text-[0.86rem] leading-5 text-app-muted">
            Adicione uma nova compra ao seu cartão
          </p>
        </div>

        <button
          type="button"
          aria-label="Ajuda sobre nova compra"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-800/60 bg-app-icon text-brand-400 shadow-lg shadow-brand-950/25 transition-colors hover:bg-brand-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <CircleHelp aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <PurchaseInfoCard
        description={description}
        amount={amount}
        purchaseDate={mockPurchaseFormDefaults.purchaseDate}
        onDescriptionChange={setDescription}
        onAmountChange={handleAmountChange}
      />

      <PurchaseDetailsCard defaults={mockPurchaseFormDefaults} />

      <PaymentMethodCard
        paymentMode={paymentMode}
        installmentCount={installmentCount}
        onPaymentModeChange={handlePaymentModeChange}
        onInstallmentCountChange={setInstallmentCount}
      />

      <PurchaseNoteCard
        note={note}
        maxLength={noteMaxLength}
        onNoteChange={setNote}
      />

      <PurchaseSummaryCard
        amount={amountValue}
        installmentCount={summaryInstallments}
      />

      <Button
        type="submit"
        size="lg"
        leftIcon={<Save aria-hidden="true" className="h-4 w-4" />}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-[0.92rem] text-white shadow-lg shadow-brand-950/30 hover:from-brand-500 hover:to-brand-400"
      >
        Salvar compra
      </Button>
    </form>
  );
}
