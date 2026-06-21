import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { HistoryOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Tabs, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import TopupRulesPage from './TopupRulesPage'
import TopupSchedulesPage from './TopupSchedulesPage'

const TopupManagementPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return <Flex vertical gap={24}>
    <Card>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('topup.management_title')}</Typography.Title>
        <Button icon={<HistoryOutlined />} onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY))}>{t('topup.history')}</Button>
      </Flex>
    </Card>
    <Tabs
      type="card"
      items={[
        {
          key: 'rules',
          label: t('topup.rules_title', 'Topup Rules'),
          children: <TopupRulesPage />,
        },
        {
          key: 'schedules',
          label: t('topup.schedule_tab', 'Topup Schedules'),
          children: <TopupSchedulesPage />,
        },
      ]}
    />
  </Flex>
}

export default TopupManagementPage
