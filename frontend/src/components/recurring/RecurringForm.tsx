import { useEffect, useState, type FormEvent } from 'react';

import { AuthMessage } from '@/components/auth/AuthMessage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/RadixSelect';
import { useCategoriesQuery } from '@/hooks/useCategoriesQuery';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import {
  type RecurringTransaction,
  type UpdateRecurringTransactionPayload,
} from '@/types/recurring-transaction';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/transactionForm';

type RecurringFormProps = {
  recurringTransaction: RecurringTransaction | null;
  onSubmit: (payload: UpdateRecurringTransactionPayload) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  submitError?: string | null;
};

export function RecurringForm({
  recurringTransaction,
  onSubmit,
  onCancel,
  submitting = false,
  submitError = null,
}: RecurringFormProps) {
  const { formatCurrency } = usePreferences();
  const categoriesQuery = useCategoriesQuery();

  const initialCatId =
    recurringTransaction?.categoryId ||
    recurringTransaction?.category?.id ||
    '';
  const initialSubcatId = recurringTransaction?.subcategoryId ?? '';

  const [description, setDescription] = useState(
    () => recurringTransaction?.description ?? '',
  );
  const [amountInput, setAmountInput] = useState(() =>
    recurringTransaction ? formatCurrency(recurringTransaction.amount) : '',
  );
  const [categoryId, setCategoryId] = useState(() => initialCatId);
  const [subcategoryId, setSubcategoryId] = useState(() => initialSubcatId);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (recurringTransaction) {
      setDescription(recurringTransaction.description);
      setAmountInput(formatCurrency(recurringTransaction.amount));
      const targetCatId =
        recurringTransaction.categoryId ||
        recurringTransaction.category?.id ||
        '';
      setCategoryId(targetCatId);
      setSubcategoryId(recurringTransaction.subcategoryId ?? '');
      setValidationError(null);
    }
  }, [formatCurrency, recurringTransaction]);

  const categories = categoriesQuery.data ?? [];
  const rootCategories = categories.filter((cat) => !cat.parentId);
  const selectedCategory =
    rootCategories.find((cat) => cat.id === categoryId) ||
    (recurringTransaction &&
    (recurringTransaction.categoryId === categoryId ||
      recurringTransaction.category?.id === categoryId)
      ? recurringTransaction.category
      : undefined);

  const availableSubcategories = categories.filter(
    (cat) => cat.parentId === categoryId,
  );
  const selectedSubcategory =
    availableSubcategories.find((cat) => cat.id === subcategoryId) ||
    (recurringTransaction?.subcategoryId === subcategoryId
      ? recurringTransaction?.subcategory
      : undefined);

  function handleCategoryChange(newCatId: string) {
    setCategoryId(newCatId);
    setSubcategoryId('');
  }

  function handleAmountChange(value: string) {
    setAmountInput(formatCurrencyInput(value, formatCurrency));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationError(null);

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setValidationError('Informe uma descrição para a recorrência.');
      return;
    }

    const numericAmount = parseCurrencyInput(amountInput);
    if (!numericAmount || numericAmount <= 0) {
      setValidationError('Informe um valor válido maior que zero.');
      return;
    }

    if (!categoryId) {
      setValidationError('Selecione uma categoria.');
      return;
    }

    const payload: UpdateRecurringTransactionPayload = {
      description: trimmedDescription,
      amount: numericAmount,
      categoryId,
      subcategoryId: subcategoryId || null,
    };

    await onSubmit(payload);
  }

  const errorMessage = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage ? (
        <AuthMessage tone="error">{errorMessage}</AuthMessage>
      ) : null}

      <Input
        label="Nome / Descrição"
        placeholder="Ex: Netflix, Academia, Spotify"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <Input
        label="Valor mensal"
        placeholder={formatCurrency(0)}
        value={amountInput}
        onChange={(e) => handleAmountChange(e.target.value)}
        required
      />

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={categoryId || undefined} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-left',
                !selectedCategory && 'text-app-muted',
              )}
            >
              {selectedCategory?.name ?? 'Selecione uma categoria'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {rootCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableSubcategories.length > 0 ? (
        <div className="space-y-2">
          <Label>Subcategoria (opcional)</Label>
          <Select
            value={subcategoryId || 'none'}
            onValueChange={(val) => setSubcategoryId(val === 'none' ? '' : val)}
          >
            <SelectTrigger>
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-left',
                  !selectedSubcategory && 'text-app-muted',
                )}
              >
                {selectedSubcategory?.name ?? 'Nenhuma (apenas categoria principal)'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                Nenhuma (apenas categoria principal)
              </SelectItem>
              {availableSubcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
