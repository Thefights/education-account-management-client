import FasConditionEditor from '@/features/financial-assistance/components/FasConditionEditor'
import { getScenarioErrors } from '@/features/financial-assistance/utils/fasConditionValidation'
import {
  buildSchemePayload,
  createEmptyScheme,
  createEmptyTier,
  formatTierRange,
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
import { maxLen, numberHigherThan } from '@/shared/utils/validateUtil'
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_SUBSIDY_TYPE = EnumConfig.FasSubsidyType
const FAS_TIER_INCOME_BASIS = EnumConfig.FasTierIncomeBasis

const FormSection = ({ title, children }) => (
  <section
    style={{
      paddingBlock: 20,
      borderTop: '1px solid var(--app-border-color)',
    }}
  >
    <Typography.Text strong style={{ display: 'block', marginBottom: 16 }}>
      {title}
    </Typography.Text>
    {children}
  </section>
)

const TierEditor = ({ tiers, setTiers, subsidyType }) => {
  const { fasTierIncomeBasisOptions } = useEnum()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const updateTier = (index, patch) =>
    setTiers((current) =>
      current.map((tier, tierIndex) => (tierIndex === index ? { ...tier, ...patch } : tier))
    )

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {tiers.map((tier, index) => {
        const usesPci =
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaIncome ||
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
        const usesGross =
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.GrossHouseholdIncome ||
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome

        return (
          <Card
            key={tier.id || index}
            size="small"
            title={`${tier.tierName || `Tier ${index + 1}`} — ${formatTierRange(tier)}`}
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
            <Flex gap={12} wrap="wrap">
              <Input
                value={tier.tierName}
                style={{ width: 180 }}
                placeholder="Tier name"
                onChange={(event) => updateTier(index, { tierName: event.target.value })}
              />
              <Select
                value={tier.tierIncomeBasis}
                style={{ width: 280 }}
                options={fasTierIncomeBasisOptions}
                onChange={(tierIncomeBasis) => {
                  const nextUsesPci =
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaIncome ||
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
                  const nextUsesGross =
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.GrossHouseholdIncome ||
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
                  updateTier(index, {
                    tierIncomeBasis,
                    minPerCapitaIncome: nextUsesPci ? tier.minPerCapitaIncome : '',
                    maxPerCapitaIncome: nextUsesPci ? tier.maxPerCapitaIncome : '',
                    minGrossHouseholdIncome: nextUsesGross ? tier.minGrossHouseholdIncome : '',
                    maxGrossHouseholdIncome: nextUsesGross ? tier.maxGrossHouseholdIncome : '',
                  })
                }}
              />
              <Space>
                <Typography.Text>Per component</Typography.Text>
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
              </Space>
              {usesPci && (
                <>
                  <InputNumber
                    value={tier.minPerCapitaIncome}
                    min={0}
                    prefix={currencySymbol}
                    placeholder="Min PCI"
                    onChange={(value) => updateTier(index, { minPerCapitaIncome: value })}
                  />
                  <InputNumber
                    value={tier.maxPerCapitaIncome}
                    min={0}
                    prefix={currencySymbol}
                    placeholder="Max PCI"
                    onChange={(value) => updateTier(index, { maxPerCapitaIncome: value ?? '' })}
                  />
                </>
              )}
              {usesGross && (
                <>
                  <InputNumber
                    value={tier.minGrossHouseholdIncome}
                    min={0}
                    prefix={currencySymbol}
                    placeholder="Min gross income"
                    onChange={(value) => updateTier(index, { minGrossHouseholdIncome: value })}
                  />
                  <InputNumber
                    value={tier.maxGrossHouseholdIncome}
                    min={0}
                    prefix={currencySymbol}
                    placeholder="Max gross income"
                    onChange={(value) =>
                      updateTier(index, { maxGrossHouseholdIncome: value ?? '' })
                    }
                  />
                </>
              )}
              {tier.isPerComponent ? (
                <>
                  <InputNumber
                    value={tier.courseFeeSubsidyValue}
                    min={0}
                    max={subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                    prefix={subsidyType === FAS_SUBSIDY_TYPE.FixedAmount ? currencySymbol : undefined}
                    suffix={subsidyType === FAS_SUBSIDY_TYPE.Percent ? '%' : undefined}
                    placeholder="Course fee subsidy"
                    onChange={(value) => updateTier(index, { courseFeeSubsidyValue: value })}
                  />
                  <InputNumber
                    value={tier.miscFeeSubsidyValue}
                    min={0}
                    max={subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                    prefix={subsidyType === FAS_SUBSIDY_TYPE.FixedAmount ? currencySymbol : undefined}
                    suffix={subsidyType === FAS_SUBSIDY_TYPE.Percent ? '%' : undefined}
                    placeholder="Misc fee subsidy"
                    onChange={(value) => updateTier(index, { miscFeeSubsidyValue: value })}
                  />
                </>
              ) : (
                <InputNumber
                  value={tier.subsidyValue}
                  min={0}
                  max={subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                  prefix={subsidyType === FAS_SUBSIDY_TYPE.FixedAmount ? currencySymbol : undefined}
                  suffix={subsidyType === FAS_SUBSIDY_TYPE.Percent ? '%' : undefined}
                  placeholder="Subsidy"
                  onChange={(value) => updateTier(index, { subsidyValue: value })}
                />
              )}
            </Flex>
          </Card>
        )
      })}
      <Button
        icon={<PlusOutlined />}
        onClick={() => setTiers((current) => [...current, createEmptyTier(current.length)])}
      >
        Add tier
      </Button>
    </Space>
  )
}

const RequiredDocumentsEditor = ({ documents, setDocuments }) => (
  <Space direction="vertical" style={{ width: '100%' }}>
    {documents.map((document, index) => (
      <Flex key={document.id || index} gap={8} align="center" wrap="wrap">
        <Input
          value={document.documentName}
          style={{ width: 280 }}
          placeholder="Document name"
          onChange={(event) =>
            setDocuments((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, documentName: event.target.value } : item
              )
            )
          }
        />
        <Upload
          maxCount={1}
          showUploadList={false}
          beforeUpload={(file) => {
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
          <Button>Choose template file</Button>
        </Upload>
        <Typography.Text type="secondary">
          {document.templateFileName || document.templateFileKey || 'No template'}
        </Typography.Text>
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() =>
            setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))
          }
        />
      </Flex>
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

const AdditionalQuestionsEditor = ({ questions, setQuestions }) => (
  <Space direction="vertical" style={{ width: '100%' }}>
    {questions.map((question, index) => (
      <Flex key={question.id || index} gap={8} align="center">
        <Input
          value={question.questionText}
          placeholder="Question"
          onChange={(event) =>
            setQuestions((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, questionText: event.target.value } : item
              )
            )
          }
        />
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
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() =>
            setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))
          }
        />
      </Flex>
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
  const _enum = useEnum()
  const initialScheme = useMemo(() => createEmptyScheme(), [])
  const { values, handleChange, setField, registerRef, validateAll } = useForm({
    schemeName: initialScheme.schemeName,
    description: initialScheme.description,
    durationInMonths: initialScheme.durationInMonths,
    subsidyType: initialScheme.subsidyType,
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
        key: 'subsidyType',
        title: 'Subsidy type',
        type: 'select',
        options: _enum.fasSubsidyTypeOptions,
        placeholder: 'Select subsidy type',
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
    [_enum.fasSubsidyTypeOptions, courseOptions, courses.loading]
  )

  const handleSubmit = async () => {
    setSubmitted(true)
    const inputsValid = validateAll()
    const missingInput = hasRequiredMissing(basicFields)
    const conditionErrors = (conditionGroup?.groups || []).flatMap(getScenarioErrors)
    const tierErrors = validateTierConfiguration(tiers, values.subsidyType)

    if (conditionErrors.length) setShowConditionErrors(true)
    if (!inputsValid || missingInput || conditionErrors.length || tierErrors.length) {
      if (tierErrors.length) message.error(tierErrors[0])
      return
    }
    setShowConditionErrors(false)

    const payload = buildSchemePayload({
      ...values,
      rootConditionGroup: conditionGroup,
      tiers,
      requiredDocuments,
      schemeCourses: (values.courseIds || []).map((courseId) => ({ courseId })),
      additionalQuestions,
    })
    const response = await save.submit({ overrideData: payload })
    if (response) navigate(listRoute)
  }

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      <Flex vertical gap={4}>
        <Flex align="center" gap={12} wrap="wrap">
          <Button aria-label="Back" icon={<ArrowLeftOutlined />} onClick={() => navigate(listRoute)} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Create FAS scheme
          </Typography.Title>
        </Flex>

        <FormSection title="Basic information">
          <Row gutter={[16, 16]}>
            {basicFields.map((field) => (
              <Col key={field.key} xs={24} md={field.key === 'description' || field.key === 'courseIds' ? 24 : 8}>
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </FormSection>

        <FormSection title="Eligibility conditions">
          <FasConditionEditor
            value={conditionGroup}
            showValidationErrors={showConditionErrors}
            onChange={(nextConditionGroup) => {
              setShowConditionErrors(false)
              setConditionGroup(nextConditionGroup)
            }}
          />
        </FormSection>

        <FormSection title="Tiers">
          <TierEditor tiers={tiers} setTiers={setTiers} subsidyType={values.subsidyType} />
        </FormSection>

        <FormSection title="Required documents">
          <RequiredDocumentsEditor
            documents={requiredDocuments}
            setDocuments={setRequiredDocuments}
          />
        </FormSection>

        <FormSection title="Additional questions">
          <AdditionalQuestionsEditor
            questions={additionalQuestions}
            setQuestions={setAdditionalQuestions}
          />
        </FormSection>

        <Divider style={{ margin: '20px 0 0' }} />
        <Flex justify="flex-end" gap={8} style={{ paddingTop: 20 }}>
          <Button onClick={() => navigate(listRoute)}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={save.loading}>
            Create
          </Button>
        </Flex>
      </Flex>
    </div>
  )
}

export default FasSchemeCreatePage
