import {
  CreditCard,
  Home,
  ReceiptText,
  Settings,
  Tags,
  WalletCards,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navigationItems = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Faturas', to: '/invoices', icon: ReceiptText },
  { label: 'Transacoes', to: '/transactions', icon: WalletCards },
  { label: 'Cartoes', to: '/credit-cards', icon: CreditCard },
  { label: 'Categorias', to: '/categories', icon: Tags },
  { label: 'Ajustes', to: '/settings', icon: Settings },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <nav
        aria-label="Navegacao principal"
        className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur"
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
                  [
                    'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.68rem] font-medium transition-colors',
                    isActive
                      ? 'bg-brand-900 text-brand-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
                  ].join(' ')
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
