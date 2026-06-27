import { cn } from '@/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react';

type SettingsItemProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  onClick?: () => void;
};

export function SettingsItem({
  title,
  description,
  icon: Icon,
  badge,
  onClick,
}: SettingsItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 border-b border-app-border/80 px-2.5 py-3 text-left transition-colors last:border-b-0 hover:bg-app-elevated/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.86rem] font-semibold leading-5 text-app-text">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[0.68rem] leading-4 text-app-muted">
          {description}
        </span>
      </span>

      {badge ? (
        <span className="shrink-0 rounded-lg bg-brand-500/15 px-2 py-1 text-[0.68rem] font-semibold leading-4 text-brand-400">
          {badge}
        </span>
      ) : null}

      <ChevronRight
        aria-hidden="true"
        className={cn('h-5 w-5 shrink-0 text-brand-400', badge && 'ml-0.5')}
      />
    </button>
  );
}
