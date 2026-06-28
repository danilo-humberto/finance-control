import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { BaseBottomSheet } from './BaseBottomSheet';

export type CardFormValues = {
  name: string;
  color: string;
  closingDay: string;
  dueDay: string;
  limit: string;
};

type CardFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CardFormValues>;
  onSubmit: (values: CardFormValues) => void | Promise<void>;
  onDelete?: () => void;
  closeOnSubmit?: boolean;
  submitting?: boolean;
};

const emptyValues: CardFormValues = {
  name: '',
  color: '#22c55e',
  closingDay: '',
  dueDay: '',
  limit: '',
};

const cardColorOptions = [
  { label: 'Verde', value: '#22c55e' },
  { label: 'Roxo', value: '#7c3aed' },
  { label: 'Vermelho', value: '#dc2626' },
  { label: 'Azul', value: '#2563eb' },
  { label: 'Preto', value: '#262626' },
  { label: 'Dourado', value: '#ca8a04' },
];

function parseCurrencyValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  if (/^\d+$/.test(trimmedValue)) {
    return Number.parseFloat(trimmedValue);
  }

  const digits = trimmedValue.replace(/\D/g, '');

  return digits ? Number.parseInt(digits, 10) / 100 : 0;
}

function formatCurrencyValue(
  value: string | undefined,
  formatCurrency: (value: number) => string,
) {
  if (!value) {
    return '';
  }

  const parsedValue = parseCurrencyValue(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? formatCurrency(parsedValue)
    : '';
}

function formatCurrencyInput(
  value: string,
  formatCurrency: (value: number) => string,
) {
  const digits = value.replace(/\D/g, '');

  if (!digits || /^0+$/.test(digits)) {
    return '';
  }

  return formatCurrency(Number.parseInt(digits, 10) / 100);
}

export function CardFormSheet({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  onDelete,
  closeOnSubmit = true,
  submitting = false,
}: CardFormSheetProps) {
  const { formatCurrency } = usePreferences();
  const [values, setValues] = useState<CardFormValues>(emptyValues);

  useEffect(() => {
    if (open) {
      const nextValues = { ...emptyValues, ...initialData };

      setValues({
        ...nextValues,
        limit: formatCurrencyValue(nextValues.limit, formatCurrency),
      });
    }
  }, [formatCurrency, initialData, open]);

  function updateValue(field: keyof CardFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function updateLimitValue(value: string) {
    updateValue('limit', formatCurrencyInput(value, formatCurrency));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);

    if (closeOnSubmit) {
      onOpenChange(false);
    }
  }

  const isEdit = mode === 'edit';

  return (
    <BaseBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar cartão' : 'Adicionar cartão'}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Nome do cartão"
          value={values.name}
          onChange={(event) => updateValue('name', event.target.value)}
          placeholder="Ex.: Nubank, Itaú, Santander..."
          required
        />

        <CardColorPicker
          value={values.color}
          onChange={(color) => updateValue('color', color)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data de fechamento"
            type="number"
            min={1}
            max={31}
            value={values.closingDay}
            onChange={(event) => updateValue('closingDay', event.target.value)}
            placeholder="05"
            helperText="Dia 1 a 31"
            required
          />
          <Input
            label="Data de vencimento"
            type="number"
            min={1}
            max={31}
            value={values.dueDay}
            onChange={(event) => updateValue('dueDay', event.target.value)}
            placeholder="15"
            helperText="Dia 1 a 31"
            required
          />
        </div>

        <Input
          label="Limite"
          inputMode="numeric"
          value={values.limit}
          onChange={(event) => updateLimitValue(event.target.value)}
          placeholder={formatCurrency(0)}
        />

        <div className="space-y-3 pt-2">
          <Button type="submit" className="w-full" loading={submitting}>
            {isEdit ? 'Salvar alterações' : 'Adicionar cartão'}
          </Button>
          {isEdit && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-danger-text hover:text-danger-text"
              onClick={onDelete}
            >
              Excluir cartão
            </Button>
          ) : null}
        </div>
      </form>
    </BaseBottomSheet>
  );
}

type CardColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function CardColorPicker({ value, onChange }: CardColorPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-app-text">Cor do cartão</p>
      <div className="grid grid-cols-6 gap-2">
        {cardColorOptions.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-label={`Selecionar cor ${option.label}`}
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex h-9 w-full items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isSelected
                  ? 'border-brand-400 bg-app-elevated'
                  : 'border-app-border bg-app-bg/35 hover:bg-app-elevated',
              )}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm shadow-black/25"
                style={{ backgroundColor: option.value }}
              >
                {isSelected ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5 text-white" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
