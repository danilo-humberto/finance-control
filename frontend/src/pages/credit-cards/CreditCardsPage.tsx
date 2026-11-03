import { Edit3, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CardFormDialog } from '@/components/credit-cards/CardFormDialog';
import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { CardFormSheet } from '@/components/sheets/CardFormSheet';

import { CreditCardsDesktopView } from './CreditCardsDesktopView';
import { CreditCardsMobileView } from './CreditCardsMobileView';
import { useCreditCardsPageData } from './useCreditCardsPageData';

const desktopMediaQuery = '(min-width: 1024px)';

export function CreditCardsPage() {
  const creditCardsData = useCreditCardsPageData();
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    window.matchMedia(desktopMediaQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);

    function handleViewportChange(event: MediaQueryListEvent) {
      creditCardsData.onCardSheetOpenChange(false);
      setIsDesktopViewport(event.matches);
    }

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [creditCardsData.onCardSheetOpenChange]);

  return (
    <>
      <div className="lg:hidden">
        <CreditCardsMobileView {...creditCardsData} />
      </div>
      <div className="hidden lg:block">
        <CreditCardsDesktopView {...creditCardsData} />
      </div>

      <ActionSheet
        open={creditCardsData.actionSheetOpen}
        onOpenChange={creditCardsData.onActionSheetOpenChange}
        title={
          creditCardsData.selectedCard
            ? creditCardsData.selectedCard.name
            : 'Cartão'
        }
        actions={[
          {
            label: 'Editar cartão',
            description: 'Alterar dados e limite do cartão',
            icon: Edit3,
            onClick: () => creditCardsData.onEditCard(),
          },
          {
            label: 'Excluir cartão',
            description: 'Remover este cartão da lista',
            icon: Trash2,
            variant: 'danger',
            onClick: () => creditCardsData.onDeleteCard(),
          },
        ]}
      />

      {isDesktopViewport ? (
        <CardFormDialog
          open={creditCardsData.cardSheetOpen}
          onOpenChange={creditCardsData.onCardSheetOpenChange}
          mode={creditCardsData.cardFormMode}
          submitting={creditCardsData.submittingCard}
          submitError={creditCardsData.cardSubmitError}
          initialData={creditCardsData.cardFormInitialData}
          onSubmit={creditCardsData.onCardSubmit}
          onDelete={creditCardsData.onCardFormDelete}
        />
      ) : (
        <CardFormSheet
          open={creditCardsData.cardSheetOpen}
          onOpenChange={creditCardsData.onCardSheetOpenChange}
          mode={creditCardsData.cardFormMode}
          closeOnSubmit={false}
          submitting={creditCardsData.submittingCard}
          submitError={creditCardsData.cardSubmitError}
          initialData={creditCardsData.cardFormInitialData}
          onSubmit={creditCardsData.onCardSubmit}
          onDelete={creditCardsData.onCardFormDelete}
        />
      )}

      <ConfirmDialog
        open={creditCardsData.deleteDialogOpen}
        onOpenChange={creditCardsData.onDeleteDialogOpenChange}
        title="Excluir cartão"
        description="Tem certeza que deseja excluir este cartão?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        confirming={creditCardsData.deletingCard}
        onConfirm={creditCardsData.onConfirmDelete}
      />
    </>
  );
}
