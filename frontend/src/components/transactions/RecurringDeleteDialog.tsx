import { AlertCircle, Calendar, CalendarX, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type RecurringDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionDescription: string;
  onConfirm: (includeCurrentMonth: boolean) => void | Promise<void>;
  confirming?: boolean;
  isInactive?: boolean;
};

export function RecurringDeleteDialog({
  open,
  onOpenChange,
  transactionDescription,
  onConfirm,
  confirming = false,
  isInactive = false,
}: RecurringDeleteDialogProps) {
  const [includeCurrentMonth, setIncludeCurrentMonth] = useState(false);

  async function handleConfirm() {
    await onConfirm(isInactive ? false : includeCurrentMonth);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-danger-surface text-danger-text">
            <Trash2 aria-hidden="true" className="h-6 w-6" />
          </div>
          <DialogTitle>
            {isInactive ? 'Excluir recorrência encerrada' : 'Cancelar compra recorrente'}
          </DialogTitle>
          <DialogDescription>
            {isInactive
              ? 'Deseja excluir permanentemente o cadastro de '
              : 'Como você deseja cancelar a recorrência de '}
            <strong className="text-app-text">{transactionDescription}</strong>?
          </DialogDescription>
        </DialogHeader>

        {isInactive ? (
          <div className="py-2">
            <div className="flex items-start gap-2.5 rounded-xl border border-app-border bg-app-surface/50 p-3 text-xs leading-5 text-app-muted">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-app-muted" />
              <span>
                Esta recorrência já está encerrada e não gera novas cobranças. Ao confirmar, o registro será apagado definitivamente. Faturas e pagamentos anteriores permanecerão salvos no seu extrato.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 py-2">
            <button
              type="button"
              onClick={() => setIncludeCurrentMonth(false)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                !includeCurrentMonth
                  ? 'border-brand-500/70 bg-brand-950/30 ring-1 ring-brand-500/50'
                  : 'border-app-border bg-app-surface/50 hover:bg-app-elevated/40',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  !includeCurrentMonth
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-app-elevated text-app-muted',
                )}
              >
                <Calendar aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.82rem] font-semibold text-app-text">
                  Cancelar apenas parcelas futuras
                </p>
                <p className="mt-0.5 text-[0.72rem] leading-4 text-app-muted">
                  Mantém a cobrança do mês atual e remove todas as parcelas dos
                  meses seguintes.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIncludeCurrentMonth(true)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500',
                includeCurrentMonth
                  ? 'border-red-500/70 bg-red-950/20 ring-1 ring-red-500/50'
                  : 'border-app-border bg-app-surface/50 hover:bg-app-elevated/40',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  includeCurrentMonth
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-app-elevated text-app-muted',
                )}
              >
                <CalendarX aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.82rem] font-semibold text-app-text">
                  Cancelar fatura atual e futuras
                </p>
                <p className="mt-0.5 text-[0.72rem] leading-4 text-app-muted">
                  Exclui a cobrança deste mês (se ainda não estiver paga) e todas
                  as futuras.
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 rounded-lg bg-app-elevated/40 px-3 py-2 text-[0.7rem] text-app-muted">
              <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
              <span>
                Cobranças de meses passados ou faturas já pagas nunca são excluídas.
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={confirming}
            className="w-full sm:w-auto"
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={confirming}
            className="w-full sm:w-auto"
          >
            {isInactive ? 'Excluir definitivamente' : 'Confirmar cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
