import { LoaderCircle } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-slate-950 hover:bg-brand-400 focus-visible:ring-brand-500',
  secondary:
    'border border-app-border bg-app-surface text-app-text hover:bg-app-elevated focus-visible:ring-brand-500',
  ghost:
    'text-app-muted hover:bg-app-surface hover:text-app-text focus-visible:ring-brand-500',
  danger:
    'bg-danger text-white hover:bg-red-500 focus-visible:ring-danger',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 gap-2 px-3 text-sm',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2.5 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
