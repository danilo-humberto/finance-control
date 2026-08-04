import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { CategoriesDesktopView } from '@/pages/categories/CategoriesDesktopView';
import { useCategoriesPageData } from '@/pages/categories/useCategoriesPageData';

export function CategoriesSettingsContent() {
  const categoriesData = useCategoriesPageData();

  return (
    <>
      <CategoriesDesktopView {...categoriesData} embedded />

      <CategoryFormDialog
        open={categoriesData.categorySheetOpen}
        onOpenChange={categoriesData.onCategorySheetOpenChange}
        mode={categoriesData.categoryFormMode}
        submitting={categoriesData.submittingCategory}
        initialData={categoriesData.categoryFormInitialData}
        onSubmit={categoriesData.onCategorySubmit}
        onDelete={categoriesData.onCategoryFormDelete}
      />

      <ConfirmDialog
        open={categoriesData.deleteDialogOpen}
        onOpenChange={categoriesData.onDeleteDialogOpenChange}
        title="Excluir categoria"
        description="Tem certeza que deseja excluir esta categoria?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        confirming={categoriesData.deletingCategory}
        onConfirm={categoriesData.onConfirmDelete}
      />
    </>
  );
}
