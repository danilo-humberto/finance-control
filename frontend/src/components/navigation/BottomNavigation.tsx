import {
  CreditCard,
  FileText,
  Home,
  Plus,
  Settings,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

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
import { createCategory } from '@/services/categoriesService';
import { createCreditCard } from '@/services/creditCardsService';
import { type CreateCategoryPayload } from '@/types/category';
import { type CreateCreditCardPayload } from '@/types/credit-card';
import {
  QUICK_CREATE_CATEGORY_CREATED_EVENT,
  QUICK_CREATE_CREDIT_CARD_CREATED_EVENT,
} from '@/utils/quickCreateEvents';

const navigationItems = [
  { label: 'Início', to: '/', icon: Home },
  { label: 'Faturas', to: '/invoices', icon: FileText },
  { label: 'Cartões', to: '/credit-cards', icon: CreditCard },
  { label: 'Config.', to: '/settings', icon: Settings },
];

const defaultCardColor = '#22c55e';
const defaultCategoryColor = '#22c55e';
const defaultCategoryIcon = 'utensils';

const apiIconByFormIcon: Record<string, string> = {
  BookOpen: 'book-open',
  Car: 'car',
  DollarSign: 'dollar-sign',
  Gift: 'gift',
  GraduationCap: 'graduation-cap',
  Heart: 'heart',
  Home: 'home',
  Plane: 'plane',
  ShoppingBag: 'shopping-bag',
  Utensils: 'utensils',
  User: 'user',
};

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(' ');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

function parseMoneyValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  if (/^\d+(?:\.\d+)?$/.test(trimmedValue)) {
    return Number.parseFloat(trimmedValue);
  }

  const digits = trimmedValue.replace(/\D/g, '');

  return digits ? Number.parseInt(digits, 10) / 100 : 0;
}

function parseDay(value: string, label: string) {
  const day = Number.parseInt(value, 10);

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`${label} deve ser um número entre 1 e 31.`);
  }

  return day;
}

function buildCreditCardPayload(values: CardFormValues): CreateCreditCardPayload {
  const name = values.name.trim();

  if (name.length < 2) {
    throw new Error('Informe o nome do cartão.');
  }

  const limitAmount = parseMoneyValue(values.limit);

  if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
    throw new Error('Informe um limite válido para o cartão.');
  }

  return {
    name,
    limitAmount,
    closingDay: parseDay(values.closingDay, 'Data de fechamento'),
    dueDay: parseDay(values.dueDay, 'Data de vencimento'),
    color: values.color || defaultCardColor,
    isActive: true,
  };
}

function buildCategoryPayload(
  values: CategoryFormValues,
): CreateCategoryPayload {
  const name = values.name.trim();

  if (name.length < 2) {
    throw new Error('Informe o nome da categoria.');
  }

  return {
    name,
    icon: apiIconByFormIcon[values.icon] ?? (values.icon || defaultCategoryIcon),
    color: values.color || defaultCategoryColor,
    type: values.type === 'income' ? 'INCOME' : 'EXPENSE',
  };
}

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [cardSubmitError, setCardSubmitError] = useState<string | null>(null);
  const [categorySubmitError, setCategorySubmitError] = useState<string | null>(
    null,
  );
  const [submittingCard, setSubmittingCard] = useState(false);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const isNewPurchaseRoute = location.pathname === '/transactions/new';

  async function handleCardSubmit(values: CardFormValues) {
    setCardSubmitError(null);

    try {
      setSubmittingCard(true);
      await createCreditCard(buildCreditCardPayload(values));
      window.dispatchEvent(new Event(QUICK_CREATE_CREDIT_CARD_CREATED_EVENT));
      setCardSheetOpen(false);
      navigate('/credit-cards');
    } catch (error) {
      setCardSubmitError(getApiErrorMessage(error));
    } finally {
      setSubmittingCard(false);
    }
  }

  async function handleCategorySubmit(values: CategoryFormValues) {
    setCategorySubmitError(null);

    try {
      setSubmittingCategory(true);
      await createCategory(buildCategoryPayload(values));
      window.dispatchEvent(new Event(QUICK_CREATE_CATEGORY_CREATED_EVENT));
      setCategorySheetOpen(false);
      navigate('/categories');
    } catch (error) {
      setCategorySubmitError(getApiErrorMessage(error));
    } finally {
      setSubmittingCategory(false);
    }
  }

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 z-40 h-[64px] w-[calc(100%-1.75rem)] max-w-[364px] -translate-x-1/2 rounded-full border border-white/[0.18] bg-[#101216]/65 p-1.5 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),0_12px_36px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
      >
        <div className="grid h-full w-full grid-cols-5 items-center gap-1">
          {navigationItems.slice(0, 2).map((item) => (
            <BottomNavigationItem key={item.to} {...item} />
          ))}

          <div className="flex h-full items-center justify-center">
            <button
              type="button"
              onClick={() => setQuickCreateOpen(true)}
              aria-current={isNewPurchaseRoute ? 'page' : undefined}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-600 text-slate-950 shadow-[0_2px_14px_rgba(34,197,94,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label="Nova compra ou cadastro rápido"
            >
              <Plus aria-hidden="true" className="h-5 w-5 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>

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
        onOpenChange={(open) => {
          setCardSheetOpen(open);
          setCardSubmitError(null);
        }}
        mode="create"
        closeOnSubmit={false}
        submitting={submittingCard}
        submitError={cardSubmitError}
        onSubmit={handleCardSubmit}
      />

      <CategoryFormSheet
        open={categorySheetOpen}
        onOpenChange={(open) => {
          setCategorySheetOpen(open);
          setCategorySubmitError(null);
        }}
        mode="create"
        closeOnSubmit={false}
        submitting={submittingCategory}
        submitError={categorySubmitError}
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
          'group relative flex h-full flex-col items-center justify-center rounded-full px-1 py-1 transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          isActive
            ? 'bg-white/[0.14] text-brand-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]'
            : 'text-app-muted hover:bg-white/[0.06] hover:text-app-text active:scale-95',
        )
      }
    >
      <Icon aria-hidden="true" className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
      <span className="mt-1 max-w-full truncate text-[0.625rem] font-medium leading-none">{label}</span>
    </NavLink>
  );
}
