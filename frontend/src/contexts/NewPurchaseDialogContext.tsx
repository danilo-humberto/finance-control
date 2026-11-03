import { AlertTriangle, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { type PaymentMode } from '@/components/transactions/PaymentMethodCard';
import { TransactionFormController } from '@/components/transactions/TransactionFormController';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type OpenNewPurchaseDialogOptions = {
  initialPaymentMode?: PaymentMode;
};

type NewPurchaseDialogContextValue = {
  openNewPurchaseDialog: (options?: OpenNewPurchaseDialogOptions) => void;
  openEditPurchaseDialog: (transactionId: string) => void;
};

type NewPurchaseDialogProviderProps = {
  children: ReactNode;
};

function hasOpenNestedPurchaseLayer() {
  return Boolean(
    document.querySelector('[data-purchase-dialog-layer][data-state="open"]'),
  );
}

function resolveInitialPaymentMode(
  options?: OpenNewPurchaseDialogOptions,
): PaymentMode {
  if (
    options &&
    typeof options === 'object' &&
    'initialPaymentMode' in options &&
    (options.initialPaymentMode === 'cash' ||
      options.initialPaymentMode === 'installments' ||
      options.initialPaymentMode === 'recurring')
  ) {
    return options.initialPaymentMode;
  }

  return 'cash';
}

export const NewPurchaseDialogContext = createContext<
  NewPurchaseDialogContextValue | undefined
>(undefined);

export function NewPurchaseDialogProvider({
  children,
}: NewPurchaseDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | undefined
  >(undefined);
  const [initialPaymentMode, setInitialPaymentMode] =
    useState<PaymentMode>('cash');
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const isEditMode = Boolean(editingTransactionId);

  useEffect(() => {
    if (!discardDialogOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      continueButtonRef.current?.focus();
    });
  }, [discardDialogOpen]);

  const restoreOpenerFocus = useCallback(() => {
    const opener = openerRef.current;
    openerRef.current = null;

    window.requestAnimationFrame(() => {
      if (opener?.isConnected) {
        opener.focus();
      }
    });
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditingTransactionId(undefined);
    setInitialPaymentMode('cash');
    setDiscardDialogOpen(false);
    setDirty(false);
    setSubmitting(false);
    restoreOpenerFocus();
  }, [restoreOpenerFocus]);

  const openNewPurchaseDialog = useCallback(
    (options?: OpenNewPurchaseDialogOptions) => {
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setEditingTransactionId(undefined);
      setInitialPaymentMode(resolveInitialPaymentMode(options));
      setDirty(false);
      setSubmitting(false);
      setDiscardDialogOpen(false);
      setOpen(true);
    },
    [],
  );

  const openEditPurchaseDialog = useCallback((transactionId: string) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setEditingTransactionId(transactionId);
    setInitialPaymentMode('cash');
    setDirty(false);
    setSubmitting(false);
    setDiscardDialogOpen(false);
    setOpen(true);
  }, []);

  const requestClose = useCallback(() => {
    if (submitting) {
      return;
    }

    if (dirty) {
      setDiscardDialogOpen(true);
      return;
    }

    closeDialog();
  }, [closeDialog, dirty, submitting]);

  const contextValue = useMemo(
    () => ({ openNewPurchaseDialog, openEditPurchaseDialog }),
    [openNewPurchaseDialog, openEditPurchaseDialog],
  );

  return (
    <NewPurchaseDialogContext.Provider value={contextValue}>
      {children}

      <Dialog open={open} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90dvh] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0"
          onEscapeKeyDown={(event) => {
            event.preventDefault();

            if (hasOpenNestedPurchaseLayer()) {
              return;
            }

            if (discardDialogOpen) {
              setDiscardDialogOpen(false);
              return;
            }

            requestClose();
          }}
          onPointerDownOutside={(event) => {
            if (hasOpenNestedPurchaseLayer()) {
              return;
            }

            event.preventDefault();

            if (!discardDialogOpen) {
              requestClose();
            }
          }}
        >
          <DialogHeader className="relative shrink-0 border-b border-app-border px-6 py-5 pr-16 text-left">
            <DialogTitle>
              {discardDialogOpen
                ? isEditMode
                  ? 'Descartar alterações'
                  : 'Descartar nova compra'
                : isEditMode
                  ? 'Editar compra'
                  : 'Nova compra'}
            </DialogTitle>
            <DialogDescription>
              {discardDialogOpen
                ? isEditMode
                  ? 'As alterações feitas não serão salvas.'
                  : 'Os dados preenchidos serão perdidos.'
                : isEditMode
                  ? 'Atualize os dados da compra sem sair da tela atual.'
                  : 'Registre uma compra sem sair da tela atual.'}
            </DialogDescription>

            <button
              type="button"
              aria-label={
                discardDialogOpen
                  ? 'Voltar ao formulário'
                  : isEditMode
                    ? 'Fechar edição de compra'
                    : 'Fechar nova compra'
              }
              disabled={submitting}
              onClick={() => {
                if (discardDialogOpen) {
                  setDiscardDialogOpen(false);
                  return;
                }

                requestClose();
              }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </DialogHeader>

          {open ? (
            <>
              <div
                className={
                  discardDialogOpen
                    ? 'hidden'
                    : 'flex min-h-0 flex-1 flex-col'
                }
              >
                <TransactionFormController
                  key={`${editingTransactionId ?? 'new'}-${initialPaymentMode}`}
                  initialPaymentMode={initialPaymentMode}
                  transactionId={editingTransactionId}
                  presentation="dialog"
                  onCancel={requestClose}
                  onDirtyChange={setDirty}
                  onSubmittingChange={setSubmitting}
                  onSuccess={closeDialog}
                />
              </div>

              {discardDialogOpen ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                    <AlertTriangle aria-hidden="true" className="h-6 w-6" />
                  </div>

                  <p className="max-w-md text-sm leading-6 text-app-muted">
                    Esta ação não pode ser desfeita. Você pode continuar
                    preenchendo para manter o rascunho atual.
                  </p>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                      variant="danger"
                      onClick={closeDialog}
                      className="sm:min-w-28"
                    >
                      Descartar
                    </Button>
                    <Button
                      ref={continueButtonRef}
                      variant="secondary"
                      onClick={() => setDiscardDialogOpen(false)}
                      className="sm:min-w-44"
                    >
                      Continuar preenchendo
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </NewPurchaseDialogContext.Provider>
  );
}
