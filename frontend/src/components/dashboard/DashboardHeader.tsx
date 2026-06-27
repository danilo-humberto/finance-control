import { type MockUser } from '@/mocks/financeMocks';

type DashboardHeaderProps = {
  user: MockUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const firstName = user.name.split(' ')[0] || 'Usuário';
  const avatarLabel = firstName.charAt(0).toUpperCase();

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[1.48rem] font-bold leading-tight text-app-text">
          Olá, {firstName} <span aria-hidden="true">{'\u{1F44B}'}</span>
        </h1>
        <p className="mt-1 text-[0.86rem] leading-5 text-app-muted">
          Resumo financeiro
        </p>
      </div>

      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-800/60 bg-app-icon text-lg font-semibold text-brand-300 shadow-lg shadow-brand-950/25"
        aria-label={`Avatar de ${firstName}`}
      >
        {avatarLabel}
      </div>
    </header>
  );
}
