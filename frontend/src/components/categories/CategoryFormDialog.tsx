import {
  CategoryForm,
  type CategoryFormValues,
} from '@/components/categories/CategoryForm';
import { SettingsDialog } from '@/components/settings/SettingsDialog';

type CategoryFormDialogProps = {
  initialData?: Partial<CategoryFormValues>;
  mode: 'create' | 'edit';
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
  open: boolean;
  submitError?: string | null;
  submitting?: boolean;
};

export function CategoryFormDialog({
  initialData,
  mode,
  onDelete,
  onOpenChange,
  onSubmit,
  open,
  submitting = false,
  submitError = null,
}: CategoryFormDialogProps) {
  const isEdit = mode === 'edit';

  return (
    <SettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar categoria' : 'Nova categoria'}
      description={
        isEdit
          ? 'Atualize nome, tipo, ícone e cor.'
          : 'Crie uma categoria para organizar suas movimentações.'
      }
      size="md"
    >
      <CategoryForm
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
