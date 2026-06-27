import {
  CreditCard,
  FileText,
  Home,
  Plus,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  CardFormSheet,
  type CardFormValues,
} from '@/components/sheets/CardFormSheet';
import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '@/components/sheets/CategoryFormSheet';
import { QuickCreateSheet } from '@/components/sheets/QuickCreateSheet';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const navigationItems = [
  { label: 'Início', to: '/', icon: Home },
  { label: 'Faturas', to: '/invoices', icon: FileText },
  { label: 'Cartões', to: '/credit-cards', icon: CreditCard },
  { label: 'Config.', to: '/settings', icon: Settings },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const isNewPurchaseRoute = location.pathname === '/transactions/new';

  function handleCardSubmit(values: CardFormValues) {
    console.log('Card form submit', values);
  }

  function handleCategorySubmit(values: CategoryFormValues) {
    console.log('Category form submit', values);
  }

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 h-[calc(78px+env(safe-area-inset-bottom))] w-full overflow-visible rounded-t-[18px] border-t border-white/[0.06] bg-[#101113] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_26px_rgba(0,0,0,0.42)] md:hidden"
      >
        <div className="relative mx-auto grid h-[78px] max-w-md grid-cols-5 items-start px-3.5 pt-7">
          {navigationItems.slice(0, 2).map((item) => (
            <BottomNavigationItem key={item.to} {...item} />
          ))}

          <button
            type="button"
            onClick={() => setQuickCreateOpen(true)}
            aria-current={isNewPurchaseRoute ? 'page' : undefined}
            className={cn(
              'relative flex h-10 flex-col items-center justify-end rounded-xl px-1 text-[0.58rem] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
              isNewPurchaseRoute
                ? 'text-brand-400'
                : 'text-app-muted hover:text-app-text',
            )}
            aria-label="Adicionar"
          >
            <span className="absolute -top-[30px] left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105">
              <Plus aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>Nova</span>
          </button>

          {navigationItems.slice(2).map((item) => (
            <BottomNavigationItem key={item.to} {...item} />
          ))}

          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/90 bottom-[calc(env(safe-area-inset-bottom)+0.375rem)]"
          />
        </div>
      </nav>

      <QuickCreateSheet
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onNewPurchase={() => navigate('/transactions/new')}
        onAddCard={() => setCardSheetOpen(true)}
        onAddCategory={() => setCategorySheetOpen(true)}
      />

      <CardFormSheet
        open={cardSheetOpen}
        onOpenChange={setCardSheetOpen}
        mode="create"
        onSubmit={handleCardSubmit}
      />

      <CategoryFormSheet
        open={categorySheetOpen}
        onOpenChange={setCategorySheetOpen}
        mode="create"
        onSubmit={handleCategorySubmit}
      />
    </>
  );
}

type BottomNavigationItemProps = {
  label: string;
  to: string;
  icon: typeof Home;
};

function BottomNavigationItem({ label, to, icon: Icon }: BottomNavigationItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'relative flex h-10 flex-col items-center justify-start gap-1 rounded-xl px-1 pt-1 text-[0.58rem] font-medium leading-none transition-colors',
          'after:absolute after:-top-1 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-transparent',
          isActive
            ? 'text-brand-400 after:bg-brand-500'
            : 'text-app-muted hover:text-app-text',
        )
      }
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span className="max-w-full truncate">{label}</span>
    </NavLink>
  );
}
