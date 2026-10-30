import {
  AlertCircle,
  CheckCircle2,
  Info,
  Pencil,
  PlusCircle,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';

import {
  useToast,
  type ToastAction,
  type ToastItem,
} from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

type ToastVisualConfig = {
  icon: LucideIcon;
  defaultTitle: string;
  cardBorder: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  titleColor: string;
};

const visualConfigs: Record<ToastAction, ToastVisualConfig> = {
  create: {
    icon: PlusCircle,
    defaultTitle: 'Criado com sucesso',
    cardBorder: 'border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-emerald-500/15',
    iconBorder: 'border-emerald-500/25',
    iconColor: 'text-emerald-400',
    titleColor: 'text-app-text',
  },
  edit: {
    icon: Pencil,
    defaultTitle: 'Alterações salvas',
    cardBorder: 'border-blue-500/30 shadow-[0_10px_35px_rgba(59,130,246,0.15)]',
    iconBg: 'bg-blue-500/15',
    iconBorder: 'border-blue-500/25',
    iconColor: 'text-blue-400',
    titleColor: 'text-app-text',
  },
  delete: {
    icon: Trash2,
    defaultTitle: 'Item excluído',
    cardBorder: 'border-rose-500/30 shadow-[0_10px_35px_rgba(244,63,94,0.15)]',
    iconBg: 'bg-rose-500/15',
    iconBorder: 'border-rose-500/25',
    iconColor: 'text-rose-400',
    titleColor: 'text-app-text',
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Não foi possível concluir',
    cardBorder: 'border-danger-border shadow-[0_10px_35px_rgba(239,68,68,0.2)]',
    iconBg: 'bg-danger-surface',
    iconBorder: 'border-danger-border',
    iconColor: 'text-danger',
    titleColor: 'text-danger-text',
  },
  success: {
    icon: CheckCircle2,
    defaultTitle: 'Sucesso',
    cardBorder: 'border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-emerald-500/15',
    iconBorder: 'border-emerald-500/25',
    iconColor: 'text-emerald-400',
    titleColor: 'text-app-text',
  },
  info: {
    icon: Info,
    defaultTitle: 'Informação',
    cardBorder: 'border-app-border shadow-[0_10px_35px_rgba(0,0,0,0.35)]',
    iconBg: 'bg-app-elevated',
    iconBorder: 'border-app-border',
    iconColor: 'text-app-text',
    titleColor: 'text-app-text',
  },
};

interface ToastCardProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ item, onDismiss }: ToastCardProps) {
  const config = visualConfigs[item.action] ?? visualConfigs.info;
  const Icon = config.icon;
  const title = item.title !== undefined ? item.title : config.defaultTitle;

  return (
    <div
      role={item.action === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md',
        'bg-app-surface/95 text-app-text transition-all',
        config.cardBorder,
        item.isExiting ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
          config.iconBg,
          config.iconBorder,
          config.iconColor,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        {title ? (
          <p className={cn('text-sm font-semibold leading-tight', config.titleColor)}>
            {title}
          </p>
        ) : null}
        <p
          className={cn(
            'text-xs leading-relaxed text-app-muted',
            title ? 'mt-1' : 'text-sm font-medium text-app-text',
          )}
        >
          {item.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Fechar notificação"
        className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2.5 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:left-auto md:right-6 md:top-6 md:w-full md:max-w-sm md:items-end md:p-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
