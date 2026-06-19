import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { DollarOutlined, FileProtectOutlined, ScheduleOutlined } from '@ant-design/icons'

const FinanceAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'manual-topup',
          label: t('topup.manual_title'),
          icon: DollarOutlined,
          url: routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.MANUAL_TOPUP.INDEX),
        },
        {
          key: 'topup-rules',
          label: t('topup.rules_title'),
          icon: FileProtectOutlined,
          url: routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_RULES.INDEX),
        },
        {
          key: 'topup-schedules',
          label: t('topup.schedules_title'),
          icon: ScheduleOutlined,
          url: routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_SCHEDULES.INDEX),
        },
      ],
    },
  ]

  return (
    <RoleDashboardLayout
      homeUrl={routeUrls.BASE_ROUTE.FINANCE_ADMIN()}
      menuSections={menuSections}
    />
  )
}

export default FinanceAdminLayout
