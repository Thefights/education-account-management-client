import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined } from '@ant-design/icons'

const SchoolAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'course-management',
          label: t('course_management.menu_label'),
          icon: BookOutlined,
          url: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(
            routeUrls.SCHOOL_ADMIN.COURSE_MANAGEMENT.INDEX
          ),
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
