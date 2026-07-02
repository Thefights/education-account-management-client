import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  BookOutlined,
  CreditCardOutlined,
  FileProtectOutlined,
  HistoryOutlined,
  MessageOutlined,
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
                label: t('financial_assistance.menu.my_fas'),
                icon: FileProtectOutlined,
                of: [
                  {
                    key: 'my-fas-apply',
                    label: t('financial_assistance.menu.apply'),
                    url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY),
                  },
                  {
                    key: 'my-fas-management',
                    label: t('financial_assistance.menu.management'),
                    url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT),
                  },
                ],
              },
              {
                key: 'ai-support-request',
                label: t('ai_support_request.title.plural'),
                icon: MessageOutlined,
                url: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.AI_SUPPORT_REQUESTS.INDEX),
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
