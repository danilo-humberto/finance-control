import { BaseBottomSheet } from '@/components/sheets/BaseBottomSheet';
import {
  type RecurringTransaction,
  type UpdateRecurringTransactionPayload,
} from '@/types/recurring-transaction';
import { RecurringForm } from './RecurringForm';

type RecurringFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringTransaction: RecurringTransaction | null;
  onSubmit: (payload: UpdateRecurringTransactionPayload) => Promise<void> | void;
  submitting?: boolean;
  submitError?: string | null;
};

export function RecurringFormSheet({
  open,
  onOpenChange,
  recurringTransaction,
  onSubmit,
  submitting = false,
  submitError = null,
}: RecurringFormSheetProps) {
  return (
    <BaseBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar recorrência"
      description="Atualize as informações da assinatura ou despesa fixa."
    >
      <RecurringForm
        recurringTransaction={recurringTransaction}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        submitting={submitting}
        submitError={submitError}
      />
    </BaseBottomSheet>
  );
}
