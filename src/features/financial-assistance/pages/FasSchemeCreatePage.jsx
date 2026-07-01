import FasConditionEditor from '@/features/financial-assistance/components/FasConditionEditor'
import { getScenarioErrors } from '@/features/financial-assistance/utils/fasConditionValidation'
import {
  buildSchemePayload,
  createEmptyScheme,
  createEmptyTier,
  getDerivedTiers,
  validateTierConfiguration,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import { getCurrencySymbolBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { showErrorToast } from '@/shared/utils/toastUtil'
import { maxLen, numberHigherThan } from '@/shared/utils/validateUtil'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
  Upload,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_SUBSIDY_TYPE = EnumConfig.FasSubsidyType
const FAS_TIER_INCOME_BASIS = EnumConfig.FasTierIncomeBasis
const FIELD_CONTROL_STYLE = { width: '100%', height: 40 }
const TEMPLATE_FILE_ACCEPT = '.pdf,.docx'
const TEMPLATE_FILE_EXTENSIONS = new Set(['.pdf', '.docx'])
const TEMPLATE_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const getFileExtension = (fileName = '') => {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

const isAllowedTemplateFile = (file) => {
  const extension = getFileExtension(file?.name)
  return TEMPLATE_FILE_EXTENSIONS.has(extension) || TEMPLATE_FILE_MIME_TYPES.has(file?.type)
}

const TitleWithHelp = ({ title, help }) => (
  <Flex align="center" gap={8}>
    <Typography.Text strong>{title}</Typography.Text>
    {help ? (
      <Tooltip title={help}>
        <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
      </Tooltip>
    ) : null}
  </Flex>
)

export const FormSection = ({ title, help, children }) => (
  <section
    style={{
      paddingBlock: 24,
      borderTop: '1px solid var(--app-border-color)',
    }}
  >
    <div style={{ marginBottom: 16 }}>
      <TitleWithHelp title={title} help={help} />
    </div>
    {children}
  </section>
)

const TierField = ({ label, help, children, minWidth = 160, flex = '1 1 160px' }) => (
  <Flex vertical gap={6} style={{ minWidth, flex }}>
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Typography.Text>
      {help ? (
        <Tooltip title={help}>
          <QuestionCircleOutlined
            style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}
          />
        </Tooltip>
      ) : null}
    </Flex>
    {children}
  </Flex>
)

const usesPerCapitaRange = (tier) =>
  tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaIncome ||
  tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome

const usesGrossRange = (tier) =>
  tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.GrossHouseholdIncome ||
  tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome

export const TierEditor = ({ tiers, setTiers }) => {
  const { fasSubsidyTypeOptions, fasTierIncomeBasisOptions } = useEnum()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const derivedTiers = useMemo(() => getDerivedTiers(tiers), [tiers])
  const updateTier = (index, patch) =>
    setTiers((current) =>
      current.map((tier, tierIndex) => (tierIndex === index ? { ...tier, ...patch } : tier))
    )
  const createNextTier = (current) => {
    const next = createEmptyTier(current.length)
    const previous = current[current.length - 1]
    if (!previous) return next

    next.tierIncomeBasis = previous.tierIncomeBasis
    return next
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {derivedTiers.map((tier, index) => {
        const usesPci = usesPerCapitaRange(tier)
        const usesGross = usesGrossRange(tier)
        const previousTier = derivedTiers[index - 1]
        const isPerCapitaStartDerived = usesPci && previousTier && usesPerCapitaRange(previousTier)
        const isGrossStartDerived = usesGross && previousTier && usesGrossRange(previousTier)

        return (
          <Card
            key={tier.id || index}
            size="small"
            title={tier.tierName || `Tier ${index + 1}`}
            extra={
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                disabled={tiers.length === 1}
                onClick={() =>
                  setTiers((current) => current.filter((_, tierIndex) => tierIndex !== index))
                }
              />
            }
          >
            <Flex vertical gap={16}>
              <Flex gap={12} wrap="wrap">
                <TierField label="Tier name" minWidth={180}>
                  <Input
                    value={tier.tierName}
                    placeholder="Tier name"
                    style={FIELD_CONTROL_STYLE}
                    onChange={(event) => updateTier(index, { tierName: event.target.value })}
                  />
                </TierField>
                <TierField label="Income basis" minWidth={260} flex="1.5 1 260px">
                  <Select
                    value={tier.tierIncomeBasis}
                    options={fasTierIncomeBasisOptions}
                    style={FIELD_CONTROL_STYLE}
                    onChange={(tierIncomeBasis) => updateTier(index, { tierIncomeBasis })}
                  />
                </TierField>
                <TierField label="Subsidy type" minWidth={180}>
                  <Select
                    value={tier.subsidyType}
                    options={fasSubsidyTypeOptions}
                    style={FIELD_CONTROL_STYLE}
                    onChange={(subsidyType) => updateTier(index, { subsidyType })}
                  />
                </TierField>
                <TierField
                  label="Apply subsidy separately"
                  help="Turn on to set different subsidy values for course fee and misc fee."
                  minWidth={260}
                  flex="1 1 260px"
                >
                  <Flex align="center" gap={8} wrap="wrap" style={{ minHeight: 40 }}>
                    <Switch
                      checked={tier.isPerComponent}
                      onChange={(isPerComponent) =>
                        updateTier(index, {
                          isPerComponent,
                          subsidyValue: isPerComponent ? '' : tier.subsidyValue,
                          courseFeeSubsidyValue: isPerComponent ? tier.courseFeeSubsidyValue : '',
                          miscFeeSubsidyValue: isPerComponent ? tier.miscFeeSubsidyValue : '',
                        })
                      }
                    />
                    <Typography.Text>Course fee and misc fee</Typography.Text>
                  </Flex>
                </TierField>
              </Flex>
              <Flex gap={12} wrap="wrap">
                {usesPci && (
                  <>
                    <TierField
                      label="From"
                      help={
                        isPerCapitaStartDerived
                          ? 'Calculated from the previous tier.'
                          : 'Set where this tier starts.'
                      }
                      minWidth={220}
                    >
                      <InputNumber
                        value={tier.minPerCapitaIncome}
                        min={0}
                        prefix={currencySymbol}
                        disabled={isPerCapitaStartDerived}
                        style={FIELD_CONTROL_STYLE}
                        onChange={(value) => updateTier(index, { minPerCapitaIncome: value ?? '' })}
                      />
                    </TierField>
                    <TierField
                      label="Up to"
                      help="This value is not included in the tier. Leave the last tier empty for and above."
                      minWidth={220}
                    >
                      <InputNumber
                        value={tier.maxPerCapitaIncome}
                        min={0}
                        prefix={currencySymbol}
                        placeholder="No limit"
                        style={FIELD_CONTROL_STYLE}
                        onChange={(value) => updateTier(index, { maxPerCapitaIncome: value ?? '' })}
                      />
                    </TierField>
                  </>
                )}
                {usesGross && (
                  <>
                    <TierField
                      label="From"
                      help={
                        isGrossStartDerived
                          ? 'Calculated from the previous tier.'
                          : 'Set where this tier starts.'
                      }
                      minWidth={240}
                    >
                      <InputNumber
                        value={tier.minGrossHouseholdIncome}
                        min={0}
                        prefix={currencySymbol}
                        disabled={isGrossStartDerived}
                        style={FIELD_CONTROL_STYLE}
                        onChange={(value) =>
                          updateTier(index, { minGrossHouseholdIncome: value ?? '' })
                        }
                      />
                    </TierField>
                    <TierField
                      label="Up to"
                      help="This value is not included in the tier. Leave the last tier empty for and above."
                      minWidth={240}
                    >
                      <InputNumber
                        value={tier.maxGrossHouseholdIncome}
                        min={0}
                        prefix={currencySymbol}
                        placeholder="No limit"
                        style={FIELD_CONTROL_STYLE}
                        onChange={(value) =>
                          updateTier(index, { maxGrossHouseholdIncome: value ?? '' })
                        }
                      />
                    </TierField>
                  </>
                )}
                {tier.isPerComponent ? (
                  <>
                    <TierField label="Course fee subsidy">
                      <InputNumber
                        value={tier.courseFeeSubsidyValue}
                        min={0}
                        max={tier.subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                        prefix={
                          tier.subsidyType === FAS_SUBSIDY_TYPE.FixedAmount
                            ? currencySymbol
                            : undefined
                        }
                        suffix={tier.subsidyType === FAS_SUBSIDY_TYPE.Percent ? '%' : undefined}
                        placeholder="Value"
                        style={FIELD_CONTROL_STYLE}
                        onChange={(value) => updateTier(index, { courseFeeSubsidyValue: value })}
                      />
                    </TierField>
                    <TierField label="Misc fee subsidy">
                      <InputNumber
                        value={tier.miscFeeSubsidyValue}
                        min={0}
                        max={tier.subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                        prefix={
                          tier.subsidyType === FAS_SUBSIDY_TYPE.FixedAmount
                            ? currencySymbol
                            : undefined
                        }
                        suffix={tier.subsidyType === FAS_SUBSIDY_TYPE.Percent ? '%' : undefined}
                        placeholder="Value"
                        style={FIELD_CONTROL_STYLE}
                        onChange={(value) => updateTier(index, { miscFeeSubsidyValue: value })}
                      />
                    </TierField>
                  </>
                ) : (
                  <TierField label="Subsidy">
                    <InputNumber
                      value={tier.subsidyValue}
                      min={0}
                      max={tier.subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                      prefix={
                        tier.subsidyType === FAS_SUBSIDY_TYPE.FixedAmount
                          ? currencySymbol
                          : undefined
                      }
                      suffix={tier.subsidyType === FAS_SUBSIDY_TYPE.Percent ? '%' : undefined}
                      placeholder="Value"
                      style={FIELD_CONTROL_STYLE}
                      onChange={(value) => updateTier(index, { subsidyValue: value })}
                    />
                  </TierField>
                )}
              </Flex>
            </Flex>
          </Card>
        )
      })}
      <Button
        icon={<PlusOutlined />}
        onClick={() => setTiers((current) => [...current, createNextTier(current)])}
      >
        Add tier
      </Button>
    </Space>
  )
}

export const RequiredDocumentsEditor = ({ documents, setDocuments }) => (
  <Space direction="vertical" size={12} style={{ width: '100%' }}>
    <Typography.Text type="secondary">
      Template files support PDF or Word format only (.pdf, .docx).
    </Typography.Text>
    {!documents.length && (
      <Typography.Text type="secondary">
        No documents required yet. Add one when applicants need to upload proof.
      </Typography.Text>
    )}
    {documents.map((document, index) => (
      <Card
        key={document.id || index}
        size="small"
        title={`Document ${index + 1}`}
        extra={
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() =>
              setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))
            }
          />
        }
      >
        <Row gutter={[16, 12]} align="bottom">
          <Col xs={24} lg={14}>
            <TierField label="Document name" minWidth="100%">
              <Input
                value={document.documentName}
                style={FIELD_CONTROL_STYLE}
                placeholder="e.g. Household income statement"
                onChange={(event) =>
                  setDocuments((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, documentName: event.target.value } : item
                    )
                  )
                }
              />
            </TierField>
          </Col>
          <Col xs={24} lg={10}>
            <TierField label="Template file" minWidth="100%">
              <Flex align="center" gap={10} style={{ minHeight: 40, width: '100%', minWidth: 0 }}>
                <Upload
                  accept={TEMPLATE_FILE_ACCEPT}
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    if (!isAllowedTemplateFile(file)) {
                      showErrorToast('Template file must be PDF or Word format (.pdf, .docx).')
                      return Upload.LIST_IGNORE
                    }

                    setDocuments((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, templateFile: file, templateFileName: file.name }
                          : item
                      )
                    )
                    return false
                  }}
                >
                  <Button style={{ height: 40 }}>Upload template</Button>
                </Upload>
                <Tooltip
                  title={
                    document.templateFileName || document.templateFileKey
                      ? document.templateFileName || document.templateFileKey
                      : undefined
                  }
                >
                  <Typography.Text
                    type="secondary"
                    ellipsis
                    style={{ flex: '1 1 0', minWidth: 0 }}
                  >
                    {document.templateFileName || document.templateFileKey || 'No template uploaded'}
                  </Typography.Text>
                </Tooltip>
              </Flex>
            </TierField>
          </Col>
        </Row>
      </Card>
    ))}
    <Button
      icon={<PlusOutlined />}
      onClick={() =>
        setDocuments((current) => [
          ...current,
          {
            id: `doc-${Date.now()}`,
            documentName: '',
            templateFileKey: '',
            templateFileName: '',
            templateFile: null,
          },
        ])
      }
    >
      Add required document
    </Button>
  </Space>
)

export const AdditionalQuestionsEditor = ({ questions, setQuestions }) => (
  <Space direction="vertical" size={12} style={{ width: '100%' }}>
    {!questions.length && (
      <Typography.Text type="secondary">
        No extra questions yet. Add one when reviewers need more applicant details.
      </Typography.Text>
    )}
    {questions.map((question, index) => (
      <Card
        key={question.id || index}
        size="small"
        title={`Question ${index + 1}`}
        extra={
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() =>
              setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))
            }
          />
        }
      >
        <Flex gap={12} align="flex-end" wrap="wrap">
          <TierField label="Question text" minWidth={320} flex="1 1 320px">
            <Input
              value={question.questionText}
              style={FIELD_CONTROL_STYLE}
              placeholder="e.g. Tell us about your financial circumstances"
              onChange={(event) =>
                setQuestions((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, questionText: event.target.value } : item
                  )
                )
              }
            />
          </TierField>
          <TierField label="Applicant must answer" minWidth={180} flex="0 0 180px">
            <Flex align="center" style={{ minHeight: 40 }}>
              <Checkbox
                checked={question.isRequired}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, isRequired: event.target.checked } : item
                    )
                  )
                }
              >
                Required
              </Checkbox>
            </Flex>
          </TierField>
        </Flex>
      </Card>
    ))}
    <Button
      icon={<PlusOutlined />}
      onClick={() =>
        setQuestions((current) => [
          ...current,
          { id: `question-${Date.now()}`, questionText: '', isRequired: false },
        ])
      }
    >
      Add question
    </Button>
  </Space>
)

const FasSchemeCreatePage = () => {
  const navigate = useNavigate()
  const initialScheme = useMemo(() => createEmptyScheme(), [])
  const { values, handleChange, setField, registerRef, validateAll } = useForm({
    schemeName: initialScheme.schemeName,
    description: initialScheme.description,
    durationInMonths: initialScheme.durationInMonths,
    courseIds: [],
  })
  const [submitted, setSubmitted] = useState(false)
  const [conditionGroup, setConditionGroup] = useState(initialScheme.rootConditionGroup)
  const [tiers, setTiers] = useState(initialScheme.tiers)
  const [requiredDocuments, setRequiredDocuments] = useState(initialScheme.requiredDocuments)
  const [additionalQuestions, setAdditionalQuestions] = useState(initialScheme.additionalQuestions)
  const [showConditionErrors, setShowConditionErrors] = useState(false)
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    submitted
  )
  const courses = useFetch(ApiUrls.COURSE_MANAGEMENT.GET_ALL, {}, [])
  const save = useAxiosSubmit({ url: ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX, method: 'POST' })
  const listRoute = routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEMES)

  const courseOptions = useMemo(
    () =>
      (courses.data?.collection || courses.data || []).map((course) => ({
        value: course.id,
        label: [course.courseCode, course.courseName || course.name].filter(Boolean).join(' — '),
      })),
    [courses.data]
  )

  const basicFields = useMemo(
    () => [
      {
        key: 'schemeName',
        title: 'Scheme name',
        validate: [maxLen(150)],
        props: { placeholder: 'Enter scheme name' },
      },
      {
        key: 'durationInMonths',
        title: 'Duration',
        type: 'input-number',
        minValue: 1,
        validate: [numberHigherThan(0)],
        placeholder: 'e.g. 12',
        props: { addonAfter: 'months' },
      },
      {
        key: 'description',
        title: 'Description',
        required: false,
        multiple: 3,
        validate: [maxLen(1000)],
        props: { placeholder: 'Enter description' },
      },
      {
        key: 'courseIds',
        title: 'Courses',
        type: 'select',
        required: false,
        multiple: true,
        options: courseOptions,
        placeholder: 'Select courses',
        props: {
          loading: courses.loading,
          showSearch: true,
          optionFilterProp: 'label',
        },
      },
    ],
    [courseOptions, courses.loading]
  )

  const handleSubmit = async () => {
    setSubmitted(true)
    const derivedTiers = getDerivedTiers(tiers)
    const inputsValid = validateAll()
    const missingInput = hasRequiredMissing(basicFields)
    const conditionErrors = (conditionGroup?.groups || []).flatMap(getScenarioErrors)
    const tierErrors = validateTierConfiguration(derivedTiers)

    if (conditionErrors.length) setShowConditionErrors(true)
    if (!inputsValid || missingInput || conditionErrors.length || tierErrors.length) {
      if (tierErrors.length) showErrorToast(tierErrors[0])
      return
    }
    setShowConditionErrors(false)

    const payload = buildSchemePayload({
      ...values,
      rootConditionGroup: conditionGroup,
      tiers: derivedTiers,
      requiredDocuments,
      schemeCourses: (values.courseIds || []).map((courseId) => ({ courseId })),
      additionalQuestions,
    })
    const response = await save.submit({ overrideData: payload })
    if (response) navigate(listRoute)
  }

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      <Flex align="center" gap={12} wrap="wrap" style={{ marginBottom: 20 }}>
        <Button aria-label="Back" icon={<ArrowLeftOutlined />} onClick={() => navigate(listRoute)} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          Create FAS scheme
        </Typography.Title>
      </Flex>

      <main>
        <FormSection
          title="Basic information"
          help="Name the scheme, set the validity period, and optionally limit it to selected courses."
        >
          <Row gutter={[16, 16]}>
            {basicFields.map((field) => (
              <Col
                key={field.key}
                xs={24}
                md={
                  field.key === 'description' || field.key === 'courseIds'
                    ? 24
                    : field.key === 'schemeName'
                      ? 16
                      : 8
                }
              >
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </FormSection>

        <FormSection
          title="Eligibility conditions"
          help="Build one or more scenarios. A student is eligible when any scenario matches."
        >
          <FasConditionEditor
            value={conditionGroup}
            showValidationErrors={showConditionErrors}
            onChange={(nextConditionGroup) => {
              setShowConditionErrors(false)
              setConditionGroup(nextConditionGroup)
            }}
          />
        </FormSection>

        <FormSection
          title="Tiers"
          help="Build continuous income ranges. From is calculated automatically; only set the upper limit and subsidy."
        >
          <TierEditor tiers={tiers} setTiers={setTiers} />
        </FormSection>

        <FormSection
          title="Required documents"
          help="Add documents the applicant must upload before submission."
        >
          <RequiredDocumentsEditor documents={requiredDocuments} setDocuments={setRequiredDocuments} />
        </FormSection>

        <FormSection
          title="Additional questions"
          help="Collect extra applicant details needed for review."
        >
          <AdditionalQuestionsEditor
            questions={additionalQuestions}
            setQuestions={setAdditionalQuestions}
          />
        </FormSection>
      </main>

      <Flex
        justify="flex-end"
        gap={8}
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid var(--app-border-color)',
        }}
      >
        <Button onClick={() => navigate(listRoute)}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit} loading={save.loading}>
          Create
        </Button>
      </Flex>
    </div>
  )
}

export default FasSchemeCreatePage
