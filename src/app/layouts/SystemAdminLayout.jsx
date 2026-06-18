import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { RobotOutlined } from '@ant-design/icons'

const SystemAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
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
