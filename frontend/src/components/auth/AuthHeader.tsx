import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Lock, WalletCards, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type AuthHeaderProps = {
  title: string;
  description: string;
  backTo?: string;
  variant?: 'brand' | 'secure';
  icon?: LucideIcon;
};

export function AuthHeader({
  title,
  description,
  backTo,
  variant = 'brand',
  icon: Icon,
}: AuthHeaderProps) {
  const HeaderIcon = Icon ?? (variant === 'secure' ? Lock : WalletCards);

  return (
    <header
      className={cn(
        'relative text-center',
        variant === 'brand' && 'lg:text-left',
      )}
    >
      {backTo ? (
        <Link
          to={backTo}
          aria-label="Voltar"
          className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text shadow-lg shadow-black/15 transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : null}

      {/* On desktop, variant="brand" shows the logo above the card in AuthShell */}
      <div
        className={cn(
          'mx-auto flex w-fit flex-col items-center',
          variant === 'brand' && 'lg:hidden',
        )}
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
          <HeaderIcon aria-hidden="true" className="h-8 w-8" />
          {variant === 'secure' ? (
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-slate-950 shadow-lg shadow-brand-950/35">
              <Check aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </span>

        {variant === 'brand' ? (
          <p className="mt-3 text-[1rem] font-bold leading-5 text-app-text">
            Finance <span className="text-brand-400">Control</span>
          </p>
        ) : null}
      </div>

      <div className={cn('mt-5', variant === 'brand' && 'lg:mt-0')}>
        <h1 className="text-[1.2rem] font-bold leading-tight text-app-text lg:text-[1.7rem] lg:tracking-tight lg:text-white">
          {title}
        </h1>
        <p className="mt-2 text-[0.8rem] leading-5 text-app-muted lg:text-[0.86rem]">
          {description}
        </p>
      </div>
    </header>
  );
}
