import EnrollmentManagementFilterSection from '@/features/enrollment-management/components/EnrollmentManagementFilterSection'
import EnrollmentManagementTableSection from '@/features/enrollment-management/components/EnrollmentManagementTableSection'
import {
  CompactEntityLabel,
  CourseFasSchemeOptionLabel,
  CourseStudentOptionLabel,
  CourseStudentTableLabel,
} from '@/features/course-management/components/CourseEntityLabels'
import CourseStudentPicker from '@/features/course-management/components/CourseStudentPicker'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import InlineAsyncMultiSelect from '@/shared/components/generals/InlineAsyncMultiSelect'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useConfirm from '@/shared/hooks/useConfirm'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  isDateTimeBefore,
  localDateTimeToIso,
  toLocalDateTimeInput,
} from '@/shared/utils/dateTimeUtil'
import {
  formatCurrencyBasedOnCurrentLanguage,
  getCurrencySymbolBasedOnCurrentLanguage,
} from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { maxLen, numberHigherThanOrEqual } from '@/shared/utils/validateUtil'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  GiftOutlined,
  ReadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Descriptions, Divider, Flex, Row, Space, Tag, Typography, theme } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const formatCount = (value) => (value == null ? 0 : Number(value).toLocaleString())

const defaultFilters = { search: '', chargeStatuses: [] }

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const confirm = useConfirm()
  const confirmReason = useReasonConfirm()
  const _enum = useEnum()
  const { token } = theme.useToken()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()

  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [fasOptionCache, setFasOptionCache] = useState({})
  const [studentDetailCache, setStudentDetailCache] = useState({})
  const [studentIdsToAdd, setStudentIdsToAdd] = useState([])
  const [editing, setEditing] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const courseData = useFetch(ApiUrls.COURSE_MANAGEMENT.DETAIL(id))
  const course = courseData.data
  const updateCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.DETAIL(id),
    method: 'PUT',
  })
  const assignStudents = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.ENROLLMENTS(id),
    method: 'POST',
  })
  const removeSelectedEnrollments = useAxiosSubmit({
    url: ApiUrls.ENROLLMENT_MANAGEMENT.DELETE_SELECTED,
    method: 'DELETE',
  })
  const withdrawEnrollment = useAxiosSubmit({ method: 'PUT' })

  const canManageEnrollments = course?.status === 'Draft' || course?.status === 'Enrolling'
  const canUpdate = canManageEnrollments
  const isDraft = course?.status === 'Draft'
  const allowWithdraw = course?.status === 'Upcoming' || course?.status === 'InProgress'
  const readOnly = !canManageEnrollments
  const mutationLoading = removeSelectedEnrollments.loading || withdrawEnrollment.loading

  const queryParams = useMemo(
    () => ({ courseId: id, sort: `${sort.key} ${sort.direction}`, page, pageSize, ...filters }),
    [id, sort, page, pageSize, filters]
  )

  const enrollments = useFetch(ApiUrls.ENROLLMENT_MANAGEMENT.INDEX, queryParams, [queryParams])
  const enrollmentRows = useMemo(
    () => enrollments.data?.collection || [],
    [enrollments.data?.collection]
  )
  const editingStudentRows = useMemo(
    () =>
      enrollmentRows.map((enrollment) => {
        const student = studentDetailCache[String(enrollment.schoolStudentId)] || {}
        return {
          id: enrollment.schoolStudentId,
          accountNumber: student.accountNumber || enrollment.accountNumber,
          nric: student.nric || enrollment.citizenNric,
          fullName: student.fullName || enrollment.citizenFullName,
          email: student.email || enrollment.citizenEmail,
          phoneNumber: student.phoneNumber || enrollment.citizenPhoneNumber,
          dateOfBirth: student.dateOfBirth,
        }
      }),
    [enrollmentRows, studentDetailCache]
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
        label: <CourseFasSchemeOptionLabel scheme={scheme} />,
        searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
      }))
    },
    [course?.applicableFasSchemes, fasOptionCache]
  )
  const initialValues = useMemo(
    () =>
      course
        ? {
            courseName: course.courseName,
            courseFeeAmount: course.courseFeeAmount,
            miscFeeAmount: course.miscFeeAmount,
            enrollmentDeadline: toLocalDateTimeInput(course.enrollmentDeadline),
            startDate: toLocalDateTimeInput(course.startDate),
            endDate: toLocalDateTimeInput(course.endDate),
            fasSchemeIds: (course.applicableFasSchemes || []).map((scheme) => scheme.id),
            rowVersion: course.rowVersion,
          }
        : {},
    [course]
  )
  const { values, handleChange, setField, reset, registerRef, validateAll, resetValidation } =
    useForm(initialValues)
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    submitted
  )

  useEffect(() => {
    if (editing) return
    reset(initialValues)
    resetValidation()
  }, [editing, initialValues, reset, resetValidation])

  useEffect(() => {
    if (!editing || !enrollmentRows.length) return undefined

    const missingStudentIds = enrollmentRows
      .map((enrollment) => enrollment.schoolStudentId)
      .filter((studentId) => studentId && !studentDetailCache[String(studentId)])

    if (!missingStudentIds.length) return undefined

    let active = true
    Promise.all(
      missingStudentIds.map(async (studentId) => {
        const response = await axiosConfig.get(ApiUrls.SCHOOL_STUDENT_MANAGEMENT.DETAIL(studentId))
        return response?.data
      })
    )
      .then((students) => {
        if (!active) return
        setStudentDetailCache((current) =>
          Object.fromEntries([
            ...Object.entries(current),
            ...students.filter(Boolean).map((student) => [String(student.id), student]),
          ])
        )
      })

    return () => {
      active = false
    }
  }, [editing, enrollmentRows, studentDetailCache])

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

  const loadFasOptions = useCallback(
    async ({ search, page, pageSize }) => {
      const response = await axiosConfig.get(ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX, {
        params: { search, page, pageSize },
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
          label: <CourseFasSchemeOptionLabel scheme={scheme} />,
          searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
        })),
        totalCount: result?.totalCount || 0,
      }
    },
    []
  )

  const loadStudentOptions = useCallback(
    async ({ search, page, pageSize }) => {
      const response = await axiosConfig.get(ApiUrls.COURSE_MANAGEMENT.ELIGIBLE_STUDENTS(id), {
        params: { search, page, pageSize },
      })
      const result = response?.data
      const students = result?.collection || []
      setStudentDetailCache((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...students.map((student) => [String(student.id), student]),
        ])
      )
      return {
        options: students.map((student) => ({
          value: student.id,
          label: <CourseStudentOptionLabel student={student} />,
          searchKey: `${student.fullName} ${student.nric} ${student.email} ${student.phoneNumber} ${student.accountNumber}`,
        })),
        totalCount: result?.totalCount || 0,
      }
    },
    [id]
  )

  const fasField = useMemo(
    () => ({
      key: 'fasSchemeIds',
      title: t('course_management.title.applicable_fas'),
      type: 'custom',
      required: false,
      render: ({ value, onChange }) => (
        <InlineAsyncMultiSelect
          value={value}
          onChange={onChange}
          placeholder={t('course_management.placeholder.select_fas_schemes')}
          options={selectedFasOptions}
          loadOptions={loadFasOptions}
          renderSelectedLabel={(selectedValue) => {
            const scheme =
              fasOptionCache[String(selectedValue)] ||
              (course?.applicableFasSchemes || []).find(
                (item) => String(item.id) === String(selectedValue)
              )
            return <CompactEntityLabel name={scheme?.schemeName || String(selectedValue)} />
          }}
        />
      ),
    }),
    [course?.applicableFasSchemes, fasOptionCache, loadFasOptions, selectedFasOptions, t]
  )
  const editableFields = useMemo(() => {
    const amountProps = { min: 0, precision: 2, prefix: currencySymbol }
    return [
      {
        key: 'courseName',
        title: t('course_management.field.course_name'),
        placeholder: 'e.g. Software Foundations Cohort 01',
        validate: [maxLen(150)],
      },
      ...(isDraft
        ? [
            {
              key: 'courseFeeAmount',
              title: t('course_management.field.course_fee_amount'),
              type: 'input-number',
              minValue: 0,
              placeholder: 'e.g. 100.00',
              validate: [numberHigherThanOrEqual(0)],
              props: amountProps,
            },
            {
              key: 'miscFeeAmount',
              title: t('course_management.field.misc_fee_amount'),
              type: 'input-number',
              minValue: 0,
              placeholder: 'e.g. 100.00',
              validate: [numberHigherThanOrEqual(0)],
              props: amountProps,
            },
            {
              key: 'enrollmentDeadline',
              title: t('course_management.field.enrollment_deadline'),
              type: 'datetime-local',
              placeholder: 'Select enrollment deadline',
            },
            {
              key: 'startDate',
              title: t('course_management.field.start_date'),
              type: 'datetime-local',
              placeholder: 'Select start date',
              validate: [
                (value, currentValues) =>
                  !isDateTimeBefore(value, currentValues.enrollmentDeadline) ||
                  t('course_management.validation.date_order'),
              ],
            },
            {
              key: 'endDate',
              title: t('course_management.field.end_date'),
              type: 'datetime-local',
              placeholder: 'Select end date',
              validate: [
                (value, currentValues) =>
                  !isDateTimeBefore(value, currentValues.startDate) ||
                  t('course_management.validation.date_order'),
              ],
            },
          ]
        : []),
      fasField,
    ]
  }, [currencySymbol, fasField, isDraft, t])

  const editableFieldMap = useMemo(
    () => new Map(editableFields.map((field) => [field.key, field])),
    [editableFields]
  )
  const editGstAmount =
    Math.round(
      (Number(values.courseFeeAmount || 0) + Number(values.miscFeeAmount || 0)) * 0.09 * 100
    ) / 100
  const editTotalFeeAmount =
    Number(values.courseFeeAmount || 0) + Number(values.miscFeeAmount || 0) + editGstAmount

  const renderEditField = (key) => {
    const field = editableFieldMap.get(key)
    if (!field) return null
    return renderField({ ...field, title: undefined, label: undefined, hideLabel: true })
  }

  const handleStartEdit = () => {
    reset(initialValues)
    resetValidation()
    setSubmitted(false)
    setStudentIdsToAdd([])
    setEditing(true)
  }

  const handleCancelEdit = () => {
    reset(initialValues)
    resetValidation()
    setSubmitted(false)
    setStudentIdsToAdd([])
    setEditing(false)
  }

  const handleSaveEdit = async () => {
    setSubmitted(true)
    const missing = hasRequiredMissing(editableFields)
    const valid = validateAll()
    if (missing || !valid) return

    const response = await updateCourse.submit({
      overrideData: {
        courseName: values.courseName,
        courseFeeAmount: Number(values.courseFeeAmount),
        miscFeeAmount: Number(values.miscFeeAmount),
        enrollmentDeadline: localDateTimeToIso(values.enrollmentDeadline),
        startDate: localDateTimeToIso(values.startDate),
        endDate: localDateTimeToIso(values.endDate),
        fasSchemeIds: values.fasSchemeIds || [],
        rowVersion: values.rowVersion,
      },
    })
    if (!response) return

    if (studentIdsToAdd.length) {
      const assignResponse = await assignStudents.submit({
        overrideData: { schoolStudentIds: studentIdsToAdd },
      })
      if (!assignResponse) return
    }

    await courseData.fetch()
    await enrollments.fetch()
    setStudentIdsToAdd([])
    setSubmitted(false)
    setEditing(false)
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
                <Space align="center" size={16} wrap>
                  <div style={{ width: 'min(420px, 60vw)', minHeight: 40 }}>
                    {editing ? (
                      renderEditField('courseName')
                    ) : (
                      <Typography.Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
                        {course.courseName}
                      </Typography.Title>
                    )}
                  </div>
                </Space>
                <Space
                  separator={<Divider orientation="vertical" />}
                  style={{ color: token.colorTextSecondary }}
                >
                  <Space>
                    <ReadOutlined />
                    <Typography.Text keyboard>{course.courseCode}</Typography.Text>
                  </Space>
                  <Typography.Text type="secondary">
                    {t('course_management.field.id')}: #{course.id}
                  </Typography.Text>
                  {renderStatus(course.status)}
                </Space>
              </Space>
              {canUpdate &&
                (editing ? (
                  <Space>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancelEdit}
                      disabled={updateCourse.loading || assignStudents.loading}
                    >
                      {t('button.cancel')}
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveEdit}
                      loading={updateCourse.loading || assignStudents.loading}
                    >
                      {t('button.save')}
                    </Button>
                  </Space>
                ) : (
                  <Button type="primary" icon={<EditOutlined />} onClick={handleStartEdit}>
                    {t('button.update')}
                  </Button>
                ))}
            </Flex>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <DollarOutlined style={{ color: token.colorSuccess }} />
                      <span>{t('course_management.field.total_fee_amount')}</span>
                    </Space>
                  }
                  size="small"
                  variant="outlined"
                >
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item label={t('course_management.field.course_fee_amount')}>
                      <div style={{ minHeight: 40 }}>
                        {editing && isDraft
                          ? renderEditField('courseFeeAmount')
                          : formatCurrencyBasedOnCurrentLanguage(course.courseFeeAmount)}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.misc_fee_amount')}>
                      <div style={{ minHeight: 40 }}>
                        {editing && isDraft
                          ? renderEditField('miscFeeAmount')
                          : formatCurrencyBasedOnCurrentLanguage(course.miscFeeAmount)}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.gst_amount')}>
                      <div style={{ minHeight: 40 }}>
                        {formatCurrencyBasedOnCurrentLanguage(
                          editing && isDraft ? editGstAmount : course.gstAmount
                        )}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.total_fee_amount')}>
                      <div style={{ minHeight: 40 }}>
                        <Typography.Text strong style={{ color: token.colorError }}>
                          {formatCurrencyBasedOnCurrentLanguage(
                            editing && isDraft ? editTotalFeeAmount : course.totalFeeAmount
                          )}
                        </Typography.Text>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined style={{ color: token.colorPrimary }} />
                      <span>{t('course_management.title.important_dates')}</span>
                    </Space>
                  }
                  size="small"
                  variant="outlined"
                >
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item label={t('course_management.field.enrollment_deadline')}>
                      <div style={{ minHeight: 40 }}>
                        {editing && isDraft
                          ? renderEditField('enrollmentDeadline')
                          : formatDatetimeStringBasedOnCurrentLanguage(
                              course.enrollmentDeadline
                            ) || '-'}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.start_date')}>
                      <div style={{ minHeight: 40 }}>
                        {editing && isDraft
                          ? renderEditField('startDate')
                          : formatDatetimeStringBasedOnCurrentLanguage(course.startDate) || '-'}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('course_management.field.end_date')}>
                      <div style={{ minHeight: 40 }}>
                        {editing && isDraft
                          ? renderEditField('endDate')
                          : formatDatetimeStringBasedOnCurrentLanguage(course.endDate) || '-'}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            <Card
              title={
                <Flex justify="space-between" align="center" gap={12}>
                  <Space>
                    <GiftOutlined style={{ color: token.colorInfo }} />
                    <span>{t('course_management.title.applicable_fas')}</span>
                  </Space>
                </Flex>
              }
              size="small"
              variant="outlined"
            >
              <div style={{ minHeight: 40 }}>
                {editing ? (
                  <div>{renderEditField('fasSchemeIds')}</div>
                ) : course.applicableFasSchemes?.length ? (
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
              </div>
            </Card>
          </Flex>
        )}
      </Card>

      <Card variant="borderless">
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            <Space align="baseline">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('course_management.title.manage_students')}
              </Typography.Title>
              <Tag color="blue" style={{ borderRadius: 12 }}>
                {t('course_management.message.number_of_students_count', {
                  count: formatCount(
                    Number(course?.enrollmentCount || 0) + (editing ? studentIdsToAdd.length : 0)
                  ),
                })}
              </Tag>
            </Space>
          </Flex>

          {editing ? (
            <CourseStudentPicker
              value={studentIdsToAdd}
              onChange={setStudentIdsToAdd}
              options={Object.values(studentDetailCache)
                .filter((student) => student?.id)
                .map((student) => ({
                  value: student.id,
                  label: <CourseStudentOptionLabel student={student} />,
                  searchKey: `${student.fullName} ${student.nric} ${student.email} ${student.phoneNumber} ${student.accountNumber}`,
                }))}
              loadOptions={loadStudentOptions}
              getStudentById={(studentId) => studentDetailCache[String(studentId)]}
              baseStudents={editingStudentRows}
              loading={enrollments.loading}
            />
          ) : (
            <>
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
                renderStudentName={(name) => <CourseStudentTableLabel name={name} />}
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
            </>
          )}

          {!readOnly && !editing && (
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

    </Flex>
  )
}

export default CourseDetailPage
