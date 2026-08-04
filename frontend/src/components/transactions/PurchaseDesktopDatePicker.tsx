import { CalendarDays, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ptBR } from 'react-day-picker/locale';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PurchaseDesktopDatePickerProps = {
  formattedValue: string;
  value: string;
  onChange: (value: string) => void;
};

export function PurchaseDesktopDatePicker({
  formattedValue,
  value,
  onChange,
}: PurchaseDesktopDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseLocalIsoDate(value), [value]);
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const [compactHeight, setCompactHeight] = useState(() =>
    window.matchMedia('(max-height: 700px)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-height: 700px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setCompactHeight(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Data da compra: ${formattedValue}`}
          aria-expanded={open}
          className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-app-border bg-app-bg/35 px-3 text-left text-[0.8rem] font-semibold text-app-text outline-none transition-colors hover:bg-app-elevated focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20"
        >
          <CalendarDays
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-brand-400"
          />
          <span className="min-w-0 flex-1 truncate">{formattedValue}</span>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-app-muted"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        data-purchase-dialog-layer="date-picker"
        align="start"
        side={compactHeight ? 'right' : 'bottom'}
        className="z-[60] max-h-none w-auto overflow-visible p-0"
        onEscapeKeyDown={(event) => {
          event.stopPropagation();
          setOpen(false);
        }}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          locale={ptBR}
          timeZone={timeZone}
          onSelect={(date) => {
            if (!date) {
              return;
            }

            onChange(formatLocalIsoDate(date));
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function parseLocalIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
