import AssignStudentsDialog from '@/features/enrollment-management/components/AssignStudentsDialog'
import EnrollmentManagementFilterSection from '@/features/enrollment-management/components/EnrollmentManagementFilterSection'
import EnrollmentManagementTableSection from '@/features/enrollment-management/components/EnrollmentManagementTableSection'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useConfirm from '@/shared/hooks/useConfirm'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Descriptions, Divider, Flex, Row, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const formatCount = (value) => (value == null ? 0 : Number(value).toLocaleString())

const defaultFilters = { search: '', chargeStatuses: [] }

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const confirm = useConfirm()
  const _enum = useEnum()

  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [openAssign, setOpenAssign] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const courseData = useFetch(ApiUrls.COURSE_MANAGEMENT.DETAIL(id))
  const course = courseData.data

  const isDraft = course?.status === 'Draft'
  const allowWithdraw = course?.status === 'Upcoming' || course?.status === 'InProgress'
  const readOnly = !isDraft

  const queryParams = useMemo(
    () => ({ courseId: id, sort: `${sort.key} ${sort.direction}`, page, pageSize, ...filters }),
    [id, sort, page, pageSize, filters]
  )

  const enrollments = useFetch(ApiUrls.ENROLLMENT_MANAGEMENT.INDEX, queryParams, [queryParams])

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

  const handleDelete = async (enrollment) => {
    const accepted = await confirm({
      title: t('enrollment_management.confirm.delete_title'),
      description: t('enrollment_management.confirm.delete_description', {
        name: enrollment.citizenFullName,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return

    setDeleteLoading(true)
    try {
      await axiosConfig.delete(ApiUrls.ENROLLMENT_MANAGEMENT.DETAIL(enrollment.id))
      clearSelection()
      await enrollments.fetch()
      await courseData.fetch()
    } catch {
      // API error shown by interceptor
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    const accepted = await confirm({
      title: t('enrollment_management.confirm.delete_selected_title'),
      description: t('enrollment_management.confirm.delete_selected_description', {
        count: selectedIds.length,
      }),
      confirmColor: 'error',
      confirmText: t('button.delete'),
    })
    if (!accepted) return

    setDeleteLoading(true)
    try {
      await axiosConfig.delete(ApiUrls.ENROLLMENT_MANAGEMENT.DELETE_SELECTED, {
        data: { ids: selectedIds },
      })
      clearSelection()
      await enrollments.fetch()
      await courseData.fetch()
    } catch {
      // API error shown by interceptor
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAssigned = async () => {
    await enrollments.fetch()
    await courseData.fetch()
  }

  const handleWithdraw = async (enrollment) => {
    const accepted = await confirm({
      title: t('enrollment_management.confirm.withdraw_title'),
      description: t('enrollment_management.confirm.withdraw_description', {
        name: enrollment.citizenFullName,
      }),
      confirmText: t('enrollment_management.action.withdraw'),
    })
    if (!accepted) return

    setDeleteLoading(true)
    try {
      await axiosConfig.put(ApiUrls.ENROLLMENT_MANAGEMENT.WITHDRAW(enrollment.id))
      await enrollments.fetch()
    } catch {
      // API error shown by interceptor
    } finally {
      setDeleteLoading(false)
    }
  }

  const renderStatus = (status) => {
    if (!status) return null
    const config = defaultManagementStatusStyle[status] || {}
    const option = _enum.courseStatusOptions.find((opt) => opt.value === status)
    const text = option ? option.label : status
    return (
      <Tag color={config.color} style={{ margin: 0, padding: '4px 12px', fontSize: 14 }}>
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
              <Space direction="vertical" size={8}>
                <Space align="center" size={16}>
                  <Typography.Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                    {course.courseName}
                  </Typography.Title>
                  {renderStatus(course.status)}
                </Space>
                <Space split={<Divider type="vertical" />} style={{ color: '#595959' }}>
                  <Space>
                    <ReadOutlined />
                    <Typography.Text keyboard>{course.courseCode}</Typography.Text>
                  </Space>
                  <Space>
                    <BankOutlined />
                    <Typography.Text>{course.schoolName}</Typography.Text>
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
                    <Descriptions.Item
                      label={t('course_management.field.fas_application_due_date')}
                    >
                      {formatDatetimeStringBasedOnCurrentLanguage(course.fasApplicationDueDate) || '-'}
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
          </Flex>
        )}
      </Card>

      <Card variant="borderless">
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            <Space align="baseline">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t(
                  isDraft
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
                <Button
                  danger
                  disabled={!selectedIds.length}
                  loading={deleteLoading}
                  onClick={handleDeleteSelected}
                >
                  {t('enrollment_management.action.delete_selected')}
                </Button>
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
            loading={enrollments.loading || deleteLoading}
            sort={sort}
            setSort={handleSort}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onDelete={handleDelete}
            onWithdraw={handleWithdraw}
            showCourse={false}
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
