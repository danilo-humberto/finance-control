import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '../../lib/utils';
import { Label } from './Label';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, id, label, error, helperText, leftIcon, type = 'text', ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-2">
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}

        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-app-muted">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'h-11 w-full rounded-md border bg-app-surface px-3 text-sm text-app-text outline-none transition-colors',
              'border-app-border placeholder:text-app-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              'disabled:cursor-not-allowed disabled:opacity-60',
              leftIcon && 'pl-10',
              error &&
                'border-danger-border focus:border-danger focus:ring-danger/20',
              className,
            )}
            {...props}
          />
        </div>

        {error ? (
          <p id={errorId} className="text-sm text-danger-text">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-app-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
