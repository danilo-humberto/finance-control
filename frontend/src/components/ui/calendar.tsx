import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from 'react-day-picker';

import { cn } from '@/lib/utils';

type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('relative p-3', className)}
      classNames={{
        root: cn(defaultClassNames.root),
        months: 'flex flex-col',
        month: 'space-y-4',
        month_caption: 'relative flex h-9 items-center justify-center px-9',
        caption_label: 'text-sm font-semibold text-app-text',
        nav: 'absolute inset-x-3 top-3 z-10 flex items-center justify-between',
        button_previous: cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-muted outline-none transition-colors',
          'hover:bg-app-elevated hover:text-app-text focus-visible:ring-2 focus-visible:ring-brand-500',
          'disabled:pointer-events-none disabled:opacity-40',
        ),
        button_next: cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-muted outline-none transition-colors',
          'hover:bg-app-elevated hover:text-app-text focus-visible:ring-2 focus-visible:ring-brand-500',
          'disabled:pointer-events-none disabled:opacity-40',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'w-9 rounded-md text-center text-[0.72rem] font-medium text-app-muted',
        weeks: 'mt-2 block',
        week: 'mt-1 flex w-full',
        day: 'relative h-9 w-9 p-0 text-center text-sm',
        day_button: cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg font-medium text-app-text outline-none transition-colors',
          'hover:bg-app-elevated focus-visible:ring-2 focus-visible:ring-brand-500',
        ),
        selected:
          '[&>button]:bg-brand-500 [&>button]:font-semibold [&>button]:text-slate-950 [&>button]:hover:bg-brand-400',
        today:
          '[&>button]:border [&>button]:border-brand-500/60 [&>button]:text-brand-400',
        outside: '[&>button]:text-app-muted/45',
        disabled: '[&>button]:pointer-events-none [&>button]:opacity-35',
        hidden: 'invisible',
        range_start: '',
        range_middle: '',
        range_end: '',
        dropdowns: 'flex items-center justify-center gap-2',
        dropdown_root: 'relative',
        dropdown:
          'h-9 rounded-lg border border-app-border bg-app-bg px-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500',
        months_dropdown: '',
        years_dropdown: '',
        week_number: '',
        week_number_header: '',
        footer: 'mt-3 text-sm text-app-muted',
        focused: '',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) => {
          const Icon =
            orientation === 'left'
              ? ChevronLeft
              : orientation === 'right'
                ? ChevronRight
                : orientation === 'up'
                  ? ChevronUp
                  : ChevronDown;

          return <Icon aria-hidden="true" className="h-4 w-4" {...iconProps} />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
