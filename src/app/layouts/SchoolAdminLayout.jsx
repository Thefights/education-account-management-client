import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined, DashboardOutlined, FileDoneOutlined, TeamOutlined } from '@ant-design/icons'

const SchoolAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'dashboard',
          label: t('dashboard.navigation.label'),
          icon: DashboardOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.DASHBOARD.INDEX),
        },
        {
          key: 'course-management',
          label: t('course_management.menu_label'),
          icon: BookOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.INDEX),
        },
        {
          key: 'school-student-management',
          label: t('school_student.title.management'),
          icon: TeamOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX),
        },
        {
          key: 'fas',
          label: 'FAS',
          icon: FileDoneOutlined,
          of: [
            {
              key: 'fas-schemes',
              label: 'Scheme',
              url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEMES),
            },
            {
              key: 'fas-applications',
              label: 'Application',
              url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.APPLICATIONS),
            },
          ],
        },
      ],
    },
  ]

  return (
    <RoleDashboardLayout
      homeUrl={routeUrls.BASE_ROUTE.SCHOOL_ADMIN()}
      menuSections={menuSections}
    />
  )
}

export default SchoolAdminLayout
