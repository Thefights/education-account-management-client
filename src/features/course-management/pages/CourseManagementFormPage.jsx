import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  isDateTimeBefore,
  localDateTimeToIso,
  toLocalDateTimeInput,
} from '@/shared/utils/dateTimeUtil'
import { getCurrencySymbolBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { maxLen, numberHigherThanOrEqual } from '@/shared/utils/validateUtil'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  GiftOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Flex, Form, InputNumber, Row, Space, Tag, Typography, message, theme } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const getStudentLabel = (student) => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
    onClick={(e) => e.stopPropagation()}
  >
    {student.fullName && <span>{student.fullName}</span>}
    {student.fullName && (student.nric || student.accountNumber) && <span>&middot;</span>}
    {student.nric && <MaskedNric value={student.nric} />}
    {student.nric && student.accountNumber && <span>&middot;</span>}
    {student.accountNumber && <span>{student.accountNumber}</span>}
  </div>
)

const getFasSchemeLabel = (scheme) => (
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

const normalizeInitialValues = (course = {}) => ({
  courseName: course.courseName ?? '',
  courseFeeAmount: course.courseFeeAmount ?? 0,
  miscFeeAmount: course.miscFeeAmount ?? 0,
  enrollmentDeadline: toLocalDateTimeInput(course.enrollmentDeadline),
  startDate: toLocalDateTimeInput(course.startDate),
  endDate: toLocalDateTimeInput(course.endDate),
  schoolStudentIds: [],
  fasSchemeIds: (course.applicableFasSchemes || []).map((scheme) => scheme.id),
  rowVersion: course.rowVersion ?? '',
})

const FormSectionCard = ({ titleKey, title, icon, children, t }) => (
  <Card
    title={
      <Space>
        {icon}
        <span>{title || t(`course_management.section.${titleKey}`)}</span>
      </Space>
    }
    size="small"
    variant="outlined"
  >
    {children}
  </Card>
)

const TAX_RATE = 0.09

const getAmount = (value) => Number(value || 0)

const computeGstAmount = (courseFeeAmount, miscFeeAmount) =>
  Math.round((getAmount(courseFeeAmount) + getAmount(miscFeeAmount)) * TAX_RATE * 100) / 100

const ReadOnlyAmountField = ({ label, value, prefix }) => (
  <Form.Item
    label={label}
    labelCol={{ span: 24 }}
    wrapperCol={{ span: 24 }}
    labelAlign="left"
    colon={false}
    style={{ marginBottom: 0 }}
  >
    <InputNumber
      value={value}
      prefix={prefix}
      precision={2}
      readOnly
      disabled
      style={{ width: '100%' }}
    />
  </Form.Item>
)

const CourseManagementFormPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const isEdit = Boolean(id)
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const { values, handleChange, setField, reset, registerRef, validateAll, resetValidation } =
    useForm()
  const [submitted, setSubmitted] = useState(false)
  const [studentOptionCache, setStudentOptionCache] = useState({})
  const [fasOptionCache, setFasOptionCache] = useState({})
  const course = useFetch(isEdit ? ApiUrls.COURSE_MANAGEMENT.DETAIL(id) : '', {}, [id], isEdit)
  const save = useAxiosSubmit({
    url: isEdit ? ApiUrls.COURSE_MANAGEMENT.DETAIL(id) : ApiUrls.COURSE_MANAGEMENT.INDEX,
    method: isEdit ? 'PUT' : 'POST',
  })
  const fetchStudentOptions = useAxiosSubmit({
    url: ApiUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX,
    method: 'GET',
  })
  const fetchFasOptions = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX,
    method: 'GET',
  })
  const publishCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.PUBLISH,
    method: 'POST',
  })
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    submitted
  )

  useEffect(() => {
    if (isEdit && !course.data) return

    reset(normalizeInitialValues(isEdit ? course.data : undefined))
    resetValidation()
    queueMicrotask(() => setSubmitted(false))
  }, [course.data, isEdit, reset, resetValidation])

  const loadStudentOptions = useCallback(
    async ({ search, page, pageSize }) => {
      const response = await fetchStudentOptions.submit({
        overrideParam: { search, page, pageSize },
      })
      const result = response?.data
      const students = (result?.collection || []).filter((student) => student.status === 'Active')
      setStudentOptionCache((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...students.map((student) => [String(student.id), student]),
        ])
      )
      return {
        options: students.map((student) => ({
            value: student.id,
            label: getStudentLabel(student),
            searchKey: `${student.fullName} ${student.nric} ${student.email} ${student.phoneNumber} ${student.accountNumber}`,
          })),
        totalCount: result?.totalCount || 0,
      }
    },
    [fetchStudentOptions.submit]
  )

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
          label: getFasSchemeLabel(scheme),
          searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
        })),
        totalCount: result?.totalCount || 0,
      }
    },
    [fetchFasOptions.submit]
  )

  const fields = useMemo(() => {
    const amountProps = { min: 0, precision: 2, prefix: currencySymbol }
    const basicInfoOnly = isEdit && course.data?.status === 'Enrolling'
    const fasSchemes = Object.values({
      ...(course.data?.applicableFasSchemes || []).reduce(
        (map, scheme) => ({ ...map, [String(scheme.id)]: scheme }),
        {}
      ),
      ...fasOptionCache,
    })
    return [
      {
        key: 'courseName',
        title: t('course_management.field.course_name'),
        validate: [maxLen(150)],
      },
      {
        key: 'courseFeeAmount',
        title: t('course_management.field.course_fee_amount'),
        type: 'input-number',
        minValue: 0,
        validate: [numberHigherThanOrEqual(0)],
        props: { ...amountProps, disabled: basicInfoOnly },
      },
      {
        key: 'miscFeeAmount',
        title: t('course_management.field.misc_fee_amount'),
        type: 'input-number',
        minValue: 0,
        validate: [numberHigherThanOrEqual(0)],
        props: { ...amountProps, disabled: basicInfoOnly },
      },
      {
        key: 'enrollmentDeadline',
        title: t('course_management.field.enrollment_deadline'),
        type: 'datetime-local',
        props: { disabled: basicInfoOnly },
      },
      {
        key: 'startDate',
        title: t('course_management.field.start_date'),
        type: 'datetime-local',
        validate: [
          (value, currentValues) =>
            !isDateTimeBefore(value, currentValues.enrollmentDeadline) ||
            t('course_management.validation.date_order'),
        ],
        props: { disabled: basicInfoOnly },
      },
      {
        key: 'endDate',
        title: t('course_management.field.end_date'),
        type: 'datetime-local',
        validate: [
          (value, currentValues) =>
            !isDateTimeBefore(value, currentValues.startDate) ||
            t('course_management.validation.date_order'),
        ],
        props: { disabled: basicInfoOnly },
      },
      ...(isEdit
        ? []
        : [
            {
              key: 'schoolStudentIds',
              title: t('course_management.field.initial_students'),
              type: 'select',
              multiple: true,
              required: false,
              options: Object.values(studentOptionCache).map((student) => ({
                value: student.id,
                label: getStudentLabel(student),
                searchKey: `${student.fullName} ${student.nric} ${student.email} ${student.phoneNumber} ${student.accountNumber}`,
              })),
              loadOptions: loadStudentOptions,
            },
          ]),
      {
        key: 'fasSchemeIds',
        title: t('course_management.field.applicable_fas'),
        type: 'select',
        multiple: true,
        required: false,
        options: fasSchemes.map((scheme) => ({
          value: scheme.id,
          label: getFasSchemeLabel(scheme),
          searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
        })),
        loadOptions: loadFasOptions,
        renderOptionValue: (value) =>
          fasOptionCache[String(value)]?.schemeName ||
          (course.data?.applicableFasSchemes || []).find(
            (scheme) => String(scheme.id) === String(value)
          )?.schemeName ||
          String(value),
      },
    ]
  }, [
    course.data?.applicableFasSchemes,
    course.data?.status,
    currencySymbol,
    fasOptionCache,
    isEdit,
    loadFasOptions,
    loadStudentOptions,
    studentOptionCache,
    t,
  ])

  const handleSubmit = async ({ publish = false } = {}) => {
    setSubmitted(true)
    const ok = validateAll()
    const missing = hasRequiredMissing(fields)
    if (!ok || missing) return
    if (publish && isDateTimeBefore(values.enrollmentDeadline, new Date())) {
      message.error(t('course_management.message.publish_deadline_expired'))
      return
    }

    const payload = {
      courseName: values.courseName,
      courseFeeAmount: Number(values.courseFeeAmount),
      miscFeeAmount: Number(values.miscFeeAmount),
      enrollmentDeadline: localDateTimeToIso(values.enrollmentDeadline),
      startDate: localDateTimeToIso(values.startDate),
      endDate: localDateTimeToIso(values.endDate),
      fasSchemeIds: values.fasSchemeIds || [],
      ...(isEdit
        ? { rowVersion: values.rowVersion }
        : { schoolStudentIds: values.schoolStudentIds || [] }),
    }

    const response = await save.submit({ overrideData: payload })
    if (!response) return
    const courseId = response.data?.id || id
    if (publish) {
      const publishResponse = await publishCourse.submit({ overrideData: { ids: [courseId] } })
      if (!publishResponse) return
    }
    navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.DETAIL(courseId)))
  }

  const basicFields = fields.filter((f) => ['courseName'].includes(f.key))
  const feeFields = fields.filter((f) => ['courseFeeAmount', 'miscFeeAmount'].includes(f.key))
  const scheduleFields = fields.filter((f) =>
    ['enrollmentDeadline', 'startDate', 'endDate'].includes(f.key)
  )
  const studentFields = fields.filter((f) => ['schoolStudentIds'].includes(f.key))
  const fasFields = fields.filter((f) => ['fasSchemeIds'].includes(f.key))
  const gstAmount = computeGstAmount(values.courseFeeAmount, values.miscFeeAmount)
  const totalFeeAmount = getAmount(values.courseFeeAmount) + getAmount(values.miscFeeAmount) + gstAmount
  const selectedStudents = useMemo(
    () =>
      (values.schoolStudentIds || [])
        .map((studentId) => studentOptionCache[String(studentId)])
        .filter(Boolean),
    [studentOptionCache, values.schoolStudentIds]
  )
  const selectedStudentFields = useMemo(
    () => [
      {
        key: 'accountNumber',
        title: t('enrollment_management.field.account_number'),
        width: 170,
      },
      {
        key: 'nric',
        title: t('enrollment_management.field.nric'),
        width: 140,
        render: (value) => <MaskedNric value={value} />,
      },
      {
        key: 'fullName',
        title: t('enrollment_management.field.full_name'),
        width: 200,
      },
      {
        key: 'email',
        title: t('enrollment_management.field.email'),
        width: 220,
      },
      {
        key: 'phoneNumber',
        title: t('enrollment_management.field.phone'),
        width: 150,
      },
    ],
    [t]
  )
  const showPublishButton = !isEdit || course.data?.status === 'Draft'
  const submitLoading = save.loading || publishCourse.loading

  const renderSectionField = (field, index) => {
    return renderField(
      index === 0 && field.key === 'courseName'
        ? { ...field, props: { ...field.props, autoFocus: true } }
        : field
    )
  }

  return (
    <Flex vertical gap={24} style={{ width: '100%' }}>
      <Flex align="center" gap={16}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t(isEdit ? 'course_management.title.update' : 'course_management.title.create')}
        </Typography.Title>
      </Flex>

      <Card
        variant="borderless"
        loading={isEdit && course.loading && !course.data}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <Flex vertical gap={24}>
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
            <Flex vertical gap={8} style={{ width: '100%' }}>
              {basicFields.map((field, index) => (
                <div key={field.key}>{renderSectionField(field, index)}</div>
              ))}
              {isEdit && course.data?.courseCode && (
                <Space>
                  <Typography.Text keyboard>{course.data.courseCode}</Typography.Text>
                  <Typography.Text type="secondary">
                    {t('course_management.field.id')}: #{course.data.id}
                  </Typography.Text>
                </Space>
              )}
            </Flex>
          </Flex>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <FormSectionCard
                title={t('course_management.field.total_fee_amount')}
                icon={<DollarOutlined style={{ color: '#52c41a' }} />}
                t={t}
              >
                <Row gutter={16}>
                  {feeFields.map((field) => (
                    <Col xs={24} sm={12} key={field.key}>
                      {renderSectionField(field, -1)}
                    </Col>
                  ))}
                  <Col xs={24} sm={12}>
                    <ReadOnlyAmountField
                      label={t('course_management.field.gst_amount')}
                      value={gstAmount}
                      prefix={currencySymbol}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <ReadOnlyAmountField
                      label={t('course_management.field.total_fee_amount')}
                      value={totalFeeAmount}
                      prefix={currencySymbol}
                    />
                  </Col>
                </Row>
              </FormSectionCard>
            </Col>
            <Col xs={24} lg={12}>
              <FormSectionCard
                title={t('course_management.title.important_dates')}
                icon={<CalendarOutlined style={{ color: '#1677ff' }} />}
                t={t}
              >
                <Row gutter={16}>
                  {scheduleFields.map((field) => (
                    <Col xs={24} md={12} key={field.key}>
                      {renderSectionField(field, -1)}
                    </Col>
                  ))}
                </Row>
              </FormSectionCard>
            </Col>
          </Row>

          {fasFields.length > 0 && (
            <FormSectionCard
              title={t('course_management.title.applicable_fas')}
              icon={<GiftOutlined style={{ color: '#722ed1' }} />}
              t={t}
            >
              {fasFields.map((field) => (
                <div key={field.key}>{renderSectionField(field, -1)}</div>
              ))}
            </FormSectionCard>
          )}

          {studentFields.length > 0 && (
            <FormSectionCard
              titleKey="initial_students"
              icon={<TeamOutlined style={{ color: '#722ed1' }} />}
              t={t}
            >
              <Flex vertical gap={16}>
                {studentFields.map((field) => (
                  <div key={field.key}>{renderSectionField(field, -1)}</div>
                ))}
                <GenericTable
                  data={selectedStudents}
                  fields={selectedStudentFields}
                  rowKey="id"
                  loading={false}
                />
              </Flex>
            </FormSectionCard>
          )}

          <Flex
            justify="flex-end"
            gap={16}
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Button size="large" onClick={() => navigate(-1)}>
              {t('button.cancel', 'Cancel')}
            </Button>
            <Button
              type="primary"
              size="large"
              loading={submitLoading}
              onClick={() => handleSubmit({ publish: false })}
              style={{ padding: '0 40px' }}
            >
              {t(isEdit ? 'button.update' : 'course_management.action.save_as_draft')}
            </Button>
            {showPublishButton && (
              <Button
                type="primary"
                size="large"
                loading={submitLoading}
                onClick={() => handleSubmit({ publish: true })}
                style={{ padding: '0 40px' }}
              >
                {t('course_management.action.publish')}
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}

export default CourseManagementFormPage
