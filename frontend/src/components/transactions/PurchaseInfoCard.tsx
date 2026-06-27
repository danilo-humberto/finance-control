import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Diamond,
} from "lucide-react";
import { type InputHTMLAttributes, type ReactNode } from "react";

type PurchaseInfoCardProps = {
  description: string;
  amount: string;
  purchaseDate: string;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
};

export function PurchaseInfoCard({
  description,
  amount,
  purchaseDate,
  onDescriptionChange,
  onAmountChange,
}: PurchaseInfoCardProps) {
  return (
    <section className="space-y-2" aria-labelledby="purchase-info-title">
      <h2
        id="purchase-info-title"
        className="text-[0.94rem] font-semibold leading-tight"
      >
        Informações da compra
      </h2>

      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        <div className="space-y-4 p-2.5">
          <PurchaseTextField
            id="purchase-description"
            label="Descrição"
            value={description}
            placeholder="Ex.: Mercado Extra"
            icon={<Diamond aria-hidden="true" className="h-4 w-4" />}
            onChange={onDescriptionChange}
          />

          <PurchaseTextField
            id="purchase-amount"
            label="Valor (R$)"
            value={amount}
            placeholder="R$ 0,00"
            inputMode="numeric"
            icon={<CircleDollarSign aria-hidden="true" className="h-4 w-4" />}
            onChange={onAmountChange}
          />
        </div>

        <div className="border-t border-app-border p-2.5">
          <p className="mb-1.5 text-[0.72rem] font-medium leading-none text-app-muted">
            Data da compra
          </p>
          <button
            type="button"
            className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-app-border bg-app-bg/35 px-3 text-left text-[0.8rem] font-semibold text-app-text transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <CalendarDays
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-brand-400"
            />
            <span className="min-w-0 flex-1 truncate">{purchaseDate}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-app-muted"
            />
          </button>
        </div>
      </div>
    </section>
  );
}

type PurchaseTextFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  icon: ReactNode;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (value: string) => void;
};

function PurchaseTextField({
  id,
  label,
  value,
  placeholder,
  icon,
  inputMode,
  onChange,
}: PurchaseTextFieldProps) {
  return (
    <label htmlFor={id} className="block min-w-0 space-y-1.5">
      <span className="block text-[0.72rem] font-medium leading-none text-app-muted">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-400">
          {icon}
        </span>
        <input
          id={id}
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 w-full rounded-xl border border-app-border bg-app-bg/35 pl-9 pr-3 text-[0.8rem] text-app-text outline-none transition-colors",
            "placeholder:text-app-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
          )}
        />
      </span>
    </label>
  );
}
