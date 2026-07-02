import {
  DashboardDataTable,
  DashboardKpiCard,
  DashboardLinkButton,
  DashboardPage,
  DashboardSectionCard,
  DashboardGroupedTrend,
  DashboardState,
  DashboardStatusList,
} from '@/features/dashboard/components/DashboardWidgets'
import {
  formatDashboardDate,
  formatDashboardDateTime,
  formatDashboardNumber,
} from '@/features/dashboard/utils/dashboardFormatters'
import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultSweepTargetStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined, ExceptionOutlined, FieldTimeOutlined, IdcardOutlined } from '@ant-design/icons'
import { Col, Row, Select, theme } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SystemAdminDashboardPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const [rangeDays, setRangeDays] = useState(30)
  const dashboardParams = useMemo(() => ({ rangeDays }), [rangeDays])
  const rangeOptions = useMemo(
    () => [
      { label: t('dashboard.common.last_7_days'), value: 7 },
      { label: t('dashboard.common.last_30_days'), value: 30 },
    ],
    [t]
  )
  const dashboard = useFetch(
    ApiUrls.DASHBOARD_MANAGEMENT.SYSTEM_ADMIN,
    dashboardParams,
    [rangeDays]
  )
  const data = dashboard.data || {}
  const lifecycleSeries = [
    { key: 'createdCount', label: t('dashboard.system.created'), color: '#2563eb' },
    { key: 'closedCount', label: t('dashboard.system.closed'), color: '#94a3b8' },
    { key: 'extendedCount', label: t('dashboard.system.extended'), color: '#14b8a6' },
    { key: 'failedCount', label: t('dashboard.system.failed'), color: '#ef4444' },
  ]

  const reportColumns = [
    {
      title: t('dashboard.system.report_date'),
      dataIndex: 'batchDate',
      render: formatDashboardDate,
    },
    {
      title: t('dashboard.system.created'),
      dataIndex: 'createdCount',
      align: 'right',
      render: formatDashboardNumber,
    },
    {
      title: t('dashboard.system.failed'),
      dataIndex: 'failedCount',
      align: 'right',
      render: formatDashboardNumber,
    },
    {
      title: t('dashboard.system.closed'),
      dataIndex: 'closedCount',
      align: 'right',
      render: formatDashboardNumber,
    },
    {
      title: t('dashboard.system.extended'),
      dataIndex: 'extendedCount',
      align: 'right',
      render: formatDashboardNumber,
    },
  ]

  const exceptionItems = [
    {
      label: t('dashboard.system.failed_account_records'),
      description: t('dashboard.system.failed_account_records_desc'),
      count: formatDashboardNumber(data.openFailedRecordCount),
      status: t('dashboard.common.action'),
      statusColor: defaultSweepTargetStatusStyle('Failed'),
      background: token.colorErrorBg,
      color: token.colorError,
    },
    {
      label: t('dashboard.system.daily_account_creation'),
      description: t('dashboard.system.next_run', {
        value: formatDashboardDateTime(data.nextDailyCreationRunAt),
      }),
      count: formatDashboardNumber(data.pendingDailyCreationCount),
      status: t('dashboard.common.monitor'),
      statusColor: defaultSweepTargetStatusStyle('Pending'),
      background: token.colorWarningBg,
      color: token.colorWarning,
    },
    {
      label: t('dashboard.system.success_rate_healthy'),
      description: t('dashboard.system.latest_lifecycle_status'),
      count: t('dashboard.system.stable_score'),
      status: t('dashboard.common.stable'),
      statusColor: defaultSweepTargetStatusStyle('Success'),
      background: token.colorSuccessBg,
      color: token.colorSuccess,
    },
  ]

  return (
    <DashboardPage
      eyebrow={t('dashboard.system.eyebrow')}
      title={t('dashboard.system.title')}
      description={t('dashboard.system.description')}
      action={
        <Select
          size="large"
          options={rangeOptions}
          value={rangeDays}
          onChange={setRangeDays}
          style={{ minWidth: 160 }}
        />
      }
    >
      <DashboardState loading={dashboard.loading} error={dashboard.error}>
        <Row gutter={[18, 18]}>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.system.active_accounts')}
              value={formatDashboardNumber(data.activeAccountCount)}
              subtitle={t('dashboard.system.accounts_created_today', {
                value: formatDashboardNumber(data.accountCreatedTodayCount),
              })}
              icon={<IdcardOutlined />}
            />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.system.active_schools')}
              value={formatDashboardNumber(data.activeSchoolCount)}
              subtitle={t('dashboard.system.schools_operational')}
              icon={<BankOutlined />}
              tone="green"
            />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.system.failed_records')}
              value={formatDashboardNumber(data.openFailedRecordCount)}
              subtitle={t('dashboard.system.handling_required')}
              icon={<ExceptionOutlined />}
              tone="red"
            />
          </Col>
          <Col xs={24} md={12} xl={6}>
            <DashboardKpiCard
              title={t('dashboard.system.daily_account_creation')}
              value={formatDashboardNumber(data.pendingDailyCreationCount)}
              subtitle={t('dashboard.system.next_midnight')}
              icon={<FieldTimeOutlined />}
              tone="orange"
            />
          </Col>
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={12}>
            <DashboardSectionCard
              title={t('dashboard.system.lifecycle_trend')}
              description={t('dashboard.system.lifecycle_trend_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(
                      routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.ACCOUNT_CREATION_REPORT.INDEX)
                    )
                  }
                >
                  {t('dashboard.system.open_account_creation_report')}
                </DashboardLinkButton>
              }
            >
              <DashboardGroupedTrend
                points={data.accountLifecycleTrend || []}
                series={lifecycleSeries}
                maxPoints={rangeDays}
              />
            </DashboardSectionCard>
          </Col>
          <Col xs={24} xl={12}>
            <DashboardSectionCard
              title={t('dashboard.system.exceptions_title')}
              description={t('dashboard.system.exceptions_desc')}
            >
              <DashboardStatusList items={exceptionItems} />
            </DashboardSectionCard>
          </Col>
        </Row>

        <DashboardSectionCard
          title={t('dashboard.system.latest_reports')}
          description={t('dashboard.system.latest_reports_desc')}
          action={
            <DashboardLinkButton
              onClick={() =>
                navigate(routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.ACCOUNT_CREATION_REPORT.INDEX))
              }
            >
              {t('dashboard.system.full_report')}
            </DashboardLinkButton>
          }
        >
          <DashboardDataTable
            rowKey="batchDate"
            columns={reportColumns}
            dataSource={data.latestReports || []}
          />
        </DashboardSectionCard>
      </DashboardState>
    </DashboardPage>
  )
}

export default SystemAdminDashboardPage
