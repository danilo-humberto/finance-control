import { Edit3, Trash2 } from 'lucide-react';

import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { CategoryFormSheet } from '@/components/sheets/CategoryFormSheet';

import { CategoriesDesktopView } from './CategoriesDesktopView';
import { CategoriesMobileView } from './CategoriesMobileView';
import { useCategoriesPageData } from './useCategoriesPageData';

export function CategoriesPage() {
  const categoriesData = useCategoriesPageData();

  return (
    <>
      <div className="lg:hidden">
        <CategoriesMobileView {...categoriesData} />
      </div>
      <div className="hidden lg:block">
        <CategoriesDesktopView {...categoriesData} />
      </div>

      <ActionSheet
        open={categoriesData.actionSheetOpen}
        onOpenChange={categoriesData.onActionSheetOpenChange}
        title={
          categoriesData.selectedCategory
            ? categoriesData.selectedCategory.name
            : 'Categoria'
        }
        actions={[
          {
            label: 'Editar categoria',
            description: 'Alterar nome, tipo, ícone e cor',
            icon: Edit3,
            onClick: () => categoriesData.onEditCategory(),
          },
          {
            label: 'Excluir categoria',
            description: 'Remover esta categoria da lista',
            icon: Trash2,
            variant: 'danger',
            onClick: () => categoriesData.onDeleteCategory(),
          },
        ]}
      />

      <CategoryFormSheet
        open={categoriesData.categorySheetOpen}
        onOpenChange={categoriesData.onCategorySheetOpenChange}
        mode={categoriesData.categoryFormMode}
        closeOnSubmit={false}
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
