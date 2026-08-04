import {
  CalendarDays,
  CreditCard,
  Edit3,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  Wallet,
  WalletCards,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';

import {
  defaultCardColor,
  type CreditCardPageItem,
  type CreditCardsPageData,
} from './useCreditCardsPageData';

type CreditCardsDesktopViewProps = CreditCardsPageData;

type RgbColor = {
  blue: number;
  green: number;
  red: number;
};

type CardVisualStyle = {
  background: string;
  chipBackground: string;
  mutedTextColor: string;
  overlayColor: string;
  textColor: string;
};

type SummaryCardProps = {
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  title: string;
  value: string;
};

const maxPercent = 100;
const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function clampPercentage(value: number) {
  return Math.min(Math.max(Math.round(value), 0), maxPercent);
}

function formatPercentage(value: number) {
  return `${percentageFormatter.format(value)}%`;
}

function normalizeHexColor(color: string | undefined) {
  const normalizedColor = (color || defaultCardColor).trim().replace('#', '');
  const hex =
    normalizedColor.length === 3
      ? normalizedColor
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalizedColor;

  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : defaultCardColor;
}

function hexToRgb(color: string): RgbColor {
  const hex = normalizeHexColor(color).replace('#', '');

  return {
    red: parseInt(hex.slice(0, 2), 16),
    green: parseInt(hex.slice(2, 4), 16),
    blue: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex({ blue, green, red }: RgbColor) {
  return `#${[red, green, blue]
    .map((channel) =>
      Math.round(channel).toString(16).padStart(2, '0'),
    )
    .join('')}`;
}

function mixRgbColor(source: RgbColor, target: RgbColor, amount: number) {
  return {
    red: source.red + (target.red - source.red) * amount,
    green: source.green + (target.green - source.green) * amount,
    blue: source.blue + (target.blue - source.blue) * amount,
  };
}

function getRelativeLuminance({ blue, green, red }: RgbColor) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalizedChannel = channel / 255;

    return normalizedChannel <= 0.03928
      ? normalizedChannel / 12.92
      : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getCardVisualStyle(color: string): CardVisualStyle {
  const baseColor = normalizeHexColor(color);
  const baseRgb = hexToRgb(baseColor);
  const slateTarget = { red: 2, green: 6, blue: 23 };
  const deepTarget = { red: 15, green: 23, blue: 42 };
  const darkerColor = rgbToHex(mixRgbColor(baseRgb, slateTarget, 0.45));
  const deepestColor = rgbToHex(mixRgbColor(baseRgb, slateTarget, 0.68));
  const isLight = getRelativeLuminance(baseRgb) > 0.48;

  return {
    background: `linear-gradient(135deg, ${baseColor} 0%, ${darkerColor} 58%, ${deepestColor} 100%)`,
    chipBackground: isLight
      ? 'rgba(15, 23, 42, 0.18)'
      : 'rgba(248, 250, 252, 0.24)',
    mutedTextColor: isLight
      ? 'rgba(15, 23, 42, 0.72)'
      : 'rgba(248, 250, 252, 0.76)',
    overlayColor: rgbToHex(mixRgbColor(baseRgb, deepTarget, 0.2)),
    textColor: isLight ? '#0f172a' : '#f8fafc',
  };
}

export function CreditCardsDesktopView({
  cardItems,
  feedbackMessage,
  loadError,
  loading,
  onCreateClick,
  onDeleteCard,
  onEditCard,
  onRetryLoad,
  onSelectCard,
  onViewInvoice,
  selectedCardItem,
  summary,
}: CreditCardsDesktopViewProps) {
  const { formatCurrency } = usePreferences();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-bold leading-tight text-app-text">
            Cartões
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Gerencie seus cartões de crédito
          </p>
        </div>

        <Button
          type="button"
          onClick={onCreateClick}
          leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
          className="h-11 self-start rounded-xl px-4 xl:self-auto"
        >
          Novo cartão
        </Button>
      </header>

      {feedbackMessage ? (
        <AuthMessage tone={feedbackMessage.tone}>
          {feedbackMessage.message}
        </AuthMessage>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Limite total"
          value={formatCurrency(summary.totalLimit)}
          description="Somatório de todos os cartões"
          icon={CreditCard}
          loading={loading}
        />
        <SummaryCard
          title="Limite utilizado"
          value={formatCurrency(summary.usedLimit)}
          description={`${formatPercentage(summary.usedPercentage)} do limite total`}
          icon={WalletCards}
          loading={loading}
        />
        <SummaryCard
          title="Limite disponível"
          value={formatCurrency(summary.availableLimit)}
          description={`${formatPercentage(100 - summary.usedPercentage)} do limite total`}
          icon={Wallet}
          loading={loading}
        />
        <SummaryCard
          title="Fatura aberta"
          value={formatCurrency(summary.openInvoiceTotal)}
          description={`Em ${summary.openCardsCount} cartão${
            summary.openCardsCount === 1 ? '' : 's'
          }`}
          icon={FileText}
          loading={loading}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section
          className="space-y-4"
          aria-labelledby="credit-cards-desktop-title"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="credit-cards-desktop-title"
              className="text-base font-semibold text-app-text"
            >
              Meus cartões
            </h2>
            <span className="rounded-full border border-app-border bg-app-surface/75 px-3 py-1 text-xs font-semibold text-app-muted">
              {cardItems.length} cadastrado{cardItems.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <CardsDesktopLoadingState />
          ) : loadError ? (
            <EmptyState
              icon={
                <LoaderCircle
                  aria-hidden="true"
                  className="h-5 w-5 text-brand-400"
                />
              }
              title="Não foi possível carregar os cartões"
              description={loadError}
              action={
                <Button type="button" onClick={onRetryLoad}>
                  Tentar novamente
                </Button>
              }
            />
          ) : cardItems.length === 0 ? (
            <EmptyState
              icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
              title="Nenhum cartão cadastrado"
              description="Cadastre seu primeiro cartão para acompanhar limites, faturas e vencimentos."
              action={
                <Button
                  type="button"
                  leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
                  onClick={onCreateClick}
                >
                  Novo cartão
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {cardItems.map((cardItem) => (
                <DesktopCardItem
                  key={cardItem.id}
                  card={cardItem}
                  selected={selectedCardItem?.id === cardItem.id}
                  onSelect={() => onSelectCard(cardItem.source)}
                />
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <CardDetailsPanelSkeleton />
        ) : (
          <CardDetailsPanel
            card={selectedCardItem}
            onCreateClick={onCreateClick}
            onDeleteCard={onDeleteCard}
            onEditCard={onEditCard}
            onViewInvoice={onViewInvoice}
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  description,
  icon: Icon,
  loading = false,
  title,
  value,
}: SummaryCardProps) {
  return (
    <article className="min-h-[8rem] rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-icon text-brand-400">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-app-text">{title}</p>
          {loading ? (
            <div className="mt-4 h-7 w-32 animate-pulse rounded-full bg-app-elevated" />
          ) : (
            <strong className="mt-4 block truncate text-2xl font-bold leading-none text-app-text">
              {value}
            </strong>
          )}
          <p className="mt-3 text-xs leading-5 text-app-muted">{description}</p>
        </div>
      </div>
    </article>
  );
}

function CardsDesktopLoadingState() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <article
          key={item}
          className="rounded-2xl border border-app-border bg-app-surface/75 p-3 shadow-lg shadow-black/15"
        >
          <div className="aspect-[1.72] animate-pulse rounded-xl bg-app-elevated" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((column) => (
              <div key={column} className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-full bg-app-elevated" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-app-elevated" />
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 animate-pulse rounded-full bg-app-elevated" />
        </article>
      ))}
    </div>
  );
}

type DesktopCardItemProps = {
  card: CreditCardPageItem;
  onSelect: () => void;
  selected: boolean;
};

function DesktopCardItem({ card, onSelect, selected }: DesktopCardItemProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();
  const progress = clampPercentage(card.usedPercentage);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'rounded-2xl border border-app-border bg-app-surface/75 p-4 text-left shadow-lg shadow-black/15 transition-colors hover:border-brand-700/70 hover:bg-app-elevated/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        selected && 'border-brand-500 bg-app-elevated/35',
      )}
    >
      <GenericCreditCardVisual card={card} />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            card.isActive
              ? 'bg-success-surface text-success-text'
              : 'bg-app-elevated text-app-muted',
          )}
        >
          {card.isActive ? 'Ativo' : 'Inativo'}
        </span>
        <span className="truncate text-xs text-app-muted">
          Vencimento {formatDateLabel(card.dueDateLabel)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Metric label="Limite" value={formatCurrency(card.limit)} />
        <Metric label="Utilizado" value={formatCurrency(card.used)} />
        <Metric label="Fatura atual" value={formatCurrency(card.currentInvoiceTotal)} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-app-elevated"
          role="progressbar"
          aria-label={`Uso do limite do cartão ${card.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-12 text-right text-xs font-semibold text-brand-400">
          {progress}%
        </span>
      </div>
    </button>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs leading-4 text-app-muted">{label}</p>
      <p className="truncate text-sm font-semibold leading-5 text-app-text">
        {value}
      </p>
    </div>
  );
}

type GenericCreditCardVisualProps = {
  card: CreditCardPageItem;
  large?: boolean;
};

function GenericCreditCardVisual({
  card,
  large = false,
}: GenericCreditCardVisualProps) {
  const visualStyle = getCardVisualStyle(card.color);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5 shadow-lg shadow-black/20',
        large ? 'aspect-[1.72]' : 'aspect-[1.72]',
      )}
      style={{
        background: visualStyle.background,
        color: visualStyle.textColor,
      }}
      aria-label={`Cartão ${card.name}`}
    >
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-16 h-36 w-36 rounded-full opacity-25 blur-2xl"
        style={{ backgroundColor: visualStyle.overlayColor }}
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl font-bold leading-tight">{card.name}</p>
          <p
            className="mt-1 text-xs font-medium"
            style={{ color: visualStyle.mutedTextColor }}
          >
            Crédito
          </p>
        </div>
        <span
          className="rounded-full px-2 py-1 text-xs font-semibold"
          style={{
            backgroundColor: visualStyle.chipBackground,
            color: visualStyle.textColor,
          }}
        >
          {card.logo}
        </span>
      </div>

      <div className="absolute bottom-5 left-5 flex items-center gap-3">
        <span
          className="grid h-9 w-12 place-items-center rounded-lg border border-current/25"
          style={{ backgroundColor: visualStyle.chipBackground }}
          aria-hidden="true"
        >
          <span className="h-5 w-7 rounded-md border border-current/40" />
        </span>
        <Wifi aria-hidden="true" className="h-5 w-5 rotate-90 opacity-80" />
      </div>
    </div>
  );
}

type CardDetailsPanelProps = {
  card: CreditCardPageItem | null;
  onCreateClick: () => void;
  onDeleteCard: (card?: CreditCardPageItem['source'] | null) => void;
  onEditCard: (card?: CreditCardPageItem['source'] | null) => void;
  onViewInvoice: (card?: CreditCardPageItem['source'] | null) => void;
};

function CardDetailsPanel({
  card,
  onCreateClick,
  onDeleteCard,
  onEditCard,
  onViewInvoice,
}: CardDetailsPanelProps) {
  const { formatCurrency, formatDateLabel } = usePreferences();

  if (!card) {
    return (
      <aside className="rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15">
        <EmptyState
          icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
          title="Nenhum cartão selecionado"
          description="Cadastre ou selecione um cartão para ver os detalhes."
          action={
            <Button
              type="button"
              leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
              onClick={onCreateClick}
            >
              Novo cartão
            </Button>
          }
        />
      </aside>
    );
  }

  const progress = clampPercentage(card.usedPercentage);

  return (
    <aside
      className="rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15"
      aria-labelledby="credit-card-details-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="credit-card-details-title"
          className="text-base font-semibold text-app-text"
        >
          Detalhes do cartão
        </h2>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            card.isActive
              ? 'bg-success-surface text-success-text'
              : 'bg-app-elevated text-app-muted',
          )}
        >
          {card.isActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="mt-5">
        <GenericCreditCardVisual card={card} large />
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold leading-tight text-app-text">
            {card.name}
          </h3>
          <p className="mt-1 text-sm text-app-muted">Cartão de crédito</p>
        </div>
        <button
          type="button"
          aria-label={`Editar cartão ${card.name}`}
          onClick={() => onEditCard(card.source)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-bg/35 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Edit3 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <DetailRow label="Limite total" value={formatCurrency(card.limit)} />
        <DetailRow label="Utilizado" value={formatCurrency(card.used)} />
        <DetailRow
          label="Disponível"
          value={formatCurrency(card.availableLimit)}
        />
        <DetailRow
          label="Fatura atual"
          value={formatCurrency(card.currentInvoiceTotal)}
        />
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-app-text">Uso do limite</span>
          <span className="font-semibold text-brand-400">{progress}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-app-elevated"
          role="progressbar"
          aria-label={`Uso do limite do cartão ${card.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DateInfoCard
          label="Fechamento"
          value={`Dia ${card.closingDay}`}
          icon={CalendarDays}
        />
        <DateInfoCard
          label="Vencimento"
          value={formatDateLabel(card.dueDateLabel)}
          icon={CalendarDays}
        />
      </div>

      <div className="mt-5 space-y-2.5">
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full rounded-xl"
          leftIcon={<FileText aria-hidden="true" className="h-4 w-4" />}
          onClick={() => onViewInvoice(card.source)}
        >
          Ver fatura
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full rounded-xl"
          leftIcon={<Edit3 aria-hidden="true" className="h-4 w-4" />}
          onClick={() => onEditCard(card.source)}
        >
          Editar cartão
        </Button>
        <button
          type="button"
          onClick={() => onDeleteCard(card.source)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-danger-border bg-transparent px-4 text-sm font-semibold text-red-400 transition-colors hover:bg-danger-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Excluir cartão
        </button>
      </div>
    </aside>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-app-muted">{label}</dt>
      <dd className="truncate text-right font-semibold text-app-text">{value}</dd>
    </div>
  );
}

type DateInfoCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function DateInfoCard({ icon: Icon, label, value }: DateInfoCardProps) {
  return (
    <div className="rounded-xl border border-app-border bg-app-bg/35 p-3 text-center">
      <Icon aria-hidden="true" className="mx-auto h-4 w-4 text-brand-400" />
      <p className="mt-2 text-xs text-app-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-app-text">{value}</p>
    </div>
  );
}

function CardDetailsPanelSkeleton() {
  return (
    <aside className="rounded-2xl border border-app-border bg-app-surface/75 p-4 shadow-lg shadow-black/15">
      <div className="h-5 w-40 animate-pulse rounded-full bg-app-elevated" />
      <div className="mt-5 aspect-[1.72] animate-pulse rounded-xl bg-app-elevated" />
      <div className="mt-5 h-6 w-32 animate-pulse rounded-full bg-app-elevated" />
      <div className="mt-5 space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex items-center justify-between gap-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-app-elevated" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-app-elevated" />
          </div>
        ))}
      </div>
    </aside>
  );
}
