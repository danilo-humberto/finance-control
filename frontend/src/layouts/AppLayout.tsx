import {
  CreditCard,
  Home,
  LogOut,
  Moon,
  ReceiptText,
  Settings,
  Sun,
  Tags,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

const navigationItems = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Faturas', to: '/invoices', icon: ReceiptText },
  { label: 'Transacoes', to: '/transactions', icon: WalletCards },
  { label: 'Cartoes', to: '/credit-cards', icon: CreditCard },
  { label: 'Categorias', to: '/categories', icon: Tags },
  { label: 'Ajustes', to: '/settings', icon: Settings },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-brand-400">
              Finance Control
            </p>
            <p className="truncate text-sm text-app-muted">
              {user?.displayName || user?.email || 'Usuario logado'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Alternar para tema claro'
                  : 'Alternar para tema escuro'
              }
            >
              {theme === 'dark' ? (
                <Sun aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Moon aria-hidden="true" className="h-4 w-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              loading={isLoggingOut}
              leftIcon={<LogOut aria-hidden="true" className="h-4 w-4" />}
            >
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </header>

        <Outlet />
      </main>

      <nav
        aria-label="Navegacao principal"
        className="fixed inset-x-0 bottom-0 border-t border-app-border bg-app-bg/95 px-2 py-2 backdrop-blur"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-6 gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.68rem] font-medium transition-colors',
                    isActive
                      ? 'bg-brand-900/40 text-brand-400'
                      : 'text-app-muted hover:bg-app-surface hover:text-app-text',
                  )
                }
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
