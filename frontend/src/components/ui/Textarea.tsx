import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';
import { Label } from './Label';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, error, helperText, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;

    return (
      <div className="space-y-2">
        {label ? <Label htmlFor={textareaId}>{label}</Label> : null}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'min-h-28 w-full rounded-md border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition-colors',
            'border-app-border placeholder:text-app-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error &&
              'border-danger-border focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
