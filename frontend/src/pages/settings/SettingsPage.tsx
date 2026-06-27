import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { mockUser } from '@/mocks/financeMocks';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  Bell,
  ChevronRight,
  CloudUpload,
  LogOut,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName = user?.displayName || mockUser.name;
  const userEmail = user?.email || mockUser.email;
  const userInitials = getInitials(userName, mockUser.initials);
  const themeLabel = theme === 'dark' ? 'Escuro' : 'Claro';

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="space-y-1">
        <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
          Configurações
        </h1>
        <p className="text-[0.8rem] leading-5 text-app-muted">
          Personalize sua experiência
        </p>
      </header>

      <ProfileCard
        name={userName}
        email={userEmail}
        initials={userInitials}
        onClick={() => console.log('Abrir perfil')}
      />

      <SettingsSection title="Conta">
        <SettingsItem
          title="Perfil"
          description="Dados pessoais e informações da conta"
          icon={User}
          onClick={() => console.log('Abrir perfil')}
        />
        <SettingsItem
          title="Segurança"
          description="Senha, autenticação e proteção"
          icon={ShieldCheck}
          onClick={() => console.log('Abrir segurança')}
        />
        <SettingsItem
          title="Notificações"
          description="Alertas de fatura e movimentações"
          icon={Bell}
          onClick={() => console.log('Abrir notificações')}
        />
        <SettingsItem
          title="Backup e sincronização"
          description="Dados salvos e sincronizados"
          icon={CloudUpload}
          onClick={() => console.log('Abrir backup')}
        />
      </SettingsSection>

      <SettingsSection title="Preferências">
        <SettingsItem
          title="Tema"
          description="Escolha entre claro, escuro ou automático"
          icon={Moon}
          badge={themeLabel}
          onClick={toggleTheme}
        />
        <SettingsItem
          title="Preferências gerais"
          description="Moeda, linguagem e outras opções"
          icon={SlidersHorizontal}
          onClick={() => console.log('Abrir preferências gerais')}
        />
      </SettingsSection>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-950/15 px-4 text-[0.9rem] font-semibold text-red-300 shadow-lg shadow-black/15 transition-colors hover:bg-red-950/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut aria-hidden="true" className="h-5 w-5" />
        <span>{isLoggingOut ? 'Saindo...' : 'Sair da conta'}</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4 opacity-0" />
      </button>
    </div>
  );
}
