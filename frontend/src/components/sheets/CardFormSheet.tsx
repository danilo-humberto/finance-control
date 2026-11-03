import {
  CardForm,
  type CardFormValues,
} from '@/components/credit-cards/CardForm';

import { BaseBottomSheet } from './BaseBottomSheet';

export type { CardFormValues } from '@/components/credit-cards/CardForm';

type CardFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CardFormValues>;
  onSubmit: (values: CardFormValues) => void | Promise<void>;
  onDelete?: () => void;
  closeOnSubmit?: boolean;
  submitting?: boolean;
  submitError?: string | null;
};

export function CardFormSheet({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  onDelete,
  closeOnSubmit = true,
  submitting = false,
  submitError = null,
}: CardFormSheetProps) {
  const isEdit = mode === 'edit';

  async function handleSubmit(values: CardFormValues) {
    await onSubmit(values);

    if (closeOnSubmit) {
      onOpenChange(false);
    }
  }

  return (
    <BaseBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar cartão' : 'Adicionar cartão'}
    >
      <CardForm
        open={open}
        mode={mode}
        initialData={initialData}
        onSubmit={handleSubmit}
        onDelete={onDelete}
        submitting={submitting}
        submitError={submitError}
      />
    </BaseBottomSheet>
  );
}
