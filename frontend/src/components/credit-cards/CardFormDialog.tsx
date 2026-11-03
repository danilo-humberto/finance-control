import {
  CardForm,
  type CardFormValues,
} from '@/components/credit-cards/CardForm';
import { SettingsDialog } from '@/components/settings/SettingsDialog';

type CardFormDialogProps = {
  initialData?: Partial<CardFormValues>;
  mode: 'create' | 'edit';
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CardFormValues) => void | Promise<void>;
  open: boolean;
  submitError?: string | null;
  submitting?: boolean;
};

export function CardFormDialog({
  initialData,
  mode,
  onDelete,
  onOpenChange,
  onSubmit,
  open,
  submitting = false,
  submitError = null,
}: CardFormDialogProps) {
  const isEdit = mode === 'edit';

  return (
    <SettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar cartão' : 'Adicionar cartão'}
      description={
        isEdit
          ? 'Atualize nome, cor, datas de fechamento e vencimento ou limite do cartão.'
          : 'Cadastre um cartão de crédito para acompanhar limites e faturas.'
      }
      size="md"
    >
      <CardForm
        open={open}
        mode={mode}
        initialData={initialData}
        onSubmit={onSubmit}
        onDelete={onDelete}
        submitting={submitting}
        submitError={submitError}
      />
    </SettingsDialog>
  );
}
