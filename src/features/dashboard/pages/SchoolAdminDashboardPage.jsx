import {
  DashboardDataTable,
  DashboardDonutBreakdown,
  DashboardKpiCard,
  DashboardLinkButton,
  DashboardPage,
  DashboardSectionCard,
  DashboardState,
  DashboardStatusList,
} from '@/features/dashboard/components/DashboardWidgets'
import {
  formatDashboardDate,
  formatDashboardNumber,
  getEnumLabel,
} from '@/features/dashboard/utils/dashboardFormatters'
import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import {
  defaultFasStatusStyle,
  defaultManagementStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BookOutlined, CheckOutlined, TeamOutlined } from '@ant-design/icons'
import { Col, Row, Tag, theme } from 'antd'
import { useNavigate } from 'react-router-dom'

const SchoolAdminDashboardPage = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const { courseStatusOptions, fasApplicationStatusOptions } = useEnum()
  const dashboard = useFetch(ApiUrls.DASHBOARD_MANAGEMENT.SCHOOL_ADMIN)
  const data = dashboard.data || {}

  const courseDistribution = (data.courseStatusDistribution || []).map((item) => {
    const label =
      item.status === 'Active'
        ? t('dashboard.school.course_active')
        : getEnumLabel(courseStatusOptions, item.status || item.label)
    return { ...item, label }
  })

  const fasStatusItems = (data.fasStatusSummary || []).map((item) => ({
    label: getEnumLabel(fasApplicationStatusOptions, item.status),
    description: t(`dashboard.school.fas_status_desc.${String(item.status || '').toLowerCase()}`),
    count: formatDashboardNumber(item.count),
    status: getEnumLabel(fasApplicationStatusOptions, item.status),
    statusColor: defaultFasStatusStyle(item.status),
    background:
      item.status === 'Pending'
        ? token.colorWarningBg
        : item.status === 'Approved'
          ? token.colorSuccessBg
          : token.colorErrorBg,
    color:
      item.status === 'Pending'
        ? token.colorWarning
        : item.status === 'Approved'
          ? token.colorSuccess
          : token.colorError,
  }))

  const courseColumns = [
    {
      title: t('dashboard.school.course'),
      dataIndex: 'courseName',
    },
    {
      title: t('dashboard.school.start_date'),
      dataIndex: 'startDate',
      render: formatDashboardDate,
    },
    {
      title: t('dashboard.common.status'),
      dataIndex: 'status',
      render: (value) => (
        <Tag color={defaultManagementStatusStyle(value)}>
          {getEnumLabel(courseStatusOptions, value)}
        </Tag>
      ),
    },
    {
      title: t('dashboard.school.enrollments'),
      dataIndex: 'enrollmentCount',
      align: 'right',
      render: formatDashboardNumber,
    },
  ]

  const fasColumns = [
    {
      title: t('dashboard.school.application_no'),
      dataIndex: 'applicationNumber',
    },
    {
      title: t('dashboard.school.account_name'),
      dataIndex: 'accountName',
    },
    {
      title: t('dashboard.school.scheme'),
      dataIndex: 'schemeName',
    },
    {
      title: t('dashboard.school.submitted'),
      dataIndex: 'submittedAt',
      render: formatDashboardDate,
    },
  ]

  return (
    <DashboardPage
      eyebrow={t('dashboard.school.eyebrow')}
      title={data.schoolName || t('dashboard.school.title')}
      description={t('dashboard.school.description')}
      action={<Tag color="blue">{t('dashboard.common.current_month')}</Tag>}
    >
      <DashboardState loading={dashboard.loading} error={dashboard.error}>
        <Row gutter={[18, 18]}>
          <Col xs={24} md={8}>
            <DashboardKpiCard
              title={t('dashboard.school.active_students')}
              value={formatDashboardNumber(data.activeStudentCount)}
              subtitle={t('dashboard.school.status_active')}
              icon={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <DashboardKpiCard
              title={t('dashboard.school.active_courses')}
              value={formatDashboardNumber(data.activeCourseCount)}
              subtitle={t('dashboard.school.draft_courses', {
                value:
                  courseDistribution.find((item) => item.status === 'Draft')?.count ??
                  0,
              })}
              icon={<BookOutlined />}
              tone="green"
            />
          </Col>
          <Col xs={24} md={8}>
            <DashboardKpiCard
              title={t('dashboard.school.pending_fas')}
              value={formatDashboardNumber(data.pendingFasApplicationCount)}
              subtitle={t('dashboard.school.status_pending')}
              icon={<CheckOutlined />}
              tone="orange"
            />
          </Col>
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={15}>
            <DashboardSectionCard
              title={t('dashboard.school.course_distribution')}
              description={t('dashboard.school.course_distribution_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.INDEX))
                  }
                >
                  {t('dashboard.school.view_courses')}
                </DashboardLinkButton>
              }
            >
              <DashboardDonutBreakdown
                totalLabel={t('dashboard.school.courses')}
                total={formatDashboardNumber(
                  courseDistribution.reduce((sum, item) => sum + Number(item.count || 0), 0)
                )}
                items={courseDistribution}
              />
            </DashboardSectionCard>
          </Col>
          <Col xs={24} xl={9}>
            <DashboardSectionCard
              title={t('dashboard.school.fas_status')}
              description={t('dashboard.school.fas_status_desc_title')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.APPLICATIONS))
                  }
                >
                  {t('dashboard.school.open_queue')}
                </DashboardLinkButton>
              }
            >
              <DashboardStatusList items={fasStatusItems} />
            </DashboardSectionCard>
          </Col>
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={12}>
            <DashboardSectionCard
              title={t('dashboard.school.upcoming_courses')}
              description={t('dashboard.school.upcoming_courses_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.INDEX))
                  }
                >
                  {t('dashboard.school.view_all_courses')}
                </DashboardLinkButton>
              }
            >
              <DashboardDataTable columns={courseColumns} dataSource={data.upcomingCourses || []} />
            </DashboardSectionCard>
          </Col>
          <Col xs={24} xl={12}>
            <DashboardSectionCard
              title={t('dashboard.school.pending_queue')}
              description={t('dashboard.school.pending_queue_desc')}
              action={
                <DashboardLinkButton
                  onClick={() =>
                    navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.APPLICATIONS))
                  }
                >
                  {t('dashboard.school.open_queue')}
                </DashboardLinkButton>
              }
            >
              <DashboardDataTable columns={fasColumns} dataSource={data.pendingFasQueue || []} />
            </DashboardSectionCard>
          </Col>
        </Row>
      </DashboardState>
    </DashboardPage>
  )
}

export default SchoolAdminDashboardPage
