import { type ReactNode } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type BaseBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function BaseBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: BaseBottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'mx-auto flex w-full max-w-lg flex-col overflow-hidden bg-app-surface px-5 pt-3',
          className,
        )}
      >
        <div className="mx-auto mb-5 h-1 w-11 rounded-full bg-app-muted/50" />
        <SheetHeader className="mb-5">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
        {footer ? <div className="pt-4">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  );
}
