import { DashboardMobileView } from './DashboardMobileView';
import { useDashboardPageData } from './useDashboardPageData';

export function DashboardPage() {
  const dashboardData = useDashboardPageData();

  return <DashboardMobileView {...dashboardData} />;
}
