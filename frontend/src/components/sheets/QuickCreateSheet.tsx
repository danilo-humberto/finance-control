import { ChevronRight, CreditCard, ShoppingCart, Tag } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { BaseBottomSheet } from './BaseBottomSheet';

type QuickCreateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewPurchase: () => void;
  onAddCard: () => void;
  onAddCategory: () => void;
};

const quickActions = [
  {
    key: 'purchase',
    title: 'Nova compra',
    description: 'Registre uma compra no cartao',
    icon: ShoppingCart,
  },
  {
    key: 'card',
    title: 'Adicionar cartao',
    description: 'Cadastre um novo cartao de credito',
    icon: CreditCard,
  },
  {
    key: 'category',
    title: 'Adicionar categoria',
    description: 'Organize seus gastos por categoria',
    icon: Tag,
  },
] as const;

export function QuickCreateSheet({
  open,
  onOpenChange,
  onNewPurchase,
  onAddCard,
  onAddCategory,
}: QuickCreateSheetProps) {
  function handleAction(actionKey: (typeof quickActions)[number]['key']) {
    onOpenChange(false);

    window.setTimeout(() => {
      if (actionKey === 'purchase') {
        onNewPurchase();
      }

      if (actionKey === 'card') {
        onAddCard();
      }

      if (actionKey === 'category') {
        onAddCategory();
      }
    }, 120);
  }

  return (
    <BaseBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="O que voce deseja adicionar?"
      description="Escolha uma opcao abaixo"
    >
      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.key}
              type="button"
              onClick={() => handleAction(action.key)}
              className="flex w-full items-center gap-4 rounded-xl border border-app-border bg-app-surface p-4 text-left transition-colors hover:border-brand-700/70 hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-app-icon text-brand-400">
                <Icon aria-hidden="true" className="h-7 w-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-app-text">
                  {action.title}
                </span>
                <span className="mt-1 block text-sm leading-5 text-app-muted">
                  {action.description}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="h-5 w-5 text-app-muted" />
            </button>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          className="mt-5 w-full"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
      </div>
    </BaseBottomSheet>
  );
}
