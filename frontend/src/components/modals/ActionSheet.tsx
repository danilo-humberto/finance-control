import { type ComponentType } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { BaseBottomSheet } from '../sheets/BaseBottomSheet';

export type ActionSheetAction = {
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger';
  onClick: () => void;
};

type ActionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  actions: ActionSheetAction[];
};

export function ActionSheet({
  open,
  onOpenChange,
  title,
  actions,
}: ActionSheetProps) {
  function handleAction(action: ActionSheetAction) {
    action.onClick();
    onOpenChange(false);
  }

  return (
    <BaseBottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isDanger = action.variant === 'danger';

          return (
            <button
              key={action.label}
              type="button"
              onClick={() => handleAction(action)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border border-app-border bg-app-surface p-4 text-left transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isDanger &&
                  'border-danger-border/80 text-danger-text focus-visible:ring-danger',
              )}
            >
              {Icon ? (
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-icon text-brand-400',
                    isDanger && 'bg-danger-surface text-danger-text',
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
              ) : null}
              <span>
                <span className="block text-sm font-semibold">
                  {action.label}
                </span>
                {action.description ? (
                  <span className="mt-1 block text-xs text-app-muted">
                    {action.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
      </div>
    </BaseBottomSheet>
  );
}
