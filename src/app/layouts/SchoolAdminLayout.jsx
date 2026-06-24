import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined, TeamOutlined } from '@ant-design/icons'

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
          key: 'school-student-management',
          label: t('school_student.title.management'),
          icon: TeamOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX),
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
