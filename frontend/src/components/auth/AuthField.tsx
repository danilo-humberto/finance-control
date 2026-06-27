import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  leftIcon?: ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
};

export function AuthField({
  id,
  label,
  leftIcon,
  error,
  showPasswordToggle,
  className,
  type = 'text',
  ...props
}: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = showPasswordToggle
    ? passwordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-[0.76rem] font-medium text-app-text">
        {label}
      </label>

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-400">
            {leftIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          type={inputType}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-11 w-full rounded-xl border border-app-border bg-app-bg/35 px-3 text-[0.82rem] text-app-text outline-none transition-colors',
            'placeholder:text-app-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            leftIcon && 'pl-10',
            showPasswordToggle && 'pr-10',
            error && 'border-danger-border focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        />

        {showPasswordToggle ? (
          <button
            type="button"
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setPasswordVisible((currentValue) => !currentValue)}
            className="absolute inset-y-0 right-2 flex items-center rounded-lg px-2 text-app-muted transition-colors hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-[0.7rem] leading-4 text-danger-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
