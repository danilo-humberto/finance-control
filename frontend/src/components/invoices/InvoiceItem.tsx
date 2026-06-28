import { Badge } from '@/components/ui/Badge';
import { usePreferences } from '@/hooks/usePreferences';
import { type InstallmentStatus, type InvoiceInstallment } from '@/types/invoice';
import {
  BookOpen,
  Car,
  ChevronRight,
  Clapperboard,
  CircleDollarSign,
  Fuel,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Plane,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  User,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

type InvoiceItemProps = {
  item: InvoiceInstallment;
  onActionClick: (item: InvoiceInstallment) => void;
};

const defaultColor = '#22c55e';

const iconByName: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  bookopen: BookOpen,
  car: Car,
  clapperboard: Clapperboard,
  'dollar-sign': CircleDollarSign,
  dollarsign: CircleDollarSign,
  fuel: Fuel,
  gift: Gift,
  'graduation-cap': GraduationCap,
  graduationcap: GraduationCap,
  heart: Heart,
  home: Home,
  plane: Plane,
  shirt: Shirt,
  'shopping-bag': ShoppingBag,
  shoppingbag: ShoppingBag,
  shoppingcart: ShoppingCart,
  'shopping-cart': ShoppingCart,
  tag: Tag,
  user: User,
  utensils: Utensils,
};

const statusLabel: Record<InstallmentStatus, string> = {
  OPEN: 'Aberta',
  PAID: 'Paga',
  CANCELED: 'Cancelada',
};

export function InvoiceItem({ item, onActionClick }: InvoiceItemProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const Icon = getCategoryIcon(item.category.icon);
  const installmentLabel =
    item.totalInstallments > 1
      ? `Parcela ${item.installmentNumber}/${item.totalInstallments}`
      : 'À vista';

  return (
    <button
      type="button"
      onClick={() => onActionClick(item)}
      className="flex min-h-[3.8rem] w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-app-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-950/80 text-brand-400"
        style={{ color: item.category.color || defaultColor }}
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] font-semibold leading-4 text-app-text">
          {item.description}
        </span>
        <span className="block truncate text-[0.68rem] leading-4 text-app-muted">
          {item.category.name} {'\u2022'}{' '}
          {formatDateLabel(formatIsoDateToBr(item.transaction.purchaseDate))}
        </span>
        <span className="mt-0.5 block truncate text-[0.68rem] font-medium leading-4 text-brand-400">
          {installmentLabel}
        </span>
      </span>

      <Badge
        variant="muted"
        className="hidden shrink-0 rounded-md border-white/5 bg-white/[0.07] px-1.5 py-0.5 text-[0.6rem] font-medium text-app-text min-[375px]:inline-flex"
      >
        {statusLabel[item.status]}
      </Badge>

      <span className="w-[3.95rem] shrink-0 text-right text-[0.76rem] font-semibold text-app-text">
        {formatCurrency(item.amount)}
      </span>

      <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-app-muted" />
    </button>
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

function formatIsoDateToBr(value: string) {
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
