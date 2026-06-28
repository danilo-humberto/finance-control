import {
  type CurrencyPreference,
  type DateFormatPreference,
} from '@/contexts/PreferencesContext';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type PreferenceOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

type PreferenceSectionProps<T extends string> = {
  title: string;
  icon: LucideIcon;
  value: T;
  options: PreferenceOption<T>[];
  onChange: (value: T) => void;
};

const currencyOptions: PreferenceOption<CurrencyPreference>[] = [
  {
    value: 'BRL',
    title: 'Real brasileiro',
    description: 'R$ 1.250,00',
  },
  {
    value: 'USD',
    title: 'Dólar americano',
    description: 'US$ 1,250.00',
  },
  {
    value: 'EUR',
    title: 'Euro',
    description: '€ 1.250,00',
  },
];

const dateFormatOptions: PreferenceOption<DateFormatPreference>[] = [
  {
    value: 'dd/MM/yyyy',
    title: 'Dia/mês/ano',
    description: '28/05/2025',
  },
  {
    value: 'MM/dd/yyyy',
    title: 'Mês/dia/ano',
    description: '05/28/2025',
  },
  {
    value: 'yyyy-MM-dd',
    title: 'Ano-mês-dia',
    description: '2025-05-28',
  },
];

function PreferenceSection<T extends string>({
  title,
  icon: Icon,
  value,
  options,
  onChange,
}: PreferenceSectionProps<T>) {
  return (
    <section className="space-y-2" aria-labelledby={`preference-${title}`}>
      <h2
        id={`preference-${title}`}
        className="text-[0.94rem] font-semibold leading-tight text-app-muted"
      >
        {title}
      </h2>

      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface/75 shadow-lg shadow-black/15">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
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
                <span className="mt-0.5 block truncate text-[0.68rem] leading-4 text-app-muted">
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
  );
}

export function GeneralPreferencesPage() {
  const navigate = useNavigate();
  const {
    formatCurrency,
    formatDateLabel,
    preferences,
    setCurrency,
    setDateFormat,
  } = usePreferences();

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
            Preferências gerais
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Ajuste moeda e datas do app
          </p>
        </div>
      </header>

      <section aria-label="Resumo das preferências">
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-brand-800/65 bg-brand-950/30 shadow-lg shadow-black/15">
          <div className="min-w-0 border-r border-app-border p-2.5">
            <p className="text-[0.62rem] leading-3 text-app-muted">Moeda</p>
            <p className="mt-1 truncate text-[0.74rem] font-semibold leading-4 text-brand-400">
              {preferences.currency}
            </p>
          </div>
          <div className="min-w-0 p-2.5">
            <p className="text-[0.62rem] leading-3 text-app-muted">Data</p>
            <p className="mt-1 truncate text-[0.74rem] font-semibold leading-4 text-brand-400">
              {preferences.dateFormat}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Prévia das preferências"
        className="rounded-2xl border border-app-border bg-app-surface/75 p-3 shadow-lg shadow-black/15"
      >
        <p className="text-[0.68rem] font-medium leading-4 text-app-muted">
          Prévia
        </p>
        <p className="mt-1 text-[0.86rem] font-semibold leading-5 text-app-text">
          {formatCurrency(1250)} • {formatDateLabel('28/05/2025')}
        </p>
      </section>

      <PreferenceSection
        title="Moeda"
        icon={Banknote}
        value={preferences.currency}
        options={currencyOptions}
        onChange={setCurrency}
      />

      <PreferenceSection
        title="Formato de data"
        icon={CalendarDays}
        value={preferences.dateFormat}
        options={dateFormatOptions}
        onChange={setDateFormat}
      />

      <p className="rounded-2xl border border-app-border bg-app-surface/75 p-3 text-[0.72rem] leading-5 text-app-muted shadow-lg shadow-black/15">
        Essas preferências ficam salvas neste dispositivo e já são aplicadas nas
        moedas e datas exibidas no app.
      </p>
    </div>
  );
}
