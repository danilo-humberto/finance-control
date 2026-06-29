import { UserAvatar } from '@/components/user/UserAvatar';

type DashboardHeaderProps = {
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
};

export function DashboardHeader({ name, email, photoUrl }: DashboardHeaderProps) {
  const displayName = name?.trim() || email?.split('@')[0]?.trim() || '';
  const firstName = displayName.split(' ')[0] || '';
  const avatarLabel = (firstName.charAt(0) || 'U').toUpperCase();
  const greeting = firstName ? `Ol\u00e1, ${firstName}` : 'Ol\u00e1';

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[1.48rem] font-bold leading-tight text-app-text">
          {greeting} <span aria-hidden="true">{'\u{1F44B}'}</span>
        </h1>
        <p className="mt-1 text-[0.86rem] leading-5 text-app-muted">
          Resumo financeiro
        </p>
      </div>

      <UserAvatar
        name={displayName}
        email={email}
        photoUrl={photoUrl}
        fallback={avatarLabel}
        ariaLabel={`Avatar de ${firstName || 'usuario'}`}
        className="h-11 w-11 border border-brand-800/60 bg-app-icon text-lg font-semibold text-brand-300 shadow-lg shadow-brand-950/25"
      />
    </header>
  );
}
