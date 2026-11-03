import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = showPasswordToggle
    ? passwordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <div className="space-y-2 lg:space-y-1.5">
      <Label
        htmlFor={inputId}
        className="block text-[0.76rem] font-medium text-app-text lg:sr-only"
      >
        {label}
      </Label>

      <div className="relative [&_span.pointer-events-none]:text-brand-400 lg:[&_span.pointer-events-none]:hidden">
        <Input
          id={inputId}
          type={inputType}
          leftIcon={leftIcon}
          error={error}
          className={cn(
            'rounded-xl bg-app-bg/35 text-[0.82rem] lg:h-12 lg:border-white/10 lg:bg-[#070d0a]/90 lg:px-4 lg:pl-4 lg:text-[0.88rem] lg:placeholder:text-white/45',
            showPasswordToggle && 'pr-10 lg:pr-11',
            className,
          )}
          {...props}
        />

        {showPasswordToggle ? (
          <button
            type="button"
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setPasswordVisible((currentValue) => !currentValue)}
            className="absolute right-2 top-0 flex h-11 items-center rounded-lg px-2 text-app-muted transition-colors hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:h-12"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
