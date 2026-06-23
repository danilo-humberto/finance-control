import { LogOut, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export function AppLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const showAppHeader = location.pathname !== '/';

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
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-[calc(116px+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8">
        {showAppHeader ? (
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
        ) : null}

        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}
