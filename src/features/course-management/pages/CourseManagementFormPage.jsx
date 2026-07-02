import {
  CompactEntityLabel,
  CourseFasSchemeOptionLabel,
  CourseStudentOptionLabel,
} from '@/features/course-management/components/CourseEntityLabels'
import CourseStudentPicker from '@/features/course-management/components/CourseStudentPicker'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import InlineAsyncMultiSelect from '@/shared/components/generals/InlineAsyncMultiSelect'
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
import { Button, Card, Col, Flex, Row, Space, Tag, Typography, message, theme } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const normalizeInitialValues = (course = {}) => ({
  courseName: course.courseName ?? '',
  courseFeeAmount: course.courseFeeAmount ?? null,
  miscFeeAmount: course.miscFeeAmount ?? null,
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
        {title || <span>{t(`course_management.section.${titleKey}`)}</span>}
      </Space>
    }
    size="small"
    variant="outlined"
    style={{ height: '100%' }}
  >
    {children}
  </Card>
)

const TAX_RATE = 0.09

const getAmount = (value) => Number(value || 0)

const computeGstAmount = (courseFeeAmount, miscFeeAmount) =>
  Math.round((getAmount(courseFeeAmount) + getAmount(miscFeeAmount)) * TAX_RATE * 100) / 100

const getArrayLength = (value) => (Array.isArray(value) ? value.length : 0)

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
  const publishCourse = useAxiosSubmit({
    url: ApiUrls.COURSE_MANAGEMENT.PUBLISH,
    method: 'POST',
  })
  const gstAmount = computeGstAmount(values.courseFeeAmount, values.miscFeeAmount)
  const totalFeeAmount =
    getAmount(values.courseFeeAmount) + getAmount(values.miscFeeAmount) + gstAmount
  const displayValues = useMemo(
    () => ({
      ...values,
      gstAmount,
      totalFeeAmount,
    }),
    [gstAmount, totalFeeAmount, values]
  )
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    displayValues,
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

  const loadStudentOptions = useCallback(async ({ search, page, pageSize }) => {
    const response = await axiosConfig.get(ApiUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX, {
      params: { search, page, pageSize },
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
        label: <CourseStudentOptionLabel student={student} />,
        searchKey: `${student.fullName} ${student.nric} ${student.email} ${student.phoneNumber} ${student.accountNumber}`,
      })),
      totalCount: result?.totalCount || 0,
    }
  }, [])

  const loadFasOptions = useCallback(async ({ search, page, pageSize }) => {
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
  }, [])

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
        placeholder: 'e.g. Software Foundations Cohort 01',
        validate: [maxLen(150)],
      },
      {
        key: 'courseFeeAmount',
        title: t('course_management.field.course_fee_amount'),
        type: 'input-number',
        minValue: 0,
        placeholder: 'e.g. 100.00',
        validate: [numberHigherThanOrEqual(0)],
        props: { ...amountProps, disabled: basicInfoOnly },
      },
      {
        key: 'miscFeeAmount',
        title: t('course_management.field.misc_fee_amount'),
        type: 'input-number',
        minValue: 0,
        placeholder: 'e.g. 100.00',
        validate: [numberHigherThanOrEqual(0)],
        props: { ...amountProps, disabled: basicInfoOnly },
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
      ...(isEdit
        ? []
        : [
            {
              key: 'schoolStudentIds',
              title: null,
              type: 'custom',
              required: false,
              render: ({ value, onChange }) => (
                <CourseStudentPicker
                  value={value}
                  onChange={onChange}
                  options={Object.values(studentOptionCache).map((student) => ({
                    value: student.id,
                    label: <CourseStudentOptionLabel student={student} />,
                    searchKey: `${student.fullName} ${student.nric} ${student.email} ${student.phoneNumber} ${student.accountNumber}`,
                  }))}
                  loadOptions={loadStudentOptions}
                  getStudentById={(studentId) => studentOptionCache[String(studentId)]}
                />
              ),
            },
          ]),
      {
        key: 'fasSchemeIds',
        title: null,
        type: 'custom',
        required: false,
        render: ({ value, onChange }) => (
          <InlineAsyncMultiSelect
            value={value}
            onChange={onChange}
            placeholder={t('course_management.placeholder.select_fas_schemes')}
            options={fasSchemes.map((scheme) => ({
              value: scheme.id,
              label: <CourseFasSchemeOptionLabel scheme={scheme} />,
              searchKey: `${scheme.schemeCode} ${scheme.schemeName}`,
            }))}
            loadOptions={loadFasOptions}
            renderSelectedLabel={(value) => {
              const scheme =
                fasOptionCache[String(value)] ||
                (course.data?.applicableFasSchemes || []).find(
                  (item) => String(item.id) === String(value)
                )
              return <CompactEntityLabel name={scheme?.schemeName || String(value)} />
            }}
          />
        ),
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
      const publishResponse = await publishCourse.submit({
        overrideData: { ids: [courseId] },
      })
      if (!publishResponse) return
    }
    navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.COURSE_MANAGEMENT.DETAIL(courseId)))
  }

  const basicFields = fields.filter((f) => ['courseName'].includes(f.key))
  const feeFields = fields.filter((f) => ['courseFeeAmount', 'miscFeeAmount'].includes(f.key))
  const calculatedFeeFields = useMemo(
    () => [
      {
        key: 'gstAmount',
        title: t('course_management.field.gst_amount'),
        type: 'input-number',
        required: false,
        props: { disabled: true, readOnly: true, precision: 2, prefix: currencySymbol },
      },
      {
        key: 'totalFeeAmount',
        title: t('course_management.field.total_fee_amount'),
        type: 'input-number',
        required: false,
        props: { disabled: true, readOnly: true, precision: 2, prefix: currencySymbol },
      },
    ],
    [currencySymbol, t]
  )
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

          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} lg={12}>
              <FormSectionCard
                title={t('course_management.field.total_fee_amount')}
                icon={<DollarOutlined style={{ color: token.colorSuccess }} />}
                t={t}
              >
                <Row gutter={16}>
                  {feeFields.map((field) => (
                    <Col xs={24} sm={12} key={field.key}>
                      {renderSectionField(field, -1)}
                    </Col>
                  ))}
                  {calculatedFeeFields.map((field) => (
                    <Col xs={24} sm={12} key={field.key}>
                      {renderSectionField(field, -1)}
                    </Col>
                  ))}
                </Row>
              </FormSectionCard>
            </Col>
            <Col xs={24} lg={12}>
              <FormSectionCard
                title={t('course_management.title.important_dates')}
                icon={<CalendarOutlined style={{ color: token.colorPrimary }} />}
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
              icon={<GiftOutlined style={{ color: token.colorInfo }} />}
              t={t}
            >
              {fasFields.map((field) => (
                <div key={field.key}>{renderSectionField(field, -1)}</div>
              ))}
            </FormSectionCard>
          )}

          {studentFields.length > 0 && (
            <FormSectionCard
              title={
                <Space align="center">
                  <span>{t('course_management.title.manage_students')}</span>
                  <Tag color="blue" style={{ borderRadius: 12 }}>
                    {t('course_management.message.number_of_students_count', {
                      count: getArrayLength(values.schoolStudentIds),
                    })}
                  </Tag>
                </Space>
              }
              icon={<TeamOutlined style={{ color: token.colorInfo }} />}
              t={t}
            >
              {studentFields.map((field) => (
                <div key={field.key}>{renderSectionField(field, -1)}</div>
              ))}
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
