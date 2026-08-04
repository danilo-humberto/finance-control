import { useContext } from 'react';

import { NewPurchaseDialogContext } from '@/contexts/NewPurchaseDialogContext';

export function useNewPurchaseDialog() {
  const context = useContext(NewPurchaseDialogContext);

  if (!context) {
    throw new Error(
      'useNewPurchaseDialog must be used within a NewPurchaseDialogProvider.',
    );
  }

  return context;
}
