import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined, CreditCardOutlined, FileProtectOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons'

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
            {
              key: 'cousre-management',
              label: t('course_management.menu_label'),
              icon: BookOutlined,
              url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.COURSE_MANAGEMENT.INDEX),
            },
            {
              key: 'tuition',
              label: t('tuition-payment.title'),
              icon: CreditCardOutlined,
              url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX),
            },
            {
              key: 'my-fas',
              label: t('my_fas.title'),
              icon: FileProtectOutlined,
              of: [
                {
                  key: 'my-fas-apply',
                  label: t('my_fas.apply'),
                  url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY),
                },
                {
                  key: 'my-fas-management',
                  label: t('my_fas.management'),
                  url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT),
                },
              ],
            },
          ],
        },
      ]}
    />
  )
}

export default AccountHolderLayout
