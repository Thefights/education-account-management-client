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
  formatFriendlyTierRanges,
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
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { ApartmentOutlined, ArrowLeftOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import {
  Button,
  Checkbox,
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

const getFieldLabels = (t) => ({
  [EnumConfig.FasConditionField.StudentAge]: t('financial_assistance.admin.condition.field.student_age'),
  [EnumConfig.FasConditionField.StudentNationality]: t(
    'financial_assistance.admin.condition.field.student_nationality'
  ),
  [EnumConfig.FasConditionField.GuardianNationality]: t('financial_assistance.field.guardian_nationality'),
  [EnumConfig.FasConditionField.GrossHouseholdIncome]: t('financial_assistance.field.gross_household_income'),
  [EnumConfig.FasConditionField.PerCapitaIncome]: t('financial_assistance.field.per_capita_income'),
})

const getOperatorLabels = (t) => ({
  [EnumConfig.FasConditionOperator.Equal]: t('financial_assistance.admin.condition.operator_text.equal'),
  [EnumConfig.FasConditionOperator.NotEqual]: t('financial_assistance.admin.condition.operator_text.not_equal'),
  [EnumConfig.FasConditionOperator.LessThan]: t('financial_assistance.admin.condition.operator_text.less_than'),
  [EnumConfig.FasConditionOperator.LessThanOrEqual]: t(
    'financial_assistance.admin.condition.operator_text.less_than_or_equal'
  ),
  [EnumConfig.FasConditionOperator.GreaterThan]: t(
    'financial_assistance.admin.condition.operator_text.greater_than'
  ),
  [EnumConfig.FasConditionOperator.GreaterThanOrEqual]: t(
    'financial_assistance.admin.condition.operator_text.greater_than_or_equal'
  ),
  [EnumConfig.FasConditionOperator.Between]: t('financial_assistance.admin.condition.operator_text.between'),
})

const getNationalityLabels = (t) => ({
  [EnumConfig.NationalityCategory.SingaporeCitizen]: t(
    'financial_assistance.enum.nationality.singapore_citizen'
  ),
  [EnumConfig.NationalityCategory.Other]: t('financial_assistance.enum.nationality.foreigner'),
})

const controlStyle = { width: '100%', minHeight: 40 }
const valueStyle = { minHeight: 40, display: 'flex', alignItems: 'center' }

const formatConditionValue = (condition, t) => {
  const nationalityLabels = getNationalityLabels(t)
  if (condition.nationality) return nationalityLabels[condition.nationality] || condition.nationality
  if (condition.operator === EnumConfig.FasConditionOperator.Between) {
    return `${condition.valueNumber ?? '-'} ${t('financial_assistance.admin.text.and')} ${
      condition.valueNumberTo ?? '-'
    }`
  }
  return condition.valueNumber ?? '-'
}

const formatSubsidy = (value, type) => {
  if (value == null) return renderEmptyFallback(null)
  return type === EnumConfig.FasSubsidyType.Percent
    ? `${value}%`
    : formatCurrencyBasedOnCurrentLanguage(value)
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
  const { t } = useTranslation()
  const scenarios =
    value?.groups?.length || !value?.conditions?.length
      ? value?.groups || []
      : [{ ...value, groups: [] }]
  const { token } = theme.useToken()
  const visibleScenarios = scenarios.filter((scenario) => (scenario.conditions || []).length)
  if (!visibleScenarios.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  const fieldLabels = getFieldLabels(t)
  const operatorLabels = getOperatorLabels(t)
  const getConditionText = (condition) =>
    `${fieldLabels[condition.field] || condition.field} ${operatorLabels[condition.operator] || condition.operator} ${formatConditionValue(condition, t)}`
  const treeData = visibleScenarios.map((scenario, scenarioIndex) => ({
    key: `scenario-${scenarioIndex}`,
    icon: <ApartmentOutlined />,
    title: (
      <Space size={8} wrap>
        <Typography.Text strong>
          {t('financial_assistance.admin.text.scenario_number', { number: scenarioIndex + 1 })}
        </Typography.Text>
        <Tag color="blue">AND</Tag>
        <Typography.Text type="secondary">
          {t('financial_assistance.admin.condition.all_conditions_match')}
        </Typography.Text>
      </Space>
    ),
    children: (scenario.conditions || []).map((condition, conditionIndex) => ({
      key: `scenario-${scenarioIndex}-condition-${condition.id ?? conditionIndex}`,
      title: (
        <Typography.Text>
          <Typography.Text strong>{fieldLabels[condition.field] || condition.field}</Typography.Text>{' '}
          {operatorLabels[condition.operator] || condition.operator}{' '}
          <Typography.Text strong>{formatConditionValue(condition, t)}</Typography.Text>
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
        <Typography.Text type="secondary">
          {t('financial_assistance.admin.condition.eligibility_summary')}
        </Typography.Text>
        <Typography.Paragraph strong style={{ margin: '4px 0 0' }}>
          {t('financial_assistance.admin.condition.student_eligible_if')}
        </Typography.Paragraph>
        <Flex vertical gap={4}>
          {visibleScenarios.map((scenario, index) => (
            <Typography.Text key={scenario.id ?? index}>
              {t('financial_assistance.admin.text.scenario_number', { number: index + 1 })}:{' '}
              {(scenario.conditions || []).map(getConditionText).join(' AND ')}
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
  const { t } = useTranslation()
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
  const canUpdateScheme = scheme?.status === EnumConfig.FasSchemeStatus.Draft

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
    if (!form.schemeName?.trim()) return showErrorToast(t('financial_assistance.admin.message.scheme_name_required'))
    if (form.schemeName.length > 150) return showErrorToast(t('financial_assistance.admin.message.scheme_name_max'))
    if (!form.durationInMonths || Number(form.durationInMonths) <= 0) {
      return showErrorToast(t('financial_assistance.admin.message.duration_positive'))
    }
    if ((form.description || '').length > 1000) {
      return showErrorToast(t('financial_assistance.admin.message.description_max'))
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
    { title: t('financial_assistance.section.tier'), dataIndex: 'tierName', key: 'tierName' },
    {
      title: t('financial_assistance.admin.field.income_basis'),
      dataIndex: 'tierIncomeBasis',
      key: 'tierIncomeBasis',
      render: (value) => String(value || '-').replace(/([a-z])([A-Z])/g, '$1 $2'),
    },
    {
      title: t('financial_assistance.admin.field.income_range'),
      key: 'incomeRange',
      render: (_, tier) => (
        <Flex vertical gap={2}>
          {formatFriendlyTierRanges(tier).map((range) => (
            <Typography.Text key={range}>{range}</Typography.Text>
          ))}
        </Flex>
      ),
    },
    {
      title: t('financial_assistance.admin.field.subsidy'),
      key: 'subsidy',
      render: (_, tier) =>
        tier.isPerComponent
          ? t('financial_assistance.admin.text.per_component_subsidy', {
              course: formatSubsidy(tier.courseFeeSubsidyValue, tier.subsidyType),
              misc: formatSubsidy(tier.miscFeeSubsidyValue, tier.subsidyType),
            })
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
        title={t('financial_assistance.admin.scheme.not_found')}
        extra={<Button onClick={() => navigate(listRoute)}>{t('financial_assistance.admin.action.back_to_schemes')}</Button>}
      />
    )
  }

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      <Flex align="center" justify="space-between" gap={12} wrap="wrap" style={{ marginBottom: 20 }}>
        <Flex align="center" gap={12}>
          <Button
            aria-label={t('financial_assistance.admin.action.back')}
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(listRoute)}
          />
          <div>
            <Flex align="center" gap={8} wrap="wrap">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('financial_assistance.admin.scheme.detail_title')}
              </Typography.Title>
              <FasStatusTag status={scheme.status} />
            </Flex>
            <Typography.Text type="secondary">{scheme.schemeCode}</Typography.Text>
          </div>
        </Flex>
        {editing ? (
          <Space>
            <Button onClick={handleCancel} disabled={update.loading}>{t('button.cancel')}</Button>
            <Button type="primary" onClick={handleSave} loading={update.loading}>{t('button.save')}</Button>
          </Space>
        ) : canUpdateScheme ? (
          <Button
            type="primary"
            onClick={() => {
              setForm(getSchemeFormValue(scheme))
              setEditing(true)
            }}
          >
            {t('button.update')}
          </Button>
        ) : null}
      </Flex>

      <main>
        <FormSection
          title={t('financial_assistance.admin.section.basic_information')}
          help={t('financial_assistance.admin.help.basic_information')}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              {editing ? (
                <ViewField label={t('financial_assistance.field.scheme_name')}>
                  <Input
                    value={form.schemeName}
                    style={controlStyle}
                    placeholder={t('financial_assistance.admin.placeholder.enter_scheme_name')}
                    onChange={(event) => setFormField('schemeName', event.target.value)}
                  />
                </ViewField>
              ) : (
                <ViewField label={t('financial_assistance.field.scheme_name')}><Typography.Text>{scheme.schemeName}</Typography.Text></ViewField>
              )}
            </Col>
            <Col xs={24} md={8}>
              {editing ? (
                <ViewField label={t('financial_assistance.admin.field.duration')}>
                  <InputNumber
                    value={form.durationInMonths}
                    min={1}
                    addonAfter={t('financial_assistance.admin.text.months')}
                    style={controlStyle}
                    onChange={(value) => setFormField('durationInMonths', value)}
                  />
                </ViewField>
              ) : (
                <ViewField label={t('financial_assistance.admin.field.duration')}>
                  <Typography.Text>
                    {t('financial_assistance.text.months', { count: scheme.durationInMonths })}
                  </Typography.Text>
                </ViewField>
              )}
            </Col>
            <Col span={24}>
              {editing ? (
                <ViewField label={t('financial_assistance.admin.field.description')}>
                  <Input.TextArea
                    value={form.description}
                    rows={3}
                    placeholder={t('financial_assistance.admin.placeholder.enter_description')}
                    onChange={(event) => setFormField('description', event.target.value)}
                  />
                </ViewField>
              ) : (
                <ViewField label={t('financial_assistance.admin.field.description')}>
                  <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {scheme.description || renderEmptyFallback(null)}
                  </Typography.Paragraph>
                </ViewField>
              )}
            </Col>
            <Col span={24}>
              {editing ? (
                <ViewField label={t('financial_assistance.admin.field.courses')}>
                  <Select
                    mode="multiple"
                    value={selectedCourseIds}
                    options={courseOptions}
                    loading={courses.loading}
                    showSearch
                    optionFilterProp="label"
                    placeholder={t('financial_assistance.admin.placeholder.select_courses')}
                    style={controlStyle}
                    optionRender={(option) => (
                      <Checkbox
                        checked={selectedCourseIds.some(
                          (courseId) => String(courseId) === String(option.value)
                        )}
                        disabled={option.data.disabled}
                        style={{ pointerEvents: 'none' }}
                      >
                        {option.label}
                      </Checkbox>
                    )}
                    onChange={(courseIds) =>
                      setFormField('schemeCourses', courseIds.map((courseId) => ({ courseId })))
                    }
                  />
                </ViewField>
              ) : (
                <ViewField label={t('financial_assistance.admin.field.courses')}>
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
          title={t('financial_assistance.admin.section.eligibility_conditions')}
          help={t('financial_assistance.admin.help.eligibility_conditions')}
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
          title={t('financial_assistance.admin.section.tiers')}
          help={t('financial_assistance.admin.help.tiers')}
        >
          {editing ? (
            <TierEditor tiers={form.tiers} setTiers={setTiers} />
          ) : (
            <Table rowKey="id" columns={tierColumns} dataSource={scheme.tiers || []} pagination={false} scroll={{ x: 720 }} />
          )}
        </FormSection>

        <FormSection
          title={t('financial_assistance.section.required_documents')}
          help={t('financial_assistance.admin.help.required_documents')}
        >
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
                        {t('financial_assistance.admin.action.view_template')}
                      </Button>
                    ) : (
                      <Typography.Text type="secondary">{t('financial_assistance.admin.empty.no_template')}</Typography.Text>
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

        <FormSection
          title={t('financial_assistance.section.additional_questions')}
          help={t('financial_assistance.admin.help.additional_questions')}
        >
          {editing ? (
            <AdditionalQuestionsEditor questions={form.additionalQuestions} setQuestions={setAdditionalQuestions} />
          ) : (
            <List
              dataSource={scheme.additionalQuestions || []}
              locale={{ emptyText: renderEmptyFallback(null) }}
              renderItem={(question, index) => (
                <List.Item
                  extra={
                    <Tag>
                      {question.isRequired
                        ? t('financial_assistance.status.required')
                        : t('financial_assistance.status.optional')}
                    </Tag>
                  }
                >
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
