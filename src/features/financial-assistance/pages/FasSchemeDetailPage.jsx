import FasConditionEditor from '@/features/financial-assistance/components/FasConditionEditor'
import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  AdditionalQuestionsEditor,
  FormSection,
  RequiredDocumentsEditor,
  TierEditor,
} from '@/features/financial-assistance/pages/FasSchemeCreatePage'
import { getScenarioErrors } from '@/features/financial-assistance/utils/fasConditionValidation'
import {
  buildSchemePayload,
  getDerivedTiers,
  getSchemeFormValue,
  validateTierConfiguration,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { envConfig } from '@/shared/config/envConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { ApartmentOutlined, ArrowLeftOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  Empty,
  Flex,
  Input,
  InputNumber,
  List,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tree,
  Typography,
  theme,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const fieldLabels = {
  [EnumConfig.FasConditionField.StudentAge]: 'Student age',
  [EnumConfig.FasConditionField.StudentNationality]: 'Student nationality',
  [EnumConfig.FasConditionField.GuardianNationality]: 'Guardian nationality',
  [EnumConfig.FasConditionField.GrossHouseholdIncome]: 'Gross household income',
  [EnumConfig.FasConditionField.PerCapitaIncome]: 'Per-capita income',
}

const operatorLabels = {
  [EnumConfig.FasConditionOperator.Equal]: 'is equal to',
  [EnumConfig.FasConditionOperator.NotEqual]: 'is not equal to',
  [EnumConfig.FasConditionOperator.LessThan]: 'is less than',
  [EnumConfig.FasConditionOperator.LessThanOrEqual]: 'is at most',
  [EnumConfig.FasConditionOperator.GreaterThan]: 'is greater than',
  [EnumConfig.FasConditionOperator.GreaterThanOrEqual]: 'is at least',
  [EnumConfig.FasConditionOperator.Between]: 'is between',
}

const nationalityLabels = {
  [EnumConfig.NationalityCategory.SingaporeCitizen]: 'Singapore Citizen',
  [EnumConfig.NationalityCategory.Other]: 'Foreigner',
}

const controlStyle = { width: '100%', minHeight: 40 }
const valueStyle = { minHeight: 40, display: 'flex', alignItems: 'center' }

const formatConditionValue = (condition) => {
  if (condition.nationality) return nationalityLabels[condition.nationality] || condition.nationality
  if (condition.operator === EnumConfig.FasConditionOperator.Between) {
    return `${condition.valueNumber ?? '-'} and ${condition.valueNumberTo ?? '-'}`
  }
  return condition.valueNumber ?? '-'
}

const formatSubsidy = (value, type) => {
  if (value == null) return renderEmptyFallback(null)
  return type === EnumConfig.FasSubsidyType.Percent
    ? `${value}%`
    : formatCurrencyBasedOnCurrentLanguage(value)
}

const formatIncomeRange = (min, max) => {
  const minimum = Number(min || 0)
  if (max == null || max === '') {
    return `${formatCurrencyBasedOnCurrentLanguage(minimum)} and above`
  }
  const maximum = formatCurrencyBasedOnCurrentLanguage(max)
  if (minimum === 0) return `Below ${maximum}`
  return `${formatCurrencyBasedOnCurrentLanguage(minimum)} – below ${maximum}`
}

const getTierRangeText = (tier) => {
  const ranges = []
  if (
    tier.tierIncomeBasis === EnumConfig.FasTierIncomeBasis.PerCapitaIncome ||
    tier.tierIncomeBasis === EnumConfig.FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome
  ) {
    ranges.push(`Per capita: ${formatIncomeRange(tier.minPerCapitaIncome, tier.maxPerCapitaIncome)}`)
  }
  if (
    tier.tierIncomeBasis === EnumConfig.FasTierIncomeBasis.GrossHouseholdIncome ||
    tier.tierIncomeBasis === EnumConfig.FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome
  ) {
    ranges.push(
      `Gross household: ${formatIncomeRange(tier.minGrossHouseholdIncome, tier.maxGrossHouseholdIncome)}`
    )
  }
  return ranges
}

const getTemplateUrl = (fileKey) => {
  if (!fileKey) return null
  if (/^https?:\/\//i.test(fileKey)) return fileKey
  return `${envConfig.imageCloudUrl.replace(/\/$/, '')}/${fileKey.replace(/^\//, '')}`
}

const ViewField = ({ label, children }) => (
  <Flex vertical gap={6}>
    <Typography.Text strong>{label}</Typography.Text>
    <div style={valueStyle}>{children}</div>
  </Flex>
)

const EligibilityView = ({ value }) => {
  const scenarios = value?.groups || []
  const { token } = theme.useToken()
  if (!scenarios.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  const getConditionText = (condition) =>
    `${fieldLabels[condition.field] || condition.field} ${operatorLabels[condition.operator] || condition.operator} ${formatConditionValue(condition)}`
  const treeData = scenarios.map((scenario, scenarioIndex) => ({
    key: `scenario-${scenarioIndex}`,
    icon: <ApartmentOutlined />,
    title: (
      <Space size={8} wrap>
        <Typography.Text strong>Scenario {scenarioIndex + 1}</Typography.Text>
        <Tag color="blue">AND</Tag>
        <Typography.Text type="secondary">All conditions must match</Typography.Text>
      </Space>
    ),
    children: (scenario.conditions || []).map((condition, conditionIndex) => ({
      key: `scenario-${scenarioIndex}-condition-${condition.id ?? conditionIndex}`,
      title: (
        <Typography.Text>
          <Typography.Text strong>{fieldLabels[condition.field] || condition.field}</Typography.Text>{' '}
          {operatorLabels[condition.operator] || condition.operator}{' '}
          <Typography.Text strong>{formatConditionValue(condition)}</Typography.Text>
        </Typography.Text>
      ),
    })),
  }))

  return (
    <Flex vertical gap={12}>
      <div
        style={{
          padding: 14,
          borderRadius: token.borderRadiusLG,
          background: token.colorInfoBg,
          border: `1px solid ${token.colorInfoBorder}`,
        }}
      >
        <Typography.Text type="secondary">Eligibility summary</Typography.Text>
        <Typography.Paragraph strong style={{ margin: '4px 0 0' }}>
          A student is eligible if:
        </Typography.Paragraph>
        <Flex vertical gap={4}>
          {scenarios.map((scenario, index) => (
            <Typography.Text key={scenario.id ?? index}>
              Scenario {index + 1}: {(scenario.conditions || []).map(getConditionText).join(' AND ')}
            </Typography.Text>
          ))}
        </Flex>
      </div>
      <Tree
        showIcon
        showLine
        selectable={false}
        defaultExpandAll
        treeData={treeData}
        style={{
          padding: 12,
          borderRadius: token.borderRadiusLG,
          background: token.colorFillAlter,
        }}
      />
    </Flex>
  )
}

const FasSchemeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const detail = useFetch(ApiUrls.FAS_SCHEME_MANAGEMENT.DETAIL(id), {}, [id])
  const courses = useFetch(ApiUrls.COURSE_MANAGEMENT.GET_ALL, {}, [])
  const update = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.DETAIL(id),
    method: 'PUT',
  })
  const scheme = detail.data
  const listRoute = routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEMES)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [showConditionErrors, setShowConditionErrors] = useState(false)

  const courseOptions = useMemo(
    () =>
      (courses.data?.collection || courses.data || []).map((course) => ({
        value: course.id,
        label: [course.courseCode, course.courseName || course.name].filter(Boolean).join(' — '),
      })),
    [courses.data]
  )

  const selectedCourseIds = (form?.schemeCourses || []).map((course) => course.courseId)
  const setFormField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const setTiers = (updater) =>
    setForm((current) => ({
      ...current,
      tiers: typeof updater === 'function' ? updater(current.tiers) : updater,
    }))
  const setRequiredDocuments = (updater) =>
    setForm((current) => ({
      ...current,
      requiredDocuments:
        typeof updater === 'function' ? updater(current.requiredDocuments) : updater,
    }))
  const setAdditionalQuestions = (updater) =>
    setForm((current) => ({
      ...current,
      additionalQuestions:
        typeof updater === 'function' ? updater(current.additionalQuestions) : updater,
    }))

  const handleCancel = () => {
    setForm(getSchemeFormValue(scheme))
    setShowConditionErrors(false)
    setEditing(false)
  }

  const handleSave = async () => {
    if (!form.schemeName?.trim()) return showErrorToast('Scheme name is required.')
    if (form.schemeName.length > 150) return showErrorToast('Scheme name cannot exceed 150 characters.')
    if (!form.durationInMonths || Number(form.durationInMonths) <= 0) {
      return showErrorToast('Duration must be greater than 0.')
    }
    if ((form.description || '').length > 1000) {
      return showErrorToast('Description cannot exceed 1000 characters.')
    }

    const conditionErrors = (form.rootConditionGroup?.groups || []).flatMap(getScenarioErrors)
    const derivedTiers = getDerivedTiers(form.tiers)
    const tierErrors = validateTierConfiguration(derivedTiers)
    if (conditionErrors.length) {
      setShowConditionErrors(true)
      return showErrorToast(conditionErrors[0])
    }
    if (tierErrors.length) return showErrorToast(tierErrors[0])

    const response = await update.submit({
      overrideData: buildSchemePayload({ ...form, tiers: derivedTiers }),
    })
    if (!response) return

    setShowConditionErrors(false)
    setEditing(false)
    await detail.fetch()
  }

  const tierColumns = [
    { title: 'Tier', dataIndex: 'tierName', key: 'tierName' },
    {
      title: 'Income basis',
      dataIndex: 'tierIncomeBasis',
      key: 'tierIncomeBasis',
      render: (value) => String(value || '-').replace(/([a-z])([A-Z])/g, '$1 $2'),
    },
    {
      title: 'Income range',
      key: 'incomeRange',
      render: (_, tier) => (
        <Flex vertical gap={2}>
          {getTierRangeText(tier).map((range) => (
            <Typography.Text key={range}>{range}</Typography.Text>
          ))}
        </Flex>
      ),
    },
    {
      title: 'Subsidy',
      key: 'subsidy',
      render: (_, tier) =>
        tier.isPerComponent
          ? `Course fee: ${formatSubsidy(tier.courseFeeSubsidyValue, tier.subsidyType)} · Misc. fee: ${formatSubsidy(tier.miscFeeSubsidyValue, tier.subsidyType)}`
          : formatSubsidy(tier.subsidyValue, tier.subsidyType),
    },
  ]

  if (detail.loading && !scheme) {
    return <Skeleton active paragraph={{ rows: 14 }} style={{ padding: '20px 28px' }} />
  }
  if (!scheme) {
    return (
      <Result
        status="404"
        title="FAS scheme not found"
        extra={<Button onClick={() => navigate(listRoute)}>Back to schemes</Button>}
      />
    )
  }

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      <Flex align="center" justify="space-between" gap={12} wrap="wrap" style={{ marginBottom: 20 }}>
        <Flex align="center" gap={12}>
          <Button aria-label="Back" icon={<ArrowLeftOutlined />} onClick={() => navigate(listRoute)} />
          <div>
            <Flex align="center" gap={8} wrap="wrap">
              <Typography.Title level={4} style={{ margin: 0 }}>FAS scheme details</Typography.Title>
              <FasStatusTag status={scheme.status} />
            </Flex>
            <Typography.Text type="secondary">{scheme.schemeCode}</Typography.Text>
          </div>
        </Flex>
        {editing ? (
          <Space>
            <Button onClick={handleCancel} disabled={update.loading}>Cancel</Button>
            <Button type="primary" onClick={handleSave} loading={update.loading}>Save</Button>
          </Space>
        ) : (
          <Button
            type="primary"
            onClick={() => {
              setForm(getSchemeFormValue(scheme))
              setEditing(true)
            }}
          >
            Update
          </Button>
        )}
      </Flex>

      <main>
        <FormSection
          title="Basic information"
          help="Name the scheme, set the validity period, and optionally limit it to selected courses."
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              {editing ? (
                <ViewField label="Scheme name">
                  <Input
                    value={form.schemeName}
                    style={controlStyle}
                    placeholder="Enter scheme name"
                    onChange={(event) => setFormField('schemeName', event.target.value)}
                  />
                </ViewField>
              ) : (
                <ViewField label="Scheme name"><Typography.Text>{scheme.schemeName}</Typography.Text></ViewField>
              )}
            </Col>
            <Col xs={24} md={8}>
              {editing ? (
                <ViewField label="Duration">
                  <InputNumber
                    value={form.durationInMonths}
                    min={1}
                    addonAfter="months"
                    style={controlStyle}
                    onChange={(value) => setFormField('durationInMonths', value)}
                  />
                </ViewField>
              ) : (
                <ViewField label="Duration"><Typography.Text>{scheme.durationInMonths} months</Typography.Text></ViewField>
              )}
            </Col>
            <Col span={24}>
              {editing ? (
                <ViewField label="Description">
                  <Input.TextArea
                    value={form.description}
                    rows={3}
                    placeholder="Enter description"
                    onChange={(event) => setFormField('description', event.target.value)}
                  />
                </ViewField>
              ) : (
                <ViewField label="Description">
                  <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {scheme.description || renderEmptyFallback(null)}
                  </Typography.Paragraph>
                </ViewField>
              )}
            </Col>
            <Col span={24}>
              {editing ? (
                <ViewField label="Courses">
                  <Select
                    mode="multiple"
                    value={selectedCourseIds}
                    options={courseOptions}
                    loading={courses.loading}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select courses"
                    style={controlStyle}
                    onChange={(courseIds) =>
                      setFormField('schemeCourses', courseIds.map((courseId) => ({ courseId })))
                    }
                  />
                </ViewField>
              ) : (
                <ViewField label="Courses">
                  <Flex gap={8} wrap="wrap">
                    {(scheme.schemeCourses || []).length
                      ? scheme.schemeCourses.map((course) => (
                          <Tag key={course.id || course.courseId}>
                            {course.courseCode} · {course.courseName}
                          </Tag>
                        ))
                      : renderEmptyFallback(null)}
                  </Flex>
                </ViewField>
              )}
            </Col>
          </Row>
        </FormSection>

        <FormSection
          title="Eligibility conditions"
          help="Build one or more scenarios. A student is eligible when any scenario matches."
        >
          {editing ? (
            <FasConditionEditor
              value={form.rootConditionGroup}
              showValidationErrors={showConditionErrors}
              onChange={(value) => {
                setShowConditionErrors(false)
                setFormField('rootConditionGroup', value)
              }}
            />
          ) : (
            <EligibilityView value={scheme.rootConditionGroup} />
          )}
        </FormSection>

        <FormSection
          title="Tiers"
          help="Build continuous income ranges. From is calculated automatically; only set the upper limit and subsidy."
        >
          {editing ? (
            <TierEditor tiers={form.tiers} setTiers={setTiers} />
          ) : (
            <Table rowKey="id" columns={tierColumns} dataSource={scheme.tiers || []} pagination={false} scroll={{ x: 720 }} />
          )}
        </FormSection>

        <FormSection title="Required documents" help="Add documents the applicant must upload before submission.">
          {editing ? (
            <RequiredDocumentsEditor documents={form.requiredDocuments} setDocuments={setRequiredDocuments} />
          ) : (
            <List
              dataSource={scheme.requiredDocuments || []}
              locale={{ emptyText: renderEmptyFallback(null) }}
              renderItem={(document, index) => (
                <List.Item
                  extra={
                    document.templateFileKey ? (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        href={getTemplateUrl(document.templateFileKey)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View template
                      </Button>
                    ) : (
                      <Typography.Text type="secondary">No template</Typography.Text>
                    )
                  }
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={`${index + 1}. ${document.documentName}`}
                    description={document.templateFileKey || undefined}
                  />
                </List.Item>
              )}
            />
          )}
        </FormSection>

        <FormSection title="Additional questions" help="Collect extra applicant details needed for review.">
          {editing ? (
            <AdditionalQuestionsEditor questions={form.additionalQuestions} setQuestions={setAdditionalQuestions} />
          ) : (
            <List
              dataSource={scheme.additionalQuestions || []}
              locale={{ emptyText: renderEmptyFallback(null) }}
              renderItem={(question, index) => (
                <List.Item extra={<Tag>{question.isRequired ? 'Required' : 'Optional'}</Tag>}>
                  <Typography.Text>{index + 1}. {question.questionText}</Typography.Text>
                </List.Item>
              )}
            />
          )}
        </FormSection>
      </main>

    </div>
  )
}

export default FasSchemeDetailPage
