import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined, FileDoneOutlined, TeamOutlined } from '@ant-design/icons'

const SchoolAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'course-management',
          label: t('course_management.menu_label'),
          icon: BookOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.INDEX),
        },
        {
          key: 'enrollment-management',
          label: t('enrollment_management.menu_label'),
          icon: TeamOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.ENROLLMENT_MANAGEMENT.INDEX),
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
