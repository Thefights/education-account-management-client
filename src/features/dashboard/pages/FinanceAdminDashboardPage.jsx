import {
  DashboardDataTable,
  DashboardDonutBreakdown,
  DashboardKpiCard,
  DashboardLinkButton,
  DashboardLineTrend,
  DashboardPage,
  DashboardSectionCard,
  DashboardState,
} from '@/features/dashboard/components/DashboardWidgets'
import {
  formatDashboardCurrency,
  formatDashboardDateTime,
  formatDashboardNumber,
  formatDashboardPercent,
  getEnumLabel,
} from '@/features/dashboard/utils/dashboardFormatters'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import {
  defaultTopupExecutionSourceStyle,
  defaultTopupExecutionStatusStyle,
  defaultTopupStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons'
import { Col, Row, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'

const FinanceAdminDashboardPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    topupExecutionSourceTypeOptions,
    topupExecutionStatusOptions,
    scheduleTopupFrequencyOptions,
    scheduleTopupStatusOptions,
  } = useEnum()
  const dashboard = useFetch(ApiUrls.DASHBOARD_MANAGEMENT.FINANCE_ADMIN, {
    rangeDays: EnumConfig.DashboardRangeDays.LastSevenDays,
  })
  const data = dashboard.data || {}
  const executionTrendSeries = [
    {
      key: 'amount',
      label: t('dashboard.finance.executed_amount'),
      color: '#2563eb',
      formatValue: formatDashboardCurrency,
    },
    {
      key: 'count',
      label: t('dashboard.finance.failed_targets'),
      color: '#ef4444',
      formatValue: formatDashboardNumber,
      scaleMax: 20,
      showMarkers: false,
    },
  ]

  const sourceMix = (data.sourceMix || []).map((item) => ({
    ...item,
    label: getEnumLabel(topupExecutionSourceTypeOptions, item.status || item.label),
  }))

  const executionColumns = [
    {
      title: t('dashboard.finance.execution_code'),
      dataIndex: 'executionCode',
    },
    {
      title: t('dashboard.finance.source'),
      dataIndex: 'sourceType',
      render: (value) => (
        <Tag color={defaultTopupExecutionSourceStyle(value)}>
          {getEnumLabel(topupExecutionSourceTypeOptions, value)}
        </Tag>
      ),
    },
    {
      title: t('dashboard.common.status'),
      dataIndex: 'status',
      render: (value) => (
        <Tag color={defaultTopupExecutionStatusStyle(value)}>
          {getEnumLabel(topupExecutionStatusOptions, value)}
        </Tag>
      ),
    },
    {
      title: t('dashboard.finance.amount'),
      dataIndex: 'totalExecutedAmount',
      align: 'right',
      render: formatDashboardCurrency,
    },
    {
      title: t('dashboard.finance.executed_at'),
      dataIndex: 'createdAt',
      render: formatDashboardDateTime,
    },
  ]

  const scheduleColumns = [
    {
      title: t('dashboard.finance.schedule_name'),
      dataIndex: 'name',
    },
    {
      title: t('dashboard.finance.frequency'),
      dataIndex: 'frequency',
      render: (value) => getEnumLabel(scheduleTopupFrequencyOptions, value),
    },
    {
      title: t('dashboard.common.status'),
      dataIndex: 'status',
      render: (value) => (
        <Tag color={defaultTopupStatusStyle(value)}>{getEnumLabel(scheduleTopupStatusOptions, value)}</Tag>
      ),
    },
    {
      title: t('dashboard.finance.next_execution'),
      dataIndex: 'nextExecutionAt',
      render: formatDashboardDateTime,
    },
  ]

  return (
    <DashboardPage
      eyebrow={t('dashboard.finance.eyebrow')}
      title={t('dashboard.finance.title')}
      description={t('dashboard.finance.description')}
      action={<Tag color="blue">{t('dashboard.common.last_7_days')}</Tag>}
    >
      <DashboardState loading={dashboard.loading} error={dashboard.error}>
        <Row gutter={[18, 18]}>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.finance.executed_amount')}
              value={formatDashboardCurrency(data.executedAmount)}
              subtitle={t('dashboard.finance.current_period')}
              icon={<DollarOutlined />}
            />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.finance.successful_targets')}
              value={formatDashboardNumber(data.successfulTargetCount)}
              subtitle={t('dashboard.finance.successful_targets_desc')}
              icon={<CheckCircleOutlined />}
              tone="green"
            />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.finance.failed_targets')}
              value={formatDashboardNumber(data.failedTargetCount)}
              subtitle={t('dashboard.finance.failed_targets_desc')}
              icon={<WarningOutlined />}
              tone="red"
            />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.finance.success_rate')}
              value={formatDashboardPercent(data.successRate)}
              subtitle={t('dashboard.finance.success_rate_desc')}
              icon={<ClockCircleOutlined />}
              tone="orange"
            />
          </Col>
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={14}>
            <DashboardSectionCard
              title={t('dashboard.finance.execution_trend')}
              description={t('dashboard.finance.execution_trend_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY))
                  }
                >
                  {t('dashboard.finance.view_history')}
                </DashboardLinkButton>
              }
            >
              <DashboardLineTrend
                points={data.executionTrend || []}
                series={executionTrendSeries}
                maxPoints={14}
              />
            </DashboardSectionCard>
          </Col>
          <Col xs={24} xl={10}>
            <DashboardSectionCard
              title={t('dashboard.finance.source_mix')}
              description={t('dashboard.finance.source_mix_desc')}
            >
              <DashboardDonutBreakdown
                totalLabel={t('dashboard.finance.executions')}
                total={formatDashboardNumber(
                  sourceMix.reduce((sum, item) => sum + Number(item.count || 0), 0)
                )}
                items={sourceMix}
              />
            </DashboardSectionCard>
          </Col>
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={14}>
            <DashboardSectionCard
              title={t('dashboard.finance.recent_executions')}
              description={t('dashboard.finance.recent_executions_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY))
                  }
                >
                  {t('dashboard.finance.view_history')}
                </DashboardLinkButton>
              }
            >
              <DashboardDataTable columns={executionColumns} dataSource={data.recentExecutions || []} />
            </DashboardSectionCard>
          </Col>
          <Col xs={24} xl={10}>
            <DashboardSectionCard
              title={t('dashboard.finance.upcoming_schedules')}
              description={t('dashboard.finance.upcoming_schedules_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(
                      `${routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX)}?tab=schedules`
                    )
                  }
                >
                  {t('dashboard.finance.manage_schedules')}
                </DashboardLinkButton>
              }
            >
              <DashboardDataTable columns={scheduleColumns} dataSource={data.upcomingSchedules || []} />
            </DashboardSectionCard>
          </Col>
        </Row>
      </DashboardState>
    </DashboardPage>
  )
}

export default FinanceAdminDashboardPage
