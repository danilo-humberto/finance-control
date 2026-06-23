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

const navigationItems = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Faturas', to: '/invoices', icon: FileText },
  { label: 'Cartoes', to: '/credit-cards', icon: CreditCard },
  { label: 'Config.', to: '/settings', icon: Settings },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  function handleCardSubmit(values: CardFormValues) {
    console.log('Card form submit', values);
  }

  function handleCategorySubmit(values: CategoryFormValues) {
    console.log('Category form submit', values);
  }

  return (
    <>
      <nav
        aria-label="Navegacao principal"
        className="fixed inset-x-0 bottom-0 z-40 h-[calc(86px+env(safe-area-inset-bottom))] w-full rounded-t-[26px] border-t border-white/10 bg-app-bg pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(0,0,0,0.38)] md:hidden"
      >
        <div className="relative mx-auto grid h-[86px] max-w-md grid-cols-5 items-end px-3.5 pb-2.5 pt-6">
          {navigationItems.slice(0, 2).map((item) => (
            <BottomNavigationItem key={item.to} {...item} />
          ))}

          <button
            type="button"
            onClick={() => setQuickCreateOpen(true)}
            className="relative flex min-h-[3.45rem] flex-col items-center justify-end gap-0.5 rounded-xl text-[0.64rem] font-medium text-app-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            aria-label="Adicionar"
          >
            <span className="absolute -top-[40px] left-1/2 flex h-[68px] w-[68px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_26px_rgba(49,214,103,0.52)] transition-transform hover:scale-105">
              <Plus aria-hidden="true" className="h-8 w-8" />
            </span>
            <span>Nova</span>
          </button>

          {navigationItems.slice(2).map((item) => (
            <BottomNavigationItem key={item.to} {...item} />
          ))}
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
          'relative flex min-h-[3.45rem] flex-col items-center justify-end gap-0.5 px-1 text-[0.64rem] font-medium transition-colors',
          'after:absolute after:top-0 after:h-0.5 after:w-7 after:rounded-full after:bg-transparent',
          isActive
            ? 'text-brand-400 after:bg-brand-500'
            : 'text-app-muted hover:text-app-text',
        )
      }
    >
      <Icon aria-hidden="true" className="h-[1.12rem] w-[1.12rem]" />
      <span className="max-w-full truncate">{label}</span>
    </NavLink>
  );
}
