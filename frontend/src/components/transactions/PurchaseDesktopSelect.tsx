import { useState, type ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/RadixSelect';

type PurchaseDesktopSelectOption = {
  id: string;
  label: string;
  detail?: string;
};

type PurchaseDesktopSelectProps = {
  ariaLabel: string;
  disabled?: boolean;
  leading: ReactNode;
  options: PurchaseDesktopSelectOption[];
  placeholder: string;
  selectedDetail?: string;
  value: string;
  onChange: (value: string) => void;
};

export function PurchaseDesktopSelect({
  ariaLabel,
  disabled = false,
  leading,
  options,
  placeholder,
  selectedDetail,
  value,
  onChange,
}: PurchaseDesktopSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.id === value);
  const detail = selectedDetail ?? selectedOption?.detail;

  return (
    <Select
      open={open}
      value={value}
      disabled={disabled}
      onOpenChange={setOpen}
      onValueChange={onChange}
    >
      <SelectTrigger aria-label={ariaLabel}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          {leading}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {selectedOption?.label ?? placeholder}
          {detail ? (
            <span className="ml-1 font-medium text-app-muted">({detail})</span>
          ) : null}
        </span>
      </SelectTrigger>

      <SelectContent
        data-purchase-dialog-layer="select"
        aria-label={`${ariaLabel}: opções`}
        onEscapeKeyDown={(event) => {
          event.stopPropagation();
          setOpen(false);
        }}
      >
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <span className="flex min-w-0 items-baseline gap-1">
              <span className="truncate">{option.label}</span>
              {option.detail ? (
                <span className="shrink-0 text-xs text-app-muted">
                  ({option.detail})
                </span>
              ) : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
