import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'

const FinanceAdminLayout = () => (
  <RoleDashboardLayout homeUrl={routeUrls.BASE_ROUTE.FINANCE_ADMIN()} />
)

export default FinanceAdminLayout
