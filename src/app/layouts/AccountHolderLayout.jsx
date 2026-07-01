import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  BookOutlined,
  CreditCardOutlined,
  FileProtectOutlined,
  HistoryOutlined,
} from '@ant-design/icons'

import ChatbotWidget from '@/shared/components/ChatbotWidget/ChatbotWidget'

const AccountHolderLayout = () => {
  const { t } = useTranslation()
  return (
    <>
      <RoleDashboardLayout
        homeUrl={routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()}
        userMenuItems={[
          {
            key: 'transaction-history',
            label: t('transaction.title'),
            icon: <HistoryOutlined />,
            url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TRANSACTION_HISTORY.INDEX),
          },
        ]}
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
      <ChatbotWidget />
    </>
  )
}

export default AccountHolderLayout
