import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { DashboardOutlined, DollarOutlined } from '@ant-design/icons'

const FinanceAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'dashboard',
          label: t('dashboard.navigation.label'),
          icon: DashboardOutlined,
          url: routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.DASHBOARD.INDEX),
        },
        {
          key: 'topup-management',
          label: t('topup.management_title'),
          icon: DollarOutlined,
          url: routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX),
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
