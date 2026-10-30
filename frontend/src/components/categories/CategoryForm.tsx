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

import { AuthMessage } from '@/components/auth/AuthMessage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/RadixSelect';
import { cn } from '@/lib/utils';
import { type Category } from '@/types/category';

export type CategoryFormValues = {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  parentId?: string | null;
};

export type CategoryFormProps = {
  initialData?: Partial<CategoryFormValues>;
  parentCategories?: Category[];
  mode: 'create' | 'edit';
  onDelete?: () => void;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
  open: boolean;
  submitError?: string | null;
  submitting?: boolean;
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
  parentId: null,
};

export function CategoryForm({
  initialData,
  parentCategories = [],
  mode,
  onDelete,
  onSubmit,
  open,
  submitting = false,
  submitError = null,
}: CategoryFormProps) {
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

  function handleParentCategoryChange(selectedParentId: string) {
    if (selectedParentId === 'root') {
      updateValue('parentId', null);
      return;
    }

    const parent = parentCategories.find((cat) => cat.id === selectedParentId);
    if (parent) {
      setValues((current) => ({
        ...current,
        parentId: parent.id,
        type: parent.type === 'INCOME' ? 'income' : 'expense',
      }));
    } else {
      updateValue('parentId', selectedParentId);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  const isEdit = mode === 'edit';
  const hasSelectedParent = Boolean(values.parentId);
  const selectedParent = hasSelectedParent
    ? parentCategories.find((cat) => cat.id === values.parentId)
    : null;

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {submitError ? <AuthMessage tone="error">{submitError}</AuthMessage> : null}

      <div className="space-y-1.5">
        <Label htmlFor="category-name">Nome da categoria</Label>
        <Input
          id="category-name"
          value={values.name}
          onChange={(event) => updateValue('name', event.target.value)}
          placeholder="Ex.: Alimentação, Supermercado..."
          required
        />
      </div>

      {parentCategories.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="category-parent">Vincular como subcategoria</Label>
          <Select
            value={values.parentId ?? 'root'}
            onValueChange={handleParentCategoryChange}
          >
            <SelectTrigger id="category-parent">
              <SelectValue placeholder="Selecione uma categoria pai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">Nenhuma (categoria principal)</SelectItem>
              {parentCategories.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name} ({parent.type === 'INCOME' ? 'Receita' : 'Despesa'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedParent && (
            <p className="text-xs text-app-muted">
              Esta subcategoria pertencerá à categoria{' '}
              <strong className="text-app-text">{selectedParent.name}</strong>.
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="category-type">Tipo</Label>
        <Select
          disabled={hasSelectedParent}
          value={values.type}
          onValueChange={(val) =>
            updateValue('type', val as CategoryFormValues['type'])
          }
        >
          <SelectTrigger id="category-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Despesa</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
          </SelectContent>
        </Select>
        {hasSelectedParent && (
          <p className="text-xs text-app-muted">
            O tipo é herdado automaticamente da categoria pai.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Ícone</Label>
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
                  isSelected && 'border-brand-500 bg-brand-500 text-slate-950',
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
        <Label>Cor</Label>
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
          {isEdit
            ? hasSelectedParent
              ? 'Salvar subcategoria'
              : 'Salvar alterações'
            : hasSelectedParent
              ? 'Adicionar subcategoria'
              : 'Adicionar categoria'}
        </Button>
        {isEdit && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-danger-text hover:text-danger-text"
            onClick={onDelete}
          >
            {hasSelectedParent ? 'Excluir subcategoria' : 'Excluir categoria'}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
