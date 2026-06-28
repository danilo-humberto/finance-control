import { type ThemeMode } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ThemeOption = {
  value: ThemeMode;
  title: string;
  description: string;
  icon: LucideIcon;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'dark',
    title: 'Escuro',
    description: 'Mantém o app com fundo escuro e contraste suave.',
    icon: Moon,
  },
  {
    value: 'light',
    title: 'Claro',
    description: 'Usa tons claros seguindo a paleta do sistema.',
    icon: Sun,
  },
  {
    value: 'system',
    title: 'Automático',
    description: 'Acompanha a preferência definida no dispositivo.',
    icon: Monitor,
  },
];

function getThemeLabel(theme: ThemeMode) {
  if (theme === 'system') {
    return 'Automático';
  }

  return theme === 'dark' ? 'Escuro' : 'Claro';
}

export function ThemeSettingsPage() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme, theme } = useTheme();

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Voltar para configurações"
          onClick={() => navigate('/settings')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text shadow-lg shadow-black/15 transition-colors hover:bg-app-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Tema
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Escolha como o app deve aparecer
          </p>
        </div>
      </header>

      <section className="space-y-2" aria-labelledby="theme-current-title">
        <h2
          id="theme-current-title"
          className="text-[0.94rem] font-semibold leading-tight text-app-muted"
        >
          Tema atual
        </h2>

        <div className="rounded-2xl border border-brand-800/65 bg-brand-950/30 p-3 shadow-lg shadow-black/15">
          <p className="text-[0.84rem] font-semibold leading-5 text-app-text">
            {getThemeLabel(theme)}
          </p>
          <p className="mt-1 text-[0.7rem] leading-4 text-app-muted">
            Aparência aplicada agora: {resolvedTheme === 'dark' ? 'escura' : 'clara'}.
          </p>
        </div>
      </section>

      <section className="space-y-2" aria-labelledby="theme-options-title">
        <h2
          id="theme-options-title"
          className="text-[0.94rem] font-semibold leading-tight text-app-muted"
        >
          Selecionar tema
        </h2>

        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === theme;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                aria-pressed={isSelected}
                className="flex w-full items-center gap-2.5 border-b border-app-border/80 px-2.5 py-3 text-left transition-colors last:border-b-0 hover:bg-app-elevated/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    isSelected
                      ? 'bg-brand-500 text-slate-950'
                      : 'bg-app-icon text-brand-400',
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-semibold leading-5 text-app-text">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-[0.68rem] leading-4 text-app-muted">
                    {option.description}
                  </span>
                </span>

                {isSelected ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                    <Check aria-hidden="true" className="h-4 w-4" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
