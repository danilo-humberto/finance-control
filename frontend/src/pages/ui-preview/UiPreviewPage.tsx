import { Edit3, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  CardFormSheet,
  type CardFormValues,
} from '@/components/sheets/CardFormSheet';
import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '@/components/sheets/CategoryFormSheet';
import { mockCategories, mockCreditCards } from '@/mocks/financeMocks';

export function UiPreviewPage() {
  const [cardCreateOpen, setCardCreateOpen] = useState(false);
  const [cardEditOpen, setCardEditOpen] = useState(false);
  const [categoryCreateOpen, setCategoryCreateOpen] = useState(false);
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const firstCard = mockCreditCards[0];
  const firstCategory = mockCategories[0];

  function handleCardSubmit(values: CardFormValues) {
    console.log('Preview card submit', values);
  }

  function handleCategorySubmit(values: CategoryFormValues) {
    console.log('Preview category submit', values);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prévia de UI"
        description="Bancada temporária para testar painéis e modais mobile."
      />

      <Card>
        <CardContent className="grid gap-3 pt-5">
          <Button type="button" onClick={() => setCardCreateOpen(true)}>
            Abrir criação de cartão
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCardEditOpen(true)}
          >
            Abrir edição de cartão
          </Button>
          <Button type="button" onClick={() => setCategoryCreateOpen(true)}>
            Abrir criação de categoria
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCategoryEditOpen(true)}
          >
            Abrir edição de categoria
          </Button>
          <Button
            type="button"
            variant="secondary"
            leftIcon={<MoreVertical aria-hidden="true" className="h-4 w-4" />}
            onClick={() => setActionSheetOpen(true)}
          >
            Abrir painel de ações
          </Button>
          <Button
            type="button"
            variant="danger"
            leftIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
            onClick={() => setConfirmDialogOpen(true)}
          >
            Abrir diálogo de confirmação
          </Button>
        </CardContent>
      </Card>

      <CardFormSheet
        open={cardCreateOpen}
        onOpenChange={setCardCreateOpen}
        mode="create"
        onSubmit={handleCardSubmit}
      />
      <CardFormSheet
        open={cardEditOpen}
        onOpenChange={setCardEditOpen}
        mode="edit"
        initialData={{
          name: firstCard?.name,
          closingDay: String(firstCard?.closingDay ?? ''),
          dueDay: String(firstCard?.dueDay ?? ''),
          limit: String(firstCard?.limit ?? ''),
        }}
        onSubmit={handleCardSubmit}
        onDelete={() => setConfirmDialogOpen(true)}
      />

      <CategoryFormSheet
        open={categoryCreateOpen}
        onOpenChange={setCategoryCreateOpen}
        mode="create"
        onSubmit={handleCategorySubmit}
      />
      <CategoryFormSheet
        open={categoryEditOpen}
        onOpenChange={setCategoryEditOpen}
        mode="edit"
        initialData={{
          name: firstCategory?.name,
          type: firstCategory?.type,
          icon: firstCategory?.icon,
          color: firstCategory?.color,
        }}
        onSubmit={handleCategorySubmit}
        onDelete={() => setConfirmDialogOpen(true)}
      />

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title="Ações"
        actions={[
          {
            label: 'Editar movimentação',
            description: 'Abrir formulário de edição',
            icon: Edit3,
            onClick: () => setCardEditOpen(true),
          },
          {
            label: 'Excluir movimentação',
            description: 'Abrir confirmação de exclusão',
            icon: Trash2,
            variant: 'danger',
            onClick: () => setConfirmDialogOpen(true),
          },
        ]}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Excluir movimentação"
        description="Tem certeza que deseja excluir esta movimentação?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => console.log('Preview confirm delete')}
      />
    </div>
  );
}
