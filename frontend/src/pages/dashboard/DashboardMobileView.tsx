import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { InvoiceCarousel } from '@/components/dashboard/InvoiceCarousel';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import {
  type DashboardCurrentInvoice,
  type DashboardRecentTransaction,
} from '@/types/dashboard';

type DashboardMobileViewProps = {
  invoices: DashboardCurrentInvoice[];
  invoiceError: string | null;
  invoicesLoading: boolean;
  onAddCard: () => void;
  onRetryInvoices: () => void;
  onRetryTransactions: () => void;
  photoUrl?: string | null;
  transactions: DashboardRecentTransaction[];
  transactionsError: string | null;
  transactionsLoading: boolean;
  userEmail?: string | null;
  userName?: string | null;
};

export function DashboardMobileView({
  invoices,
  invoiceError,
  invoicesLoading,
  onAddCard,
  onRetryInvoices,
  onRetryTransactions,
  photoUrl,
  transactions,
  transactionsError,
  transactionsLoading,
  userEmail,
  userName,
}: DashboardMobileViewProps) {
  return (
    <div className="w-full space-y-5 sm:mx-auto sm:max-w-md">
      <DashboardHeader name={userName} email={userEmail} photoUrl={photoUrl} />
      <InvoiceCarousel
        invoices={invoices}
        loading={invoicesLoading}
        error={invoiceError}
        onRetry={onRetryInvoices}
        onAddCard={onAddCard}
      />
      <RecentTransactions
        transactions={transactions}
        loading={transactionsLoading}
        error={transactionsError}
        onRetry={onRetryTransactions}
      />
    </div>
  );
}
