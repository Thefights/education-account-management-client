import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import { HistoryOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Tabs, Typography } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ManualTopupPage from './ManualTopupPage'
import TopupRulesPage from './TopupRulesPage'
import TopupSchedulesPage from './TopupSchedulesPage'

const TopupManagementPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tabItems = useMemo(
    () => [
      { key: 'rules', label: t('topup.rules_title'), children: <TopupRulesPage /> },
      { key: 'schedules', label: t('topup.schedules_title'), children: <TopupSchedulesPage /> },
      { key: 'manual', label: t('topup.manual_title'), children: <ManualTopupPage embedded /> },
    ],
    [t]
  )

  return (
    <Card style={{ flex: 1, width: '100%', border: 0, borderRadius: 0 }}>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('topup.management_title')}
          </Typography.Title>
          <Button
            icon={<HistoryOutlined />}
            onClick={() =>
              navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY))
            }
          >
            {t('topup.history')}
          </Button>
        </Flex>
        <Tabs items={tabItems} />
      </Flex>
    </Card>
  )
}

export default TopupManagementPage
