import {
  CategoryForm,
  type CategoryFormValues,
} from '@/components/categories/CategoryForm';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { type Category } from '@/types/category';

type CategoryFormDialogProps = {
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

export function CategoryFormDialog({
  initialData,
  parentCategories = [],
  mode,
  onDelete,
  onOpenChange,
  onSubmit,
  open,
  submitting = false,
  submitError = null,
}: CategoryFormDialogProps) {
  const isEdit = mode === 'edit';
  const isSubcategory = Boolean(initialData?.parentId);

  return (
    <SettingsDialog
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
      description={
        isEdit
          ? 'Atualize nome, vínculo, tipo, ícone e cor.'
          : 'Crie uma categoria ou subcategoria para organizar suas movimentações.'
      }
      size="md"
    >
      <CategoryForm
        open={open}
        mode={mode}
        initialData={initialData}
        parentCategories={parentCategories}
        onSubmit={onSubmit}
        onDelete={onDelete}
        submitting={submitting}
        submitError={submitError}
      />
    </SettingsDialog>
  );
}
