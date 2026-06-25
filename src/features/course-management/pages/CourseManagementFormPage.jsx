import { ApiUrls } from '@/shared/api/apiUrls'
import MaskedNric from '@/shared/components/generals/MaskedNric'
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
  InfoCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Flex, Row, Space, Tag, Typography, theme } from 'antd'
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

const SectionLayout = ({ titleKey, icon, isLast, children, token, t }) => (
  <Row
    gutter={[32, 24]}
    style={{
      padding: '32px 0',
      borderBottom: isLast ? 'none' : `1px solid ${token.colorBorderSecondary}`,
    }}
  >
    <Col xs={24} md={8}>
      <Space align="start" size="middle">
        <div
          style={{
            fontSize: 20,
            padding: 10,
            borderRadius: 8,
            backgroundColor: token.colorFillAlter,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <Typography.Title level={5} style={{ margin: 0, marginTop: 8 }}>
          {t(`course_management.section.${titleKey}`)}
        </Typography.Title>
      </Space>
    </Col>
    <Col xs={24} md={16}>
      {children}
    </Col>
  </Row>
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
      return {
        options: (result?.collection || [])
          .filter((student) => student.status === 'Active')
          .map((student) => ({
            value: student.id,
            label: getStudentLabel(student),
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
      return {
        options: (result?.collection || []).map((scheme) => ({
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
              options: [],
              loadOptions: loadStudentOptions,
            },
          ]),
      {
        key: 'fasSchemeIds',
        title: t('course_management.field.applicable_fas'),
        type: 'select',
        multiple: true,
        required: false,
        options: (course.data?.applicableFasSchemes || []).map((scheme) => ({
          value: scheme.id,
          label: getFasSchemeLabel(scheme),
          searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
        })),
        loadOptions: loadFasOptions,
      },
    ]
  }, [
    course.data?.applicableFasSchemes,
    course.data?.status,
    currencySymbol,
    isEdit,
    loadFasOptions,
    loadStudentOptions,
    t,
  ])

  const handleSubmit = async ({ publish = false } = {}) => {
    setSubmitted(true)
    const ok = validateAll()
    const missing = hasRequiredMissing(fields)
    if (!ok || missing) return

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
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card
        bordered={false}
        loading={isEdit && course.loading && !course.data}
        styles={{ body: { padding: '32px 48px' } }}
      >
        <Flex vertical>
          <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              {t(isEdit ? 'course_management.title.update' : 'course_management.title.create')}
            </Typography.Title>
          </Flex>

          <Flex vertical>
            <SectionLayout
              titleKey="basic_info"
              icon={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
              token={token}
              t={t}
            >
              <Flex vertical gap={16}>
                {basicFields.map((field, index) => (
                  <div key={field.key}>{renderSectionField(field, index)}</div>
                ))}
              </Flex>
            </SectionLayout>

            <SectionLayout
              titleKey="fees"
              icon={<DollarOutlined style={{ color: '#52c41a' }} />}
              token={token}
              t={t}
            >
              <Row gutter={16}>
                {feeFields.map((field) => (
                  <Col xs={24} sm={12} key={field.key}>
                    {renderSectionField(field, -1)}
                  </Col>
                ))}
              </Row>
            </SectionLayout>

            <SectionLayout
              titleKey="schedule"
              icon={<CalendarOutlined style={{ color: '#faad14' }} />}
              isLast={studentFields.length === 0}
              token={token}
              t={t}
            >
              <Row gutter={16}>
                {scheduleFields.map((field) => (
                  <Col xs={24} md={12} key={field.key}>
                    {renderSectionField(field, -1)}
                  </Col>
                ))}
              </Row>
            </SectionLayout>

            {studentFields.length > 0 && (
              <SectionLayout
                titleKey="initial_students"
                icon={<TeamOutlined style={{ color: '#722ed1' }} />}
                isLast={fasFields.length === 0}
                token={token}
                t={t}
              >
                {studentFields.map((field) => (
                  <div key={field.key}>{renderSectionField(field, -1)}</div>
                ))}
              </SectionLayout>
            )}

            {fasFields.length > 0 && (
              <SectionLayout
                titleKey="applicable_fas"
                icon={<GiftOutlined style={{ color: '#722ed1' }} />}
                isLast={true}
                token={token}
                t={t}
              >
                {fasFields.map((field) => (
                  <div key={field.key}>{renderSectionField(field, -1)}</div>
                ))}
              </SectionLayout>
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
        </Flex>
      </Card>
    </div>
  )
}

export default CourseManagementFormPage
