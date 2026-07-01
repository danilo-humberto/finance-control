import {
  BookOpen,
  Car,
  DollarSign,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Plane,
  ShoppingBag,
  Utensils,
  User,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
} from 'react';

import { Button } from '@/components/ui/Button';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { BaseBottomSheet } from './BaseBottomSheet';

export type CategoryFormValues = {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
};

type CategoryFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
  onDelete?: () => void;
  closeOnSubmit?: boolean;
  submitting?: boolean;
  submitError?: string | null;
};

type IconOption = {
  value: string;
  icon: ComponentType<{ className?: string }>;
};

const iconOptions: IconOption[] = [
  { value: 'Utensils', icon: Utensils },
  { value: 'Car', icon: Car },
  { value: 'ShoppingBag', icon: ShoppingBag },
  { value: 'Heart', icon: Heart },
  { value: 'Home', icon: Home },
  { value: 'GraduationCap', icon: GraduationCap },
  { value: 'DollarSign', icon: DollarSign },
  { value: 'Gift', icon: Gift },
  { value: 'Plane', icon: Plane },
  { value: 'BookOpen', icon: BookOpen },
  { value: 'User', icon: User },
];

const colorOptions = [
  '#22c55e',
  '#2563eb',
  '#7c3aed',
  '#f59e0b',
  '#ef4444',
  '#f43f5e',
  '#06b6d4',
  '#eab308',
];

const emptyValues: CategoryFormValues = {
  name: '',
  type: 'expense',
  icon: 'Utensils',
  color: '#22c55e',
};

export function CategoryFormSheet({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  onDelete,
  closeOnSubmit = true,
  submitting = false,
  submitError = null,
}: CategoryFormSheetProps) {
  const [values, setValues] = useState<CategoryFormValues>(emptyValues);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setValues({ ...emptyValues, ...initialData });
    }

    wasOpenRef.current = open;
  }, [initialData, open]);

  function updateValue<K extends keyof CategoryFormValues>(
    field: K,
    value: CategoryFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);

    if (closeOnSubmit) {
      onOpenChange(false);
    }
  }

  const isEdit = mode === 'edit';

  return (
    <BaseBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar categoria' : 'Nova categoria'}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {submitError ? <AuthMessage tone="error">{submitError}</AuthMessage> : null}

        <Input
          label="Nome da categoria"
          value={values.name}
          onChange={(event) => updateValue('name', event.target.value)}
          placeholder="Ex.: Alimentação, Transporte..."
          required
        />

        <Select
          label="Tipo"
          value={values.type}
          onChange={(event) =>
            updateValue('type', event.target.value as CategoryFormValues['type'])
          }
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </Select>

        <div className="space-y-2">
          <p className="text-sm font-medium text-app-text">Ícone</p>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value === values.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateValue('icon', option.value)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border border-app-border text-app-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    isSelected &&
                      'border-brand-500 bg-brand-500 text-slate-950',
                  )}
                  aria-pressed={isSelected}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="sr-only">{option.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-app-text">Cor</p>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((color) => {
              const isSelected = color === values.color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateValue('color', color)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    isSelected && 'border-app-text',
                  )}
                  style={{ backgroundColor: color }}
                  aria-pressed={isSelected}
                >
                  <span className="sr-only">Selecionar cor {color}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button type="submit" className="w-full" loading={submitting}>
            {isEdit ? 'Salvar alterações' : 'Adicionar categoria'}
          </Button>
          {isEdit && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-danger-text hover:text-danger-text"
              onClick={onDelete}
            >
              Excluir categoria
            </Button>
          ) : null}
        </div>
      </form>
    </BaseBottomSheet>
  );
}
