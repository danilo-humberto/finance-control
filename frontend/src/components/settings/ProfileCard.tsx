import { ChevronRight, Pencil } from 'lucide-react';

import { UserAvatar } from '@/components/user/UserAvatar';

type ProfileCardProps = {
  name: string;
  email: string;
  initials: string;
  photoUrl?: string | null;
  onClick?: () => void;
};

export function ProfileCard({
  name,
  email,
  initials,
  photoUrl,
  onClick,
}: ProfileCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-app-border bg-app-surface/75 p-3 text-left shadow-lg shadow-black/15 transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span className="relative flex h-14 w-14 shrink-0">
        <UserAvatar
          name={name}
          email={email}
          photoUrl={photoUrl}
          fallback={initials}
          ariaLabel={`Avatar de ${name || 'usuario'}`}
          className="h-14 w-14 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-[1.15rem] font-bold"
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-slate-950 shadow-lg shadow-brand-950/35">
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.95rem] font-semibold leading-5 text-app-text">
          {name}
        </span>
        <span className="mt-1 block truncate text-[0.76rem] leading-4 text-app-muted">
          {email}
        </span>
      </span>

      <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-400" />
    </button>
  );
}
