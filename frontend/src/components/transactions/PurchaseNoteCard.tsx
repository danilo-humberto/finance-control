import { MessageSquareText } from 'lucide-react';

import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

type PurchaseNoteCardProps = {
  note: string;
  maxLength: number;
  onNoteChange: (value: string) => void;
};

export function PurchaseNoteCard({
  note,
  maxLength,
  onNoteChange,
}: PurchaseNoteCardProps) {
  return (
    <section
      className="rounded-2xl border border-app-border bg-app-surface/75 p-2.5 shadow-lg shadow-black/15"
      aria-labelledby="purchase-note-title"
    >
      <div className="space-y-1.5">
        <Label
          id="purchase-note-title"
          htmlFor="purchase-note"
          className="block text-[0.72rem] font-medium leading-none text-app-muted"
        >
          Observação (opcional)
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-3 text-brand-400">
            <MessageSquareText aria-hidden="true" className="h-4 w-4" />
          </span>
          <Textarea
            id="purchase-note"
            value={note}
            maxLength={maxLength}
            placeholder="Adicione uma observação..."
            onChange={(event) => onNoteChange(event.target.value)}
            className="min-h-[4rem] resize-none rounded-xl bg-app-bg/35 px-3 py-2.5 pl-9 pr-12 text-[0.8rem]"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-[0.72rem] font-medium text-app-muted">
            {note.length}/{maxLength}
          </span>
        </div>
      </div>
    </section>
  );
}
