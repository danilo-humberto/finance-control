import {
  CreditCard,
  FileText,
  Home,
  LogOut,
  Moon,
  Settings,
  Sun,
  Tag,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { Button } from '../components/ui/Button';
import { NewPurchaseDialogProvider } from '../contexts/NewPurchaseDialogContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

type DesktopNavigationItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
};

const desktopNavigationItems: DesktopNavigationItem[] = [
  { label: 'Início', to: '/', icon: Home, end: true },
  { label: 'Faturas', to: '/invoices', icon: FileText },
  { label: 'Movimentações', to: '/transactions', icon: Wallet },
  { label: 'Cartões', to: '/credit-cards', icon: CreditCard },
  { label: 'Categorias', to: '/categories', icon: Tag },
  { label: 'Configurações', to: '/settings', icon: Settings },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hideAppHeaderRoutes = [
    '/',
    '/invoices',
    '/transactions',
    '/transactions/new',
    '/credit-cards',
    '/categories',
    '/recurring',
    '/settings',
  ];
  const isTransactionEditRoute = /^\/transactions\/[^/]+\/edit$/.test(
    location.pathname,
  );
  const showAppHeader =
    !hideAppHeaderRoutes.includes(location.pathname) &&
    !isTransactionEditRoute &&
    !location.pathname.startsWith('/settings/');

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <NewPurchaseDialogProvider>
      <div className="min-h-screen bg-app-bg text-app-text">
        <DesktopSidebar
          userLabel={user?.displayName || user?.email || 'Usuário logado'}
          resolvedTheme={resolvedTheme}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />

        <div className="min-h-screen lg:pl-72">
          <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-[calc(100px+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:max-w-7xl lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
            {showAppHeader ? (
              <header className="mb-8 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-brand-400">
                    Finance Control
                  </p>
                  <p className="truncate text-sm text-app-muted">
                    {user?.displayName || user?.email || 'Usuário logado'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={toggleTheme}
                    aria-label={
                      resolvedTheme === 'dark'
                        ? 'Alternar para tema claro'
                        : 'Alternar para tema escuro'
                    }
                  >
                    {resolvedTheme === 'dark' ? (
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
        </div>

        <BottomNavigation />
      </div>
    </NewPurchaseDialogProvider>
  );
}

type DesktopSidebarProps = {
  userLabel: string;
  resolvedTheme: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  onToggleTheme: () => void;
};

function DesktopSidebar({
  userLabel,
  resolvedTheme,
  isLoggingOut,
  onLogout,
  onToggleTheme,
}: DesktopSidebarProps) {
  const ThemeIcon = resolvedTheme === 'dark' ? Sun : Moon;
  const themeLabel = resolvedTheme === 'dark' ? 'Tema claro' : 'Tema escuro';

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-app-border bg-app-surface/95 px-4 py-5 shadow-2xl shadow-black/20 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <img
          src="/icons/icon-96x96.png"
          alt=""
          aria-hidden="true"
          className="h-10 w-10 shrink-0 rounded-xl"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-app-text">
            Finance Control
          </p>
          <p className="truncate text-xs text-app-muted">{userLabel}</p>
        </div>
      </div>

      <nav
        aria-label="Navegação principal desktop"
        className="mt-8 flex flex-1 flex-col gap-1.5"
      >
        {desktopNavigationItems.map((item) => (
          <DesktopSidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="space-y-2 border-t border-app-border pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-lg px-3"
          onClick={onToggleTheme}
          leftIcon={<ThemeIcon aria-hidden="true" className="h-4 w-4" />}
        >
          {themeLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-lg px-3 text-danger-text hover:bg-danger-surface/70 hover:text-danger-text"
          onClick={onLogout}
          loading={isLoggingOut}
          leftIcon={<LogOut aria-hidden="true" className="h-4 w-4" />}
        >
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </Button>
      </div>
    </aside>
  );
}

type DesktopSidebarLinkProps = {
  item: DesktopNavigationItem;
};

function DesktopSidebarLink({ item }: DesktopSidebarLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          isActive
            ? 'bg-brand-500/15 text-brand-400'
            : 'text-app-muted hover:bg-app-elevated hover:text-app-text',
        )
      }
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}
