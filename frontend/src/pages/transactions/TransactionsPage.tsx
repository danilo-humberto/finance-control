import { ActionSheet } from '@/components/modals/ActionSheet';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { TransactionGroup } from '@/components/transactions/TransactionGroup';
import {
  TransactionsFilters,
  type TransactionFilter,
} from '@/components/transactions/TransactionsFilters';
import { TransactionsSummary } from '@/components/transactions/TransactionsSummary';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  mockTransactions,
  type MockTransaction,
  type MockTransactionGroupKey,
  type MockTransactionsSummary,
} from '@/mocks/financeMocks';
import {
  Copy,
  CreditCard,
  Edit3,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const transactionGroupOrder: MockTransactionGroupKey[] = [
  'today',
  'yesterday',
  'week',
  'older',
];

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getTransactionsSummary(
  transactions: MockTransaction[],
): MockTransactionsSummary {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = Math.abs(
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  return {
    income,
    expense,
    balance: transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    ),
  };
}

function transactionMatchesFilter(
  transaction: MockTransaction,
  activeFilter: TransactionFilter,
) {
  if (activeFilter === 'all') {
    return true;
  }

  if (activeFilter === 'income' || activeFilter === 'expense') {
    return transaction.type === activeFilter;
  }

  return transaction.paymentType === activeFilter;
}

function groupTransactions(transactions: MockTransaction[]) {
  return transactionGroupOrder
    .map((groupKey) => {
      const groupItems = transactions.filter(
        (transaction) => transaction.groupKey === groupKey,
      );

      return {
        key: groupKey,
        label: groupItems[0]?.groupLabel ?? '',
        transactions: groupItems,
      };
    })
    .filter((group) => group.transactions.length > 0);
}

export function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] =
    useState<MockTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] =
    useState<MockTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const summary = useMemo(
    () => getTransactionsSummary(transactions),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(transaction.description).includes(normalizedSearch);
      const matchesFilter = transactionMatchesFilter(transaction, activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, searchTerm, transactions]);

  const transactionGroups = useMemo(
    () => groupTransactions(filteredTransactions),
    [filteredTransactions],
  );

  function handleCreateClick() {
    navigate('/transactions/new');
  }

  function handleMenuClick(transaction: MockTransaction) {
    setSelectedTransaction(transaction);
    setActionSheetOpen(true);
  }

  function handleEditClick() {
    if (!selectedTransaction) {
      return;
    }

    navigate(`/transactions/new?edit=${selectedTransaction.id}`);
  }

  function handleDuplicateClick() {
    if (!selectedTransaction) {
      return;
    }

    const duplicatedTransaction: MockTransaction = {
      ...selectedTransaction,
      id: `transaction-${Date.now()}`,
      timeLabel: 'Agora',
    };

    setTransactions((currentTransactions) => {
      const selectedIndex = currentTransactions.findIndex(
        (transaction) => transaction.id === selectedTransaction.id,
      );

      if (selectedIndex < 0) {
        return [...currentTransactions, duplicatedTransaction];
      }

      return [
        ...currentTransactions.slice(0, selectedIndex + 1),
        duplicatedTransaction,
        ...currentTransactions.slice(selectedIndex + 1),
      ];
    });
  }

  function handleDeleteClick() {
    setDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (!selectedTransaction) {
      return;
    }

    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) => transaction.id !== selectedTransaction.id,
      ),
    );
    setSelectedTransaction(null);
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.36rem] font-bold leading-tight text-app-text">
            Movimentações
          </h1>
          <p className="mt-1 text-[0.8rem] leading-5 text-app-muted">
            Todas as suas entradas e saídas
          </p>
        </div>

        <button
          type="button"
          aria-label="Nova compra"
          onClick={handleCreateClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_0_0_5px_rgba(34,197,94,0.1),0_10px_24px_rgba(34,197,94,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <TransactionsSummary summary={summary} />

      <TransactionsFilters
        searchTerm={searchTerm}
        activeFilter={activeFilter}
        onSearchChange={setSearchTerm}
        onFilterChange={setActiveFilter}
        onAdvancedFiltersClick={() => setFiltersSheetOpen(true)}
      />

      {transactionGroups.length > 0 ? (
        <div className="space-y-4">
          {transactionGroups.map((group) => (
            <TransactionGroup
              key={group.key}
              label={group.label}
              transactions={group.transactions}
              onMenuClick={handleMenuClick}
            />
          ))}

          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full rounded-2xl border-brand-800/65 bg-brand-950/25 text-[0.8rem] font-semibold text-brand-400 hover:bg-brand-900/45"
            onClick={() => console.log('Carregar mais movimentações')}
          >
            Carregar mais
          </Button>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma movimentação encontrada"
          description="Tente ajustar os filtros ou registre uma nova compra."
          icon={<Search aria-hidden="true" className="h-5 w-5" />}
          action={
            <Button type="button" size="sm" onClick={handleCreateClick}>
              Nova compra
            </Button>
          }
        />
      )}

      <ActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        title={selectedTransaction ? selectedTransaction.description : 'Movimentação'}
        actions={[
          {
            label: 'Editar movimentação',
            description: 'Abrir a tela de compra para edição',
            icon: Edit3,
            onClick: handleEditClick,
          },
          {
            label: 'Duplicar movimentação',
            description: 'Criar uma cópia nesta lista',
            icon: Copy,
            onClick: handleDuplicateClick,
          },
          {
            label: 'Excluir movimentação',
            description: 'Remover esta movimentação',
            icon: Trash2,
            variant: 'danger',
            onClick: handleDeleteClick,
          },
        ]}
      />

      <ActionSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        title="Filtros"
        actions={[
          {
            label: 'Todas as movimentações',
            description: 'Remover filtro rápido',
            icon: LayoutGrid,
            onClick: () => setActiveFilter('all'),
          },
          {
            label: 'Somente cartão',
            description: 'Ver pagamentos por cartão',
            icon: CreditCard,
            onClick: () => setActiveFilter('card'),
          },
          {
            label: 'Somente PIX',
            description: 'Ver pagamentos por PIX',
            icon: Wallet,
            onClick: () => setActiveFilter('pix'),
          },
        ]}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir movimentação"
        description="Tem certeza que deseja excluir esta movimentação?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
