import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';
import { Label } from './Label';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, label, error, helperText, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    return (
      <div className="space-y-2">
        {label ? <Label htmlFor={selectId}>{label}</Label> : null}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'h-11 w-full rounded-md border bg-app-surface px-3 text-sm text-app-text outline-none transition-colors',
            'border-app-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error &&
              'border-danger-border focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        >
          {children}
        </select>
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

Select.displayName = 'Select';
