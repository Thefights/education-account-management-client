import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined, CreditCardOutlined, FileProtectOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons'

const AccountHolderLayout = () => {
  const { t } = useTranslation()
  return (
    <>
      <RoleDashboardLayout
        homeUrl={routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()}
        menuSections={[
          {
            items: [
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
                label: 'My FAS',
                icon: FileProtectOutlined,
                of: [
                  {
                    key: 'my-fas-apply',
                    label: 'Apply',
                    url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY),
                  },
                  {
                    key: 'my-fas-management',
                    label: 'Management',
                    url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT),
                  },
                ],
              },
            ],
          },
        ]}
      />
    </>
  )
}

export default AccountHolderLayout
