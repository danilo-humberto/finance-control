import { SettingsDialog } from '@/components/settings/SettingsDialog';
import {
  type RecurringTransaction,
  type UpdateRecurringTransactionPayload,
} from '@/types/recurring-transaction';
import { RecurringForm } from './RecurringForm';

type RecurringFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringTransaction: RecurringTransaction | null;
  onSubmit: (payload: UpdateRecurringTransactionPayload) => Promise<void> | void;
  submitting?: boolean;
  submitError?: string | null;
};

export function RecurringFormDialog({
  open,
  onOpenChange,
  recurringTransaction,
  onSubmit,
  submitting = false,
  submitError = null,
}: RecurringFormDialogProps) {
  return (
    <SettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar recorrência"
      description="Atualize as configurações, valor e método de cobrança da assinatura."
      size="md"
    >
      <RecurringForm
        recurringTransaction={recurringTransaction}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        submitting={submitting}
        submitError={submitError}
      />
    </SettingsDialog>
  );
}
