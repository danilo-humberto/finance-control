import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CurrencyPreference = 'BRL' | 'USD' | 'EUR';
export type DateFormatPreference = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

export type GeneralPreferences = {
  currency: CurrencyPreference;
  dateFormat: DateFormatPreference;
};

type PreferencesContextValue = {
  preferences: GeneralPreferences;
  setCurrency: (currency: CurrencyPreference) => void;
  setDateFormat: (dateFormat: DateFormatPreference) => void;
  formatCurrency: (value: number) => string;
  formatDateLabel: (value: string) => string;
};

type PreferencesProviderProps = {
  children: ReactNode;
};

const storageKey = 'finance-control-general-preferences';

const defaultPreferences: GeneralPreferences = {
  currency: 'BRL',
  dateFormat: 'dd/MM/yyyy',
};

const currencyLocales: Record<CurrencyPreference, string> = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
};

export const PreferencesContext = createContext<
  PreferencesContextValue | undefined
>(undefined);

function isCurrencyPreference(value: unknown): value is CurrencyPreference {
  return value === 'BRL' || value === 'USD' || value === 'EUR';
}

function isDateFormatPreference(value: unknown): value is DateFormatPreference {
  return (
    value === 'dd/MM/yyyy' ||
    value === 'MM/dd/yyyy' ||
    value === 'yyyy-MM-dd'
  );
}

function getStoredPreferences(): GeneralPreferences {
  const storedPreferences = localStorage.getItem(storageKey);

  if (!storedPreferences) {
    return defaultPreferences;
  }

  try {
    const parsedPreferences = JSON.parse(
      storedPreferences,
    ) as Partial<GeneralPreferences>;

    return {
      currency: isCurrencyPreference(parsedPreferences.currency)
        ? parsedPreferences.currency
        : defaultPreferences.currency,
      dateFormat: isDateFormatPreference(parsedPreferences.dateFormat)
        ? parsedPreferences.dateFormat
        : defaultPreferences.dateFormat,
    };
  } catch {
    return defaultPreferences;
  }
}

function savePreferences(preferences: GeneralPreferences) {
  localStorage.setItem(storageKey, JSON.stringify(preferences));
}

function formatDateParts(
  dateParts: { day: string; month: string; year?: string },
  dateFormat: DateFormatPreference,
) {
  if (dateFormat === 'MM/dd/yyyy') {
    return dateParts.year
      ? `${dateParts.month}/${dateParts.day}/${dateParts.year}`
      : `${dateParts.month}/${dateParts.day}`;
  }

  if (dateFormat === 'yyyy-MM-dd') {
    return dateParts.year
      ? `${dateParts.year}-${dateParts.month}-${dateParts.day}`
      : `${dateParts.month}-${dateParts.day}`;
  }

  return dateParts.year
    ? `${dateParts.day}/${dateParts.month}/${dateParts.year}`
    : `${dateParts.day}/${dateParts.month}`;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferencesState] =
    useState<GeneralPreferences>(getStoredPreferences);

  const setPreferences = useCallback((nextPreferences: GeneralPreferences) => {
    setPreferencesState(nextPreferences);
    savePreferences(nextPreferences);
  }, []);

  const setCurrency = useCallback(
    (currency: CurrencyPreference) => {
      setPreferences({
        ...preferences,
        currency,
      });
    },
    [preferences, setPreferences],
  );

  const setDateFormat = useCallback(
    (dateFormat: DateFormatPreference) => {
      setPreferences({
        ...preferences,
        dateFormat,
      });
    },
    [preferences, setPreferences],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(currencyLocales[preferences.currency], {
        style: 'currency',
        currency: preferences.currency,
      }),
    [preferences.currency],
  );

  const formatCurrency = useCallback(
    (value: number) => currencyFormatter.format(value),
    [currencyFormatter],
  );

  const formatDateLabel = useCallback(
    (value: string) =>
      value.replace(
        /\b(\d{2})\/(\d{2})(?:\/(\d{4}))?\b/g,
        (_match, day: string, month: string, year: string | undefined) =>
          formatDateParts({ day, month, year }, preferences.dateFormat),
      ),
    [preferences.dateFormat],
  );

  const value = useMemo(
    () => ({
      preferences,
      setCurrency,
      setDateFormat,
      formatCurrency,
      formatDateLabel,
    }),
    [formatCurrency, formatDateLabel, preferences, setCurrency, setDateFormat],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
