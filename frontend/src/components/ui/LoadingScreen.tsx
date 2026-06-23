import { LoaderCircle } from 'lucide-react';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({
  message = 'Carregando...',
}: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 text-app-text">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle
          aria-hidden="true"
          className="h-6 w-6 animate-spin text-brand-500"
        />
        <p className="text-sm text-app-muted">{message}</p>
      </div>
    </main>
  );
}
