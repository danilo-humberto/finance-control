import { RefreshCw, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

import { Button } from '@/components/ui/Button';

type UpdateServiceWorker = ReturnType<typeof registerSW>;

export function PwaUpdateToast() {
  const updateServiceWorkerRef = useRef<UpdateServiceWorker | null>(null);
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    updateServiceWorkerRef.current = registerSW({
      onNeedRefresh() {
        setVisible(true);
      },
      onRegisterError(error) {
        console.error('Erro ao registrar o service worker.', error);
      },
    });
  }, []);

  const handleUpdate = useCallback(async () => {
    const updateServiceWorker = updateServiceWorkerRef.current;

    if (!updateServiceWorker) {
      return;
    }

    setUpdating(true);

    try {
      await updateServiceWorker(true);
    } finally {
      setUpdating(false);
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(94px+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-2xl border border-brand-500/30 bg-app-surface/95 p-3 text-app-text shadow-[0_18px_48px_rgba(0,0,0,0.5)] backdrop-blur md:bottom-5"
    >
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-surface text-brand-400">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-app-text">
                Atualiza&ccedil;&atilde;o dispon&iacute;vel
              </p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Existe uma nova vers&atilde;o do app pronta para usar.
              </p>
            </div>

            <button
              type="button"
              aria-label="Fechar aviso de atualizacao"
              onClick={() => setVisible(false)}
              className="rounded-full p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            className="mt-3 w-full"
            loading={updating}
            leftIcon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
            onClick={() => void handleUpdate()}
          >
            Atualizar agora
          </Button>
        </div>
      </div>
    </div>
  );
}
