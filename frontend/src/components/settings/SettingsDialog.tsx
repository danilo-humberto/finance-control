import { type ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type SettingsDialogSize = 'md' | 'lg' | 'xl';

type SettingsDialogProps = {
  children: ReactNode;
  description: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  size?: SettingsDialogSize;
  title: string;
};

const sizeClasses: Record<SettingsDialogSize, string> = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
};

export function SettingsDialog({
  children,
  description,
  onOpenChange,
  open,
  size = 'md',
  title,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0',
          sizeClasses[size],
        )}
      >
        <DialogHeader className="shrink-0 border-b border-app-border px-6 py-5 pr-14">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
