import { Edit3, Plus, Trash2 } from 'lucide-react';
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

  const isSubcategory = Boolean(categoriesData.selectedCategory?.parentId);

  const actionSheetActions = [
    ...(!isSubcategory && categoriesData.selectedCategory
      ? [
          {
            label: 'Adicionar subcategoria',
            description: 'Criar subcategoria vinculada a esta',
            icon: Plus,
            onClick: () =>
              categoriesData.onAddSubcategory(categoriesData.selectedCategory!),
          },
        ]
      : []),
    {
      label: isSubcategory ? 'Editar subcategoria' : 'Editar categoria',
      description: 'Alterar nome, vínculo, ícone e cor',
      icon: Edit3,
      onClick: () => categoriesData.onEditCategory(),
    },
    {
      label: isSubcategory ? 'Excluir subcategoria' : 'Excluir categoria',
      description: isSubcategory
        ? 'Remover esta subcategoria'
        : 'Remover esta categoria e suas subcategorias',
      icon: Trash2,
      variant: 'danger' as const,
      onClick: () => categoriesData.onDeleteCategory(),
    },
  ];

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
        actions={actionSheetActions}
      />

      {isDesktopViewport ? (
        <CategoryFormDialog
          open={categoriesData.categorySheetOpen}
          onOpenChange={categoriesData.onCategorySheetOpenChange}
          mode={categoriesData.categoryFormMode}
          submitting={categoriesData.submittingCategory}
          submitError={categoriesData.categorySubmitError}
          initialData={categoriesData.categoryFormInitialData}
          parentCategories={categoriesData.parentCategories}
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
          parentCategories={categoriesData.parentCategories}
          onSubmit={categoriesData.onCategorySubmit}
          onDelete={categoriesData.onCategoryFormDelete}
        />
      )}

      <ConfirmDialog
        open={categoriesData.deleteDialogOpen}
        onOpenChange={categoriesData.onDeleteDialogOpenChange}
        title={isSubcategory ? 'Excluir subcategoria' : 'Excluir categoria'}
        description={
          isSubcategory
            ? 'Tem certeza que deseja excluir esta subcategoria?'
            : 'Tem certeza que deseja excluir esta categoria? Ela não poderá ser excluída se estiver em uso.'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        confirming={categoriesData.deletingCategory}
        onConfirm={categoriesData.onConfirmDelete}
      />
    </>
  );
}
