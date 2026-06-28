import { mockUser } from '@/mocks/financeMocks';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  IdCard,
  Image,
  Mail,
  ShieldCheck,
  User,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProfileInfoRowProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning';
};

function getInitials(name: string, fallback: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || fallback;
}

function getProviderLabel(providerId?: string) {
  if (providerId === 'google.com') {
    return 'Google';
  }

  if (providerId === 'password') {
    return 'E-mail e senha';
  }

  return providerId || 'Firebase Auth';
}

function formatUid(uid?: string) {
  if (!uid) {
    return 'Não disponível';
  }

  if (uid.length <= 12) {
    return uid;
  }

  return `${uid.slice(0, 6)}...${uid.slice(-6)}`;
}

function ProfileInfoRow({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: ProfileInfoRowProps) {
  const toneClass =
    tone === 'success'
      ? 'text-brand-400'
      : tone === 'warning'
        ? 'text-warning-text'
        : 'text-app-muted';

  return (
    <div className="flex items-center gap-2.5 border-b border-app-border/80 px-2.5 py-3 last:border-b-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[0.68rem] font-medium leading-4 text-app-muted">
          {label}
        </p>
        <p className={`mt-0.5 truncate text-[0.84rem] font-semibold leading-5 ${toneClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.displayName || mockUser.name;
  const userEmail = user?.email || mockUser.email;
  const userPhotoUrl = user?.photoURL;
  const userInitials = getInitials(userName, mockUser.initials);
  const primaryProvider = user?.providerData[0];
  const providerLabel = getProviderLabel(primaryProvider?.providerId);
  const isEmailVerified = Boolean(user?.emailVerified);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Voltar para configurações"
          onClick={() => navigate('/settings')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text shadow-lg shadow-black/15 transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Perfil
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Dados pessoais e informações da conta
          </p>
        </div>
      </header>

      <section
        className="rounded-2xl border border-app-border bg-app-surface/75 p-3 text-center shadow-lg shadow-black/15"
        aria-label="Resumo do perfil"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-[1.45rem] font-bold text-brand-400">
          {userPhotoUrl ? (
            <img
              src={userPhotoUrl}
              alt=""
              className="h-full w-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            userInitials
          )}
        </div>

        <h2 className="mt-3 truncate text-[1rem] font-semibold leading-5 text-app-text">
          {userName}
        </h2>
        <p className="mt-1 truncate text-[0.74rem] leading-4 text-app-muted">
          {userEmail}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-[0.68rem] font-semibold text-brand-400">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
          {providerLabel}
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="profile-data-title">
        <h2
          id="profile-data-title"
          className="text-[0.94rem] font-semibold leading-tight text-app-muted"
        >
          Dados da conta
        </h2>

        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
          <ProfileInfoRow label="Nome" value={userName} icon={User} />
          <ProfileInfoRow label="E-mail" value={userEmail} icon={Mail} />
          <ProfileInfoRow
            label="Foto de perfil"
            value={userPhotoUrl ? 'Imagem carregada da conta' : 'Usando iniciais'}
            icon={Image}
          />
          <ProfileInfoRow
            label="ID da conta"
            value={formatUid(user?.uid)}
            icon={IdCard}
          />
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="profile-access-title">
        <h2
          id="profile-access-title"
          className="text-[0.94rem] font-semibold leading-tight text-app-muted"
        >
          Acesso
        </h2>

        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
          <ProfileInfoRow
            label="Método de login"
            value={providerLabel}
            icon={BadgeCheck}
            tone="success"
          />
          <ProfileInfoRow
            label="E-mail verificado"
            value={isEmailVerified ? 'Verificado' : 'Pendente'}
            icon={isEmailVerified ? CheckCircle2 : XCircle}
            tone={isEmailVerified ? 'success' : 'warning'}
          />
        </div>
      </section>

      <p className="rounded-2xl border border-brand-800/65 bg-brand-950/25 p-3 text-[0.72rem] leading-5 text-app-muted shadow-lg shadow-black/15">
        Dados vindos do Google são gerenciados pela própria conta Google. Quando
        você entrar novamente, nome e foto podem ser sincronizados pelo Firebase.
      </p>
    </div>
  );
}
