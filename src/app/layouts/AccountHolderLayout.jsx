import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'

const AccountHolderLayout = () => (
  <RoleDashboardLayout homeUrl={routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()} />
)

export default AccountHolderLayout
