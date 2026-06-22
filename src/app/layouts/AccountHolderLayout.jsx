import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { HistoryOutlined, UserOutlined } from '@ant-design/icons'

const AccountHolderLayout = () => {
  const { t } = useTranslation()
  return (
    <RoleDashboardLayout
      homeUrl={routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()}
      menuSections={[
        {
          items: [
            {
              key: 'profile',
              label: t('account_profile.title'),
              icon: UserOutlined,
              url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.PROFILE.INDEX),
            },
            {
              key: 'transactions',
              label: t('transaction.title'),
              icon: HistoryOutlined,
              url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TRANSACTIONS.INDEX),
            },
          ],
        },
      ]}
    />
  )
}

export default AccountHolderLayout
