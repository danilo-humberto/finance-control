import { useNewPurchaseDialog } from '@/hooks/useNewPurchaseDialog';

import { DashboardDesktopView } from './DashboardDesktopView';
import { DashboardMobileView } from './DashboardMobileView';
import { useDashboardPageData } from './useDashboardPageData';

export function DashboardPage() {
  const dashboardData = useDashboardPageData();
  const { openNewPurchaseDialog } = useNewPurchaseDialog();

  return (
    <>
      <div className="lg:hidden">
        <DashboardMobileView {...dashboardData} />
      </div>
      <div className="hidden lg:block">
        <DashboardDesktopView
          {...dashboardData}
          onNewPurchase={openNewPurchaseDialog}
        />
      </div>
    </>
  );
}
