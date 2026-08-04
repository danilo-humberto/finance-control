import {
  CategoryForm,
  type CategoryFormValues,
} from '@/components/categories/CategoryForm';

import { BaseBottomSheet } from './BaseBottomSheet';

export type { CategoryFormValues } from '@/components/categories/CategoryForm';

type CategoryFormSheetProps = {
  closeOnSubmit?: boolean;
  initialData?: Partial<CategoryFormValues>;
  mode: 'create' | 'edit';
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
  open: boolean;
  submitError?: string | null;
  submitting?: boolean;
};

export function CategoryFormSheet({
  closeOnSubmit = true,
  initialData,
  mode,
  onDelete,
  onOpenChange,
  onSubmit,
  open,
  submitting = false,
  submitError = null,
}: CategoryFormSheetProps) {
  const isEdit = mode === 'edit';

  async function handleSubmit(values: CategoryFormValues) {
    await onSubmit(values);

    if (closeOnSubmit) {
      onOpenChange(false);
    }
  }

  return (
    <BaseBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar categoria' : 'Nova categoria'}
    >
      <CategoryForm
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
