import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

type CategoriesSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CategoriesSearch({ value, onChange }: CategoriesSearchProps) {
  return (
    <Input
      aria-label="Buscar categoria"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar categoria"
      leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
      className="h-10 rounded-2xl bg-app-surface/75 text-[0.8rem]"
    />
  );
}
