import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastAction = 'create' | 'edit' | 'delete' | 'error' | 'info' | 'success';

export type ToastOptions = {
  id?: string;
  type?: ToastType;
  action?: ToastAction;
  title?: string;
  message: string;
  durationMs?: number;
};

export type ToastItem = {
  id: string;
  type: ToastType;
  action: ToastAction;
  title?: string;
  message: string;
  durationMs: number;
  isExiting: boolean;
};

type ToastContextValue = {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
  toast: {
    (options: ToastOptions): void;
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
    create: (message: string, options?: Omit<ToastOptions, 'message' | 'action' | 'type'>) => void;
    edit: (message: string, options?: Omit<ToastOptions, 'message' | 'action' | 'type'>) => void;
    delete: (message: string, options?: Omit<ToastOptions, 'message' | 'action' | 'type'>) => void;
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'action' | 'type'>) => void;
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'action' | 'type'>) => void;
  };
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION_MS = 4000;
const EXIT_ANIMATION_MS = 300;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => {
      const target = current.find((t) => t.id === id);
      if (!target || target.isExiting) {
        return current;
      }
      return current.map((t) => (t.id === id ? { ...t, isExiting: true } : t));
    });

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const showToast = useCallback(
    ({
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type = 'success',
      action,
      title,
      message,
      durationMs = DEFAULT_DURATION_MS,
    }: ToastOptions) => {
      const resolvedAction: ToastAction =
        action ??
        (type === 'error' ? 'error' : type === 'info' ? 'info' : 'success');

      const newToast: ToastItem = {
        id,
        type,
        action: resolvedAction,
        title,
        message,
        durationMs,
        isExiting: false,
      };

      setToasts((current) => [...current, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast],
  );

  const toastHelpers = useMemo(() => {
    const fn = (options: ToastOptions) => showToast(options);

    fn.success = (
      message: string,
      options?: Omit<ToastOptions, 'message' | 'type'>,
    ) => {
      showToast({ ...options, message, type: 'success', action: options?.action ?? 'success' });
    };

    fn.create = (
      message: string,
      options?: Omit<ToastOptions, 'message' | 'action' | 'type'>,
    ) => {
      showToast({ ...options, message, type: 'success', action: 'create' });
    };

    fn.edit = (
      message: string,
      options?: Omit<ToastOptions, 'message' | 'action' | 'type'>,
    ) => {
      showToast({ ...options, message, type: 'success', action: 'edit' });
    };

    fn.delete = (
      message: string,
      options?: Omit<ToastOptions, 'message' | 'action' | 'type'>,
    ) => {
      showToast({ ...options, message, type: 'success', action: 'delete' });
    };

    fn.error = (
      message: string,
      options?: Omit<ToastOptions, 'message' | 'action' | 'type'>,
    ) => {
      showToast({ ...options, message, type: 'error', action: 'error' });
    };

    fn.info = (
      message: string,
      options?: Omit<ToastOptions, 'message' | 'action' | 'type'>,
    ) => {
      showToast({ ...options, message, type: 'info', action: 'info' });
    };

    return fn;
  }, [showToast]);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      toast: toastHelpers,
    }),
    [toasts, showToast, dismissToast, toastHelpers],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }

  return context;
}
