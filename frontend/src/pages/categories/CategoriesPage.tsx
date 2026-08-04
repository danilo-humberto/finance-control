import { Edit3, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { CategoryFormSheet } from '@/components/sheets/CategoryFormSheet';

import { CategoriesDesktopView } from './CategoriesDesktopView';
import { CategoriesMobileView } from './CategoriesMobileView';
import { useCategoriesPageData } from './useCategoriesPageData';

const desktopMediaQuery = '(min-width: 1024px)';

export function CategoriesPage() {
  const categoriesData = useCategoriesPageData();
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    window.matchMedia(desktopMediaQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);

    function handleViewportChange(event: MediaQueryListEvent) {
      categoriesData.onCategorySheetOpenChange(false);
      setIsDesktopViewport(event.matches);
    }

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [categoriesData.onCategorySheetOpenChange]);

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

      {isDesktopViewport ? (
        <CategoryFormDialog
          open={categoriesData.categorySheetOpen}
          onOpenChange={categoriesData.onCategorySheetOpenChange}
          mode={categoriesData.categoryFormMode}
          submitting={categoriesData.submittingCategory}
          submitError={categoriesData.categorySubmitError}
          initialData={categoriesData.categoryFormInitialData}
          onSubmit={categoriesData.onCategorySubmit}
          onDelete={categoriesData.onCategoryFormDelete}
        />
      ) : (
        <CategoryFormSheet
          open={categoriesData.categorySheetOpen}
          onOpenChange={categoriesData.onCategorySheetOpenChange}
          mode={categoriesData.categoryFormMode}
          closeOnSubmit={false}
          submitting={categoriesData.submittingCategory}
          submitError={categoriesData.categorySubmitError}
          initialData={categoriesData.categoryFormInitialData}
          onSubmit={categoriesData.onCategorySubmit}
          onDelete={categoriesData.onCategoryFormDelete}
        />
      )}

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
