import { X } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
      role="presentation"
    >
      <div
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
        className={cn(
          'w-full max-w-lg rounded-lg border border-app-border bg-app-surface text-app-text shadow-xl',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-app-border p-4">
          <h2 id="modal-title" className="text-base font-semibold">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
