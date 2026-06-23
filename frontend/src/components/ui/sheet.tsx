import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type SheetSide = 'top' | 'right' | 'bottom' | 'left';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sideClasses: Record<SheetSide, string> = {
  top: 'inset-x-0 top-0 border-b',
  right: 'inset-y-0 right-0 h-full w-4/5 max-w-sm border-l',
  bottom:
    'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t pb-[calc(env(safe-area-inset-bottom)+1rem)]',
  left: 'inset-y-0 left-0 h-full w-4/5 max-w-sm border-r',
};

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> & {
  side?: SheetSide;
  showClose?: boolean;
};

const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  (
    { side = 'right', className, children, showClose = true, ...props },
    ref,
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 border-app-border bg-app-surface text-app-text shadow-2xl outline-none',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <X aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-2 text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-5 flex flex-col gap-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-xl font-semibold text-app-text', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm leading-6 text-app-muted', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
