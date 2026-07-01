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

    if (error.response?.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.';
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
