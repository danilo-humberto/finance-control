import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BaseBottomSheet } from './BaseBottomSheet';

export type CardFormValues = {
  name: string;
  type: string;
  brand: string;
  closingDay: string;
  dueDay: string;
  limit: string;
};

type CardFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CardFormValues>;
  onSubmit: (values: CardFormValues) => void;
  onDelete?: () => void;
};

const emptyValues: CardFormValues = {
  name: '',
  type: '',
  brand: '',
  closingDay: '',
  dueDay: '',
  limit: '',
};

export function CardFormSheet({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  onDelete,
}: CardFormSheetProps) {
  const [values, setValues] = useState<CardFormValues>(emptyValues);

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues, ...initialData });
    }
  }, [initialData, open]);

  function updateValue(field: keyof CardFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
    onOpenChange(false);
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

        <Select
          label="Tipo do cartão"
          value={values.type}
          onChange={(event) => updateValue('type', event.target.value)}
          required
        >
          <option value="">Selecione o tipo</option>
          <option value="Crédito">Crédito</option>
          <option value="Débito">Débito</option>
          <option value="Crédito e débito">Crédito e débito</option>
        </Select>

        <Select
          label="Bandeira"
          value={values.brand}
          onChange={(event) => updateValue('brand', event.target.value)}
          required
        >
          <option value="">Selecione a bandeira</option>
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="Elo">Elo</option>
          <option value="Hipercard">Hipercard</option>
          <option value="Outra">Outra</option>
        </Select>

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
          inputMode="decimal"
          value={values.limit}
          onChange={(event) => updateValue('limit', event.target.value)}
          placeholder="R$ 0,00"
        />

        <div className="space-y-3 pt-2">
          <Button type="submit" className="w-full">
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
