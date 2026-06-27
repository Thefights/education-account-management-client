import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { HistoryOutlined, UserOutlined, BookOutlined, CreditCardOutlined } from '@ant-design/icons'
import { AIPopover } from '@/features/slabbot-chat-ai/Popover/AIPopover'



const AccountHolderLayout = () => {
  const { t } = useTranslation()
  return (
    <>
      <AIPopover  /> 

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
            ],
          },
        ]}
      />
    
    
    </>


  )
}

export default AccountHolderLayout
