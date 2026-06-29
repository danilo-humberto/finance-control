import { AuthField } from '@/components/auth/AuthField';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';
import {
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type ProfileInfoRowProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'success';
};

type FeedbackMessage = {
  tone: 'error' | 'success' | 'info';
  message: string;
} | null;

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

function ProfileInfoRow({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: ProfileInfoRowProps) {
  const valueClass = tone === 'success' ? 'text-brand-400' : 'text-app-muted';

  return (
    <div className="flex items-center gap-2.5 border-b border-app-border/80 px-2.5 py-3 last:border-b-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[0.68rem] font-medium leading-4 text-app-muted">
          {label}
        </p>
        <p className={`mt-0.5 truncate text-[0.84rem] font-semibold leading-5 ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { changePassword, updateDisplayName, user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || 'E-mail não informado';
  const userPhotoUrl = user?.photoURL;
  const userInitials = getInitials(userName, 'U');
  const primaryProvider = user?.providerData[0];
  const providerLabel = getProviderLabel(primaryProvider?.providerId);
  const canChangePassword =
    user?.providerData.some((provider) => provider.providerId === 'password') ??
    false;
  const [name, setName] = useState(userName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<FeedbackMessage>(null);
  const [passwordMessage, setPasswordMessage] =
    useState<FeedbackMessage>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setName(userName);
  }, [userName]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage(null);

    const nextName = name.trim();

    if (nextName.length < 2) {
      setProfileMessage({
        tone: 'error',
        message: 'Informe um nome com pelo menos 2 caracteres.',
      });
      return;
    }

    if (nextName === userName) {
      setProfileMessage({
        tone: 'info',
        message: 'Nenhuma alteração de nome para salvar.',
      });
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateDisplayName(nextName);
      setProfileMessage({
        tone: 'success',
        message: 'Nome atualizado com sucesso.',
      });
    } catch (error) {
      setProfileMessage({
        tone: 'error',
        message: getFirebaseErrorMessage(error),
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);

    if (!canChangePassword) {
      setPasswordMessage({
        tone: 'info',
        message: 'A senha desta conta é gerenciada pelo provedor de login.',
      });
      return;
    }

    if (!currentPassword) {
      setPasswordMessage({
        tone: 'error',
        message: 'Informe sua senha atual.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        tone: 'error',
        message: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        tone: 'error',
        message: 'A confirmação precisa ser igual à nova senha.',
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({
        tone: 'error',
        message: 'A nova senha precisa ser diferente da senha atual.',
      });
      return;
    }

    try {
      setIsSavingPassword(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({
        tone: 'success',
        message: 'Senha atualizada com sucesso.',
      });
    } catch (error) {
      setPasswordMessage({
        tone: 'error',
        message: getFirebaseErrorMessage(error),
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

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
            label="Método de login"
            value={providerLabel}
            icon={BadgeCheck}
            tone="success"
          />
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="profile-edit-title">
        <h2
          id="profile-edit-title"
          className="text-[0.94rem] font-semibold leading-tight text-app-muted"
        >
          Editar perfil
        </h2>

        <form
          className="space-y-3 rounded-2xl border border-app-border bg-app-surface/75 p-3 shadow-lg shadow-black/15"
          onSubmit={handleProfileSubmit}
        >
          <Input
            label="Nome completo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome completo"
            leftIcon={<User aria-hidden="true" className="h-4 w-4" />}
            autoComplete="name"
          />

          {profileMessage ? (
            <AuthMessage tone={profileMessage.tone}>
              {profileMessage.message}
            </AuthMessage>
          ) : null}

          <Button
            type="submit"
            className="h-10 w-full rounded-xl"
            loading={isSavingProfile}
            leftIcon={<Save aria-hidden="true" className="h-4 w-4" />}
          >
            Salvar nome
          </Button>
        </form>
      </section>

      <section className="space-y-2" aria-labelledby="profile-password-title">
        <h2
          id="profile-password-title"
          className="text-[0.94rem] font-semibold leading-tight text-app-muted"
        >
          Senha
        </h2>

        {canChangePassword ? (
          <form
            className="space-y-3 rounded-2xl border border-app-border bg-app-surface/75 p-3 shadow-lg shadow-black/15"
            onSubmit={handlePasswordSubmit}
          >
            <AuthField
              label="Senha atual"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
              showPasswordToggle
              autoComplete="current-password"
            />

            <AuthField
              label="Nova senha"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              leftIcon={<KeyRound aria-hidden="true" className="h-4 w-4" />}
              showPasswordToggle
              autoComplete="new-password"
            />

            <AuthField
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              leftIcon={<KeyRound aria-hidden="true" className="h-4 w-4" />}
              showPasswordToggle
              autoComplete="new-password"
            />

            {passwordMessage ? (
              <AuthMessage tone={passwordMessage.tone}>
                {passwordMessage.message}
              </AuthMessage>
            ) : null}

            <Button
              type="submit"
              className="h-10 w-full rounded-xl"
              loading={isSavingPassword}
              leftIcon={<Save aria-hidden="true" className="h-4 w-4" />}
            >
              Atualizar senha
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border border-app-border bg-app-surface/75 p-3 shadow-lg shadow-black/15">
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
                <KeyRound aria-hidden="true" className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[0.86rem] font-semibold leading-5 text-app-text">
                  Senha gerenciada pelo provedor
                </p>
                <p className="mt-1 text-[0.72rem] leading-5 text-app-muted">
                  Essa conta usa {providerLabel}. Para trocar a senha, acesse as
                  configurações desse provedor de login.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
