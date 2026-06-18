import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'

const SystemAdminLayout = () => (
  <RoleDashboardLayout homeUrl={routeUrls.BASE_ROUTE.SYSTEM_ADMIN()} />
)

export default SystemAdminLayout
