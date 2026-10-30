import {
  CategoryForm,
  type CategoryFormValues,
} from '@/components/categories/CategoryForm';
import { type Category } from '@/types/category';

import { BaseBottomSheet } from './BaseBottomSheet';

export type { CategoryFormValues } from '@/components/categories/CategoryForm';

type CategoryFormSheetProps = {
  closeOnSubmit?: boolean;
  initialData?: Partial<CategoryFormValues>;
  parentCategories?: Category[];
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
  parentCategories = [],
  mode,
  onDelete,
  onOpenChange,
  onSubmit,
  open,
  submitting = false,
  submitError = null,
}: CategoryFormSheetProps) {
  const isEdit = mode === 'edit';
  const isSubcategory = Boolean(initialData?.parentId);

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
      title={
        isEdit
          ? isSubcategory
            ? 'Editar subcategoria'
            : 'Editar categoria'
          : isSubcategory
            ? 'Nova subcategoria'
            : 'Nova categoria'
      }
    >
      <CategoryForm
        open={open}
        mode={mode}
        initialData={initialData}
        parentCategories={parentCategories}
        onSubmit={handleSubmit}
        onDelete={onDelete}
        submitting={submitting}
        submitError={submitError}
      />
    </BaseBottomSheet>
  );
}
