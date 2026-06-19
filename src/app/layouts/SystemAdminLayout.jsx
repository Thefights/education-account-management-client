import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons'

const SystemAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'school-management',
          label: t('school_management.menu_label'),
          icon: BankOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.SYSTEM_ADMIN.SCHOOL_MANAGEMENT.INDEX),
        },
        {
          key: 'admin-management',
          label: t('admin_management.menu_label'),
          icon: TeamOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.SYSTEM_ADMIN.ADMIN_MANAGEMENT.INDEX),
        },
        {
          key: 'ai-assistant-setting',
          label: t('ai_assistant_setting.menu_label'),
          icon: RobotOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(
            routeUrls.SYSTEM_ADMIN.AI_ASSISTANT_SETTING.INDEX
          ),
        },
      ],
    },
  ]

  return (
    <RoleDashboardLayout
      homeUrl={routeUrls.BASE_ROUTE.SYSTEM_ADMIN()}
      menuSections={menuSections}
    />
  )
}

export default SystemAdminLayout
