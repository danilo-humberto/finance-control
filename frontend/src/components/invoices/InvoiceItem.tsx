import { Badge } from '@/components/ui/Badge';
import { type MockInvoiceItem } from '@/mocks/financeMocks';
import {
  ChevronRight,
  Clapperboard,
  DollarSign,
  Fuel,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

type InvoiceItemProps = {
  item: MockInvoiceItem;
};

const iconByName: Record<string, LucideIcon> = {
  Clapperboard,
  DollarSign,
  Fuel,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
};

const statusLabel: Record<MockInvoiceItem['status'], string> = {
  open: 'Aberta',
  paid: 'Paga',
  canceled: 'Cancelada',
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function InvoiceItem({ item }: InvoiceItemProps) {
  const Icon = iconByName[item.categoryIcon] ?? DollarSign;

  return (
    <button
      type="button"
      className="flex min-h-[4.15rem] w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-app-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-950/80 text-brand-400">
        <Icon aria-hidden="true" className="h-[1.12rem] w-[1.12rem]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.86rem] font-semibold leading-5 text-app-text">
          {item.description}
        </span>
        <span className="block truncate text-[0.72rem] leading-4 text-app-muted">
          {item.categoryName} {'\u2022'} {item.dateLabel}
        </span>
        <span className="mt-0.5 block truncate text-[0.72rem] font-medium leading-4 text-brand-400">
          {item.installmentLabel}
        </span>
      </span>

      <Badge
        variant="muted"
        className="hidden shrink-0 rounded-md border-white/5 bg-white/[0.07] px-1.5 py-0.5 text-[0.64rem] font-medium text-app-text min-[375px]:inline-flex"
      >
        {statusLabel[item.status]}
      </Badge>

      <span className="w-[4.25rem] shrink-0 text-right text-[0.82rem] font-semibold text-app-text">
        {moneyFormatter.format(item.amount)}
      </span>

      <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-app-muted" />
    </button>
  );
}
