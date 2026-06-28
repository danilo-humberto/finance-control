import { usePreferences } from '@/hooks/usePreferences';
import {
  BookOpen,
  CalendarDays,
  Car,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Plane,
  ShoppingBag,
  Tag,
  User,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';

export type PurchaseCardOption = {
  id: string;
  name: string;
  logo: string;
  color: string;
};

export type PurchaseCategoryOption = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

export type PurchaseInvoiceOption = {
  id: string;
  label: string;
  detail: string;
  month: number;
  year: number;
};

type PurchaseDetailsCardProps = {
  cards: PurchaseCardOption[];
  categories: PurchaseCategoryOption[];
  invoices: PurchaseInvoiceOption[];
  selectedCardId: string;
  selectedCategoryId: string;
  selectedInvoiceId: string;
  loadingCards: boolean;
  loadingCategories: boolean;
  errorCards: string | null;
  errorCategories: string | null;
  onCardChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onInvoiceChange: (value: string) => void;
};

type SelectOption = {
  id: string;
  label: string;
  detail?: string;
};

const defaultColor = '#22c55e';

const iconByName: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  bookopen: BookOpen,
  car: Car,
  'dollar-sign': CircleDollarSign,
  dollarsign: CircleDollarSign,
  gift: Gift,
  'graduation-cap': GraduationCap,
  graduationcap: GraduationCap,
  heart: Heart,
  home: Home,
  plane: Plane,
  'shopping-bag': ShoppingBag,
  shoppingbag: ShoppingBag,
  tag: Tag,
  user: User,
  utensils: Utensils,
};

export function PurchaseDetailsCard({
  cards,
  categories,
  invoices,
  selectedCardId,
  selectedCategoryId,
  selectedInvoiceId,
  loadingCards,
  loadingCategories,
  errorCards,
  errorCategories,
  onCardChange,
  onCategoryChange,
  onInvoiceChange,
}: PurchaseDetailsCardProps) {
  const { formatDateLabel } = usePreferences();
  const selectedCard = cards.find((card) => card.id === selectedCardId);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const selectedInvoice = invoices.find(
    (invoice) => invoice.id === selectedInvoiceId,
  );
  const CategoryIcon = getCategoryIcon(selectedCategory?.icon);

  return (
    <section className="space-y-2" aria-labelledby="purchase-details-title">
      <h2
        id="purchase-details-title"
        className="text-[0.94rem] font-semibold leading-tight"
      >
        Detalhes
      </h2>

      <div className="space-y-2.5 rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15">
        <PurchaseSelectRow
          label="Cartão"
          value={selectedCardId}
          placeholder={loadingCards ? 'Carregando cartões...' : 'Selecione um cartão'}
          options={cards.map((card) => ({
            id: card.id,
            label: card.name,
          }))}
          leading={
            selectedCard ? (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: selectedCard.color }}
                aria-hidden="true"
              >
                {selectedCard.logo}
              </span>
            ) : (
              <CreditCard aria-hidden="true" className="h-4 w-4 text-brand-400" />
            )
          }
          helper={
            errorCards ||
            (!loadingCards && cards.length === 0
              ? 'Cadastre um cartão antes de registrar uma compra no crédito.'
              : null)
          }
          disabled={loadingCards || cards.length === 0}
          onChange={onCardChange}
        />

        <PurchaseSelectRow
          label="Categoria"
          value={selectedCategoryId}
          placeholder={
            loadingCategories
              ? 'Carregando categorias...'
              : 'Selecione uma categoria'
          }
          options={categories.map((category) => ({
            id: category.id,
            label: category.name,
          }))}
          leading={
            <CategoryIcon
              aria-hidden="true"
              className="h-4 w-4"
              style={{ color: selectedCategory?.color || defaultColor }}
            />
          }
          helper={
            errorCategories ||
            (!loadingCategories && categories.length === 0
              ? 'Cadastre uma categoria antes de registrar uma compra.'
              : null)
          }
          disabled={loadingCategories || categories.length === 0}
          onChange={onCategoryChange}
        />

        <PurchaseSelectRow
          label="Fatura"
          value={selectedInvoiceId}
          placeholder="Selecione a fatura"
          options={invoices.map((invoice) => ({
            id: invoice.id,
            label: invoice.label,
            detail: formatDateLabel(invoice.detail),
          }))}
          leading={<CalendarDays aria-hidden="true" className="h-4 w-4 text-brand-400" />}
          selectedDetail={
            selectedInvoice ? formatDateLabel(selectedInvoice.detail) : undefined
          }
          disabled={invoices.length === 0}
          onChange={onInvoiceChange}
        />
      </div>
    </section>
  );
}

type PurchaseSelectRowProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  leading: ReactNode;
  helper?: string | null;
  selectedDetail?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function PurchaseSelectRow({
  label,
  value,
  placeholder,
  options,
  leading,
  helper,
  selectedDetail,
  disabled = false,
  onChange,
}: PurchaseSelectRowProps) {
  const selectedOption = options.find((option) => option.id === value);
  const detail = selectedDetail ?? selectedOption?.detail;

  return (
    <div className="space-y-1.5">
      <p className="text-[0.72rem] font-medium leading-none text-app-muted">
        {label}
      </p>
      <label className="relative flex h-10 w-full items-center gap-2.5 rounded-xl border border-app-border bg-app-bg/35 px-3 text-left transition-colors hover:bg-app-elevated focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          {leading}
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.8rem] font-semibold text-app-text">
          {selectedOption?.label ?? placeholder}
          {detail ? (
            <span className="ml-1 font-medium text-app-muted">({detail})</span>
          ) : null}
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-app-muted" />
        <select
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
              {option.detail ? ` (${option.detail})` : ''}
            </option>
          ))}
        </select>
      </label>
      {helper ? (
        <p className="px-0.5 text-[0.68rem] leading-4 text-app-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function normalizeIconName(icon?: string | null) {
  if (!icon) {
    return '';
  }

  return icon
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .trim();
}

function getCategoryIcon(icon?: string | null) {
  return iconByName[normalizeIconName(icon)] ?? CircleDollarSign;
}
