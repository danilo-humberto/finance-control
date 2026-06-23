import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-brand-700/60 bg-app-icon text-brand-300',
  success: 'border-success-border bg-success-surface text-success-text',
  warning: 'border-warning-border bg-warning-surface text-warning-text',
  danger: 'border-danger-border bg-danger-surface text-danger-text',
  muted: 'border-app-border bg-app-elevated text-app-muted',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = 'Badge';
