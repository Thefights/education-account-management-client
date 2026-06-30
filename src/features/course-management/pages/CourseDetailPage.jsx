import AssignStudentsDialog from '@/features/enrollment-management/components/AssignStudentsDialog'
import EnrollmentManagementFilterSection from '@/features/enrollment-management/components/EnrollmentManagementFilterSection'
import EnrollmentManagementTableSection from '@/features/enrollment-management/components/EnrollmentManagementTableSection'
import { ApiUrls } from '@/shared/api/apiUrls'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  DollarOutlined,
  GiftOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Descriptions, Divider, Flex, Row, Space, Tag, Typography } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const formatCount = (value) => (value == null ? 0 : Number(value).toLocaleString())

const defaultFilters = { search: '', chargeStatuses: [] }

const getFasSchemeOptionLabel = (scheme) => (
  <Space
    direction="vertical"
    size={2}
    style={{ width: '100%' }}
    onClick={(e) => e.stopPropagation()}
  >
    <Space size={6} wrap>
      <Typography.Text strong>{scheme.schemeName}</Typography.Text>
      {scheme.schemeCode && <Typography.Text code>{scheme.schemeCode}</Typography.Text>}
      {scheme.status && (
        <Tag color={scheme.status === 'Active' ? 'green' : 'default'}>{scheme.status}</Tag>
      )}
    </Space>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {scheme.subsidyType || '-'} · {scheme.isPerComponent ? 'Per component' : 'Standard'} ·{' '}
      {scheme.durationInMonths || 0} months
    </Typography.Text>
  </Space>
)

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const confirm = useConfirm()
  const confirmReason = useReasonConfirm()
  const _enum = useEnum()

  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [openAssign, setOpenAssign] = useState(false)
  const [fasOptionCache, setFasOptionCache] = useState({})

  const courseData = useFetch(ApiUrls.COURSE_MANAGEMENT.DETAIL(id))
  const course = courseData.data
  const removeSelectedEnrollments = useAxiosSubmit({
    url: ApiUrls.ENROLLMENT_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })
  const withdrawEnrollment = useAxiosSubmit({ method: 'PUT' })
  const fetchFasOptions = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX,
    method: 'GET',
  })
  const assignFasSchemes = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.FAS_SCHEMES(id),
    method: 'PUT',
  })

  const canManageEnrollments = course?.status === 'Draft' || course?.status === 'Enrolling'
  const allowWithdraw = course?.status === 'Upcoming' || course?.status === 'InProgress'
  const readOnly = !canManageEnrollments
  const mutationLoading =
    removeSelectedEnrollments.loading ||
    withdrawEnrollment.loading ||
    assignFasSchemes.loading

  const queryParams = useMemo(
    () => ({ courseId: id, sort: `${sort.key} ${sort.direction}`, page, pageSize, ...filters }),
    [id, sort, page, pageSize, filters]
  )

  const enrollments = useFetch(ApiUrls.ENROLLMENT_MANAGEMENT.INDEX, queryParams, [queryParams])
  const selectedFasIds = useMemo(
    () => (course?.applicableFasSchemes || []).map((scheme) => scheme.id),
    [course?.applicableFasSchemes]
  )
  const selectedFasOptions = useMemo(
    () => {
      const schemesById = {
        ...(course?.applicableFasSchemes || []).reduce(
          (map, scheme) => ({ ...map, [String(scheme.id)]: scheme }),
          {}
        ),
        ...fasOptionCache,
      }
      return Object.values(schemesById).map((scheme) => ({
        value: scheme.id,
        label: getFasSchemeOptionLabel(scheme),
        searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
      }))
    },
    [course?.applicableFasSchemes, fasOptionCache]
  )

  const clearSelection = () => setSelectedIds([])

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
    clearSelection()
  }

  const handleSort = (value) => {
    setSort(value)
    clearSelection()
  }
  const handlePage = (value) => {
    setPage(value)
    clearSelection()
  }
  const handlePageSize = (value) => {
    setPageSize(value)
    clearSelection()
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    const reason = await confirmReason({
      title: t('enrollment_management.confirm.delete_selected_title'),
      description: t('enrollment_management.confirm.delete_selected_description', {
        count: selectedIds.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!reason) return

    const response = await removeSelectedEnrollments.submit({
      overrideData: { ids: selectedIds, reason },
    })
    if (!response) return

    clearSelection()
    await enrollments.fetch()
    await courseData.fetch()
  }

  const handleAssigned = async () => {
    await enrollments.fetch()
    await courseData.fetch()
  }

  const loadFasOptions = useCallback(
    async ({ search, page, pageSize }) => {
      const response = await fetchFasOptions.submit({
        overrideParam: { search, page, pageSize },
      })
      const result = response?.data
      const schemes = result?.collection || []
      setFasOptionCache((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...schemes.map((scheme) => [String(scheme.id), scheme]),
        ])
      )
      return {
        options: schemes.map((scheme) => ({
          value: scheme.id,
          label: getFasSchemeOptionLabel(scheme),
          searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
        })),
        totalCount: result?.totalCount || 0,
      }
    },
    [fetchFasOptions.submit]
  )

  const handleFasAssigned = async (fasSchemeIds) => {
    const response = await assignFasSchemes.submit({ overrideData: { fasSchemeIds } })
    if (!response) return
    await courseData.fetch()
  }

  const { renderField: renderFasField } = useFieldRenderer(
    { fasSchemeIds: selectedFasIds },
    (key, value) => {
      if (key === 'fasSchemeIds') handleFasAssigned(value || [])
    },
    (event) => {
      if (event?.target?.name === 'fasSchemeIds') handleFasAssigned(event.target.value || [])
    }
  )

  const fasField = useMemo(
    () => ({
      key: 'fasSchemeIds',
      title: t('course_management.title.applicable_fas'),
      type: 'select',
      multiple: true,
      required: false,
      placeholder: 'Select one or more FAS schemes',
      options: selectedFasOptions,
      loadOptions: loadFasOptions,
      renderOptionValue: (value) =>
        fasOptionCache[String(value)]?.schemeName ||
        (course?.applicableFasSchemes || []).find((scheme) => String(scheme.id) === String(value))
          ?.schemeName ||
        String(value),
    }),
    [course?.applicableFasSchemes, fasOptionCache, loadFasOptions, selectedFasOptions, t]
  )

  const handleWithdraw = async (enrollment) => {
    const accepted = await confirm({
      title: t('enrollment_management.confirm.withdraw_title'),
      description: t('enrollment_management.confirm.withdraw_description', {
        name: enrollment.citizenFullName,
      }),
      confirmText: t('enrollment_management.action.withdraw'),
    })
    if (!accepted) return

    const response = await withdrawEnrollment.submit({
      overrideUrl: ApiUrls.ENROLLMENT_MANAGEMENT.WITHDRAW(enrollment.id),
    })
    if (!response) return

    await enrollments.fetch()
  }

  const renderStatus = (status) => {
    if (!status) return null
    const option = _enum.courseStatusOptions.find((opt) => opt.value === status)
    const text = option ? option.label : status
    return (
      <Tag
        color={defaultManagementStatusStyle(status)}
        style={{ margin: 0, padding: '4px 12px', fontSize: 14 }}
      >
        {text}
      </Tag>
    )
  }

  return (
    <Flex vertical gap={24}>
      <Flex align="center" gap={16}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('course_management.title.management')}
        </Typography.Title>
      </Flex>

      <Card loading={courseData.loading} variant="borderless">
        {course && (
          <Flex vertical gap={24}>
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
              <Space orientation="vertical" size={8}>
                <Space align="center" size={16}>
                  <Typography.Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                    {course.courseName}
                  </Typography.Title>
                  {renderStatus(course.status)}
                </Space>
                <Space separator={<Divider orientation="vertical" />} style={{ color: '#595959' }}>
                  <Space>
                    <ReadOutlined />
                    <Typography.Text keyboard>{course.courseCode}</Typography.Text>
                  </Space>
                  <Typography.Text type="secondary">
                    {t('course_management.field.id')}: #{course.id}
                  </Typography.Text>
                </Space>
              </Space>
            </Flex>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <DollarOutlined style={{ color: '#52c41a' }} />
                      <span>{t('course_management.field.total_fee_amount')}</span>
                    </Space>
                  }
                  size="small"
                  variant="outlined"
                >
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item label={t('course_management.field.course_fee_amount')}>
                      {formatCurrencyBasedOnCurrentLanguage(course.courseFeeAmount)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.misc_fee_amount')}>
                      {formatCurrencyBasedOnCurrentLanguage(course.miscFeeAmount)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.gst_amount')}>
                      {formatCurrencyBasedOnCurrentLanguage(course.gstAmount)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.total_fee_amount')}>
                      <Typography.Text strong style={{ color: '#cf1322' }}>
                        {formatCurrencyBasedOnCurrentLanguage(course.totalFeeAmount)}
                      </Typography.Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined style={{ color: '#1677ff' }} />
                      <span>{t('course_management.title.important_dates')}</span>
                    </Space>
                  }
                  size="small"
                  variant="outlined"
                >
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item label={t('course_management.field.enrollment_deadline')}>
                      {formatDatetimeStringBasedOnCurrentLanguage(course.enrollmentDeadline) || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.start_date')}>
                      {formatDatetimeStringBasedOnCurrentLanguage(course.startDate) || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.end_date')}>
                      {formatDatetimeStringBasedOnCurrentLanguage(course.endDate) || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            <Card
              title={
                <Flex justify="space-between" align="center" gap={12}>
                  <Space>
                    <GiftOutlined style={{ color: '#722ed1' }} />
                    <span>{t('course_management.title.applicable_fas')}</span>
                  </Space>
                </Flex>
              }
              size="small"
              variant="outlined"
            >
              {course.applicableFasSchemes?.length ? (
                <Space wrap>
                  {course.applicableFasSchemes.map((scheme) => (
                    <Tag key={scheme.id} color="purple" style={{ padding: '4px 10px' }}>
                      {scheme.schemeCode} · {scheme.schemeName}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary">
                  {t('course_management.message.no_applicable_fas')}
                </Typography.Text>
              )}
              {!readOnly && (
                <div style={{ maxWidth: 520, marginTop: 16 }}>
                  {renderFasField({
                    ...fasField,
                    props: { disabled: assignFasSchemes.loading },
                  })}
                </div>
              )}
            </Card>
          </Flex>
        )}
      </Card>

      <Card variant="borderless">
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            <Space align="baseline">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t(
                  canManageEnrollments
                    ? 'enrollment_management.action.manage_students'
                    : 'enrollment_management.action.view_students'
                )}
              </Typography.Title>
              <Tag color="blue" style={{ borderRadius: 12 }}>
                {formatCount(course?.enrollmentCount)}{' '}
                {t('course_management.field.enrollment_count')}
              </Tag>
            </Space>

            {!readOnly && (
              <Space>
                <Button type="primary" onClick={() => setOpenAssign(true)}>
                  {t('enrollment_management.title.assign_students')}
                </Button>
              </Space>
            )}
          </Flex>

          <EnrollmentManagementFilterSection
            filters={filters}
            loading={enrollments.loading}
            onFilter={handleFilter}
            onReset={() => handleFilter(defaultFilters)}
            showCourse={false}
          />

          <EnrollmentManagementTableSection
            enrollments={enrollments.data?.collection}
            loading={enrollments.loading || mutationLoading}
            sort={sort}
            setSort={handleSort}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}

            onWithdraw={handleWithdraw}
            showCourse={false}
            showGrossAmount={false}
            readOnly={readOnly}
            allowWithdraw={allowWithdraw}
          />

          <GenericTablePagination
            totalCount={enrollments.data?.totalCount}
            totalPage={enrollments.data?.totalPage}
            page={page}
            setPage={handlePage}
            pageSize={pageSize}
            setPageSize={handlePageSize}
            loading={enrollments.loading}
          />

          {!readOnly && (
            <BulkActionBar
              selectedCount={selectedIds.length}
              loading={mutationLoading}
              onClear={clearSelection}
              actions={[
                {
                  key: 'delete',
                  label: t('enrollment_management.action.delete_selected'),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: handleDeleteSelected,
                },
              ]}
            />
          )}
        </Flex>
      </Card>

      <AssignStudentsDialog
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        fixedCourse={course}
        onAssigned={handleAssigned}
      />
    </Flex>
  )
}

export default CourseDetailPage
