import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { UserAvatar } from '@/components/user/UserAvatar';
import {
  ChevronRight,
  LayoutGrid,
  LogOut,
  Moon,
  Pencil,
  Repeat,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GeneralPreferencesContent } from './GeneralPreferencesPage';
import { ProfileSettingsContent } from './ProfileSettingsPage';
import { ThemeSettingsContent } from './ThemeSettingsPage';

export type SettingsDialogKey =
  | 'profile'
  | 'theme'
  | 'preferences'
  | null;

type DialogTriggerKey = Exclude<SettingsDialogKey, null>;

type SettingsDesktopViewProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
  preferencesSummary: string;
  themeLabel: string;
  userEmail: string;
  userInitials: string;
  userName: string;
  userPhotoUrl?: string | null;
};

type SettingsCardProps = {
  badge?: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  title: string;
};

const SettingsCard = forwardRef<HTMLButtonElement, SettingsCardProps>(
  ({ badge, description, icon: Icon, onClick, title }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="group flex min-h-52 w-full flex-col rounded-2xl border border-app-border bg-app-surface/75 p-5 text-left shadow-lg shadow-black/15 transition-colors hover:border-brand-800/75 hover:bg-app-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        {badge ? (
          <span className="rounded-lg bg-brand-500/15 px-2.5 py-1 text-xs font-semibold text-brand-400">
            {badge}
          </span>
        ) : null}
      </div>

      <span className="mt-5 block text-base font-semibold text-app-text">
        {title}
      </span>
      <span className="mt-2 block max-w-56 text-sm leading-6 text-app-muted">
        {description}
      </span>

      <span className="mt-auto flex w-full items-center justify-between pt-5 text-xs font-semibold text-brand-400">
        Abrir configuração
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </button>
  ),
);

SettingsCard.displayName = 'SettingsCard';

export function SettingsDesktopView({
  isLoggingOut,
  onLogout,
  preferencesSummary,
  themeLabel,
  userEmail,
  userInitials,
  userName,
  userPhotoUrl,
}: SettingsDesktopViewProps) {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<SettingsDialogKey>(null);
  const triggerRefs = useRef<Record<DialogTriggerKey, HTMLButtonElement | null>>({
    profile: null,
    theme: null,
    preferences: null,
  });

  function openDialog(dialog: DialogTriggerKey) {
    setActiveDialog(dialog);
  }

  function closeDialog(dialog: DialogTriggerKey) {
    setActiveDialog(null);
    window.requestAnimationFrame(() => triggerRefs.current[dialog]?.focus());
  }

  function handleOpenChange(dialog: DialogTriggerKey, open: boolean) {
    if (!open) {
      closeDialog(dialog);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[2rem] font-bold leading-tight text-app-text">
          Configurações
        </h1>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Personalize sua experiência
        </p>
      </header>

      <button
        ref={(node) => {
          triggerRefs.current.profile = node;
        }}
        type="button"
        onClick={() => openDialog('profile')}
        className="group flex w-full items-center gap-4 rounded-2xl border border-app-border bg-app-surface/75 p-5 text-left shadow-lg shadow-black/15 transition-colors hover:border-brand-800/75 hover:bg-app-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="relative flex h-16 w-16 shrink-0">
          <UserAvatar
            name={userName}
            email={userEmail}
            photoUrl={userPhotoUrl}
            fallback={userInitials}
            ariaLabel={`Avatar de ${userName || 'usuário'}`}
            className="h-16 w-16 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-xl font-bold"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-slate-950 shadow-lg shadow-brand-950/35">
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-semibold text-app-text">
            {userName}
          </span>
          <span className="mt-1 block truncate text-sm text-app-muted">
            {userEmail}
          </span>
        </span>

        <span className="flex items-center gap-2 text-sm font-semibold text-brand-400">
          Editar perfil
          <ChevronRight
            aria-hidden="true"
            className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </button>

      <section className="space-y-3" aria-labelledby="desktop-settings-preferences">
        <h2
          id="desktop-settings-preferences"
          className="text-base font-semibold text-app-muted"
        >
          Preferências
        </h2>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <SettingsCard
            title="Categorias"
            description="Organize suas categorias de receitas e despesas."
            icon={LayoutGrid}
            onClick={() => navigate('/categories')}
          />
          <SettingsCard
            title="Recorrências"
            description="Gerencie assinaturas e cobranças automáticas."
            icon={Repeat}
            onClick={() => navigate('/recurring')}
          />
          <SettingsCard
            ref={(node) => {
              triggerRefs.current.theme = node;
            }}
            title="Tema"
            description="Escolha como o aplicativo deve aparecer para você."
            icon={Moon}
            badge={themeLabel}
            onClick={() => openDialog('theme')}
          />
          <SettingsCard
            ref={(node) => {
              triggerRefs.current.preferences = node;
            }}
            title="Preferências gerais"
            description="Defina moeda, formato de data e outras preferências."
            icon={SlidersHorizontal}
            badge={preferencesSummary}
            onClick={() => openDialog('preferences')}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-danger-border bg-transparent px-4 text-sm font-semibold text-danger-text transition-colors hover:bg-danger-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
        </button>
      </div>

      <SettingsDialog
        open={activeDialog === 'profile'}
        onOpenChange={(open) => handleOpenChange('profile', open)}
        title="Perfil"
        description="Dados pessoais e informações da conta"
        size="xl"
      >
        {activeDialog === 'profile' ? (
          <ProfileSettingsContent presentation="dialog" />
        ) : null}
      </SettingsDialog>

      <SettingsDialog
        open={activeDialog === 'theme'}
        onOpenChange={(open) => handleOpenChange('theme', open)}
        title="Tema"
        description="Escolha como o app deve aparecer"
        size="md"
      >
        {activeDialog === 'theme' ? (
          <ThemeSettingsContent presentation="dialog" />
        ) : null}
      </SettingsDialog>

      <SettingsDialog
        open={activeDialog === 'preferences'}
        onOpenChange={(open) => handleOpenChange('preferences', open)}
        title="Preferências gerais"
        description="Ajuste moeda e datas do app"
        size="lg"
      >
        {activeDialog === 'preferences' ? (
          <GeneralPreferencesContent presentation="dialog" />
        ) : null}
      </SettingsDialog>
    </div>
  );
}
