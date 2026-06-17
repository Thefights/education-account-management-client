import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'

const CourseAdminLayout = () => <RoleDashboardLayout homeUrl={routeUrls.BASE_ROUTE.COURSE_ADMIN()} />

export default CourseAdminLayout
