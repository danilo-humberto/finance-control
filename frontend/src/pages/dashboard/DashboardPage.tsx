import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { InvoiceCarousel } from '@/components/dashboard/InvoiceCarousel';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import {
  mockCurrentInvoices,
  mockRecentTransactions,
  mockUser,
} from '@/mocks/financeMocks';

export function DashboardPage() {
  return (
    <div className="w-full space-y-5 sm:mx-auto sm:max-w-md">
      <DashboardHeader user={mockUser} />
      <InvoiceCarousel invoices={mockCurrentInvoices} />
      <RecentTransactions transactions={mockRecentTransactions} />
    </div>
  );
}
