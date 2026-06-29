import { Download, Smartphone, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';

type InstallPromptOutcome = 'accepted' | 'dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: InstallPromptOutcome;
    platform: string;
  }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const DISMISSED_STORAGE_KEY = 'finance-control:pwa-install-dismissed-at';
const DISMISSED_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function isAppAlreadyInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}

function shouldShowAfterDismissal() {
  const dismissedAt = window.localStorage.getItem(DISMISSED_STORAGE_KEY);

  if (!dismissedAt) {
    return true;
  }

  const dismissedTimestamp = Number(dismissedAt);

  if (Number.isNaN(dismissedTimestamp)) {
    return true;
  }

  return Date.now() - dismissedTimestamp > DISMISSED_TTL_MS;
}

export function InstallAppToast() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isAppAlreadyInstalled()) {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(shouldShowAfterDismissal());
    }

    function handleAppInstalled() {
      window.localStorage.removeItem(DISMISSED_STORAGE_KEY);
      setVisible(false);
      setInstallPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }

    setInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'dismissed') {
        window.localStorage.setItem(DISMISSED_STORAGE_KEY, String(Date.now()));
      } else {
        window.localStorage.removeItem(DISMISSED_STORAGE_KEY);
      }

      setVisible(false);
      setInstallPrompt(null);
    } finally {
      setInstalling(false);
    }
  }, [installPrompt]);

  const handleDismiss = useCallback(() => {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  if (!visible || !installPrompt) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(94px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-2xl border border-brand-500/30 bg-app-surface/95 p-3 text-app-text shadow-[0_18px_48px_rgba(0,0,0,0.5)] backdrop-blur md:bottom-5"
    >
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-surface text-brand-400">
          <Smartphone aria-hidden="true" className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-app-text">
                Instale o Finance Control
              </p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Acesse mais rápido pelo celular, com visual de aplicativo.
              </p>
            </div>

            <button
              type="button"
              aria-label="Fechar aviso de instalação"
              onClick={handleDismiss}
              className="rounded-full p-1 text-app-muted transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            className="mt-3 w-full"
            loading={installing}
            leftIcon={<Download aria-hidden="true" className="h-4 w-4" />}
            onClick={() => void handleInstall()}
          >
            Instalar app
          </Button>
        </div>
      </div>
    </div>
  );
}
