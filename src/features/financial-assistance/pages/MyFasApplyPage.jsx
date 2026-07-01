import {
  buildApplicationPayload,
  formatFriendlyTierRanges,
  formatSubsidy,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  formatCurrencyBasedOnCurrentLanguage,
  getCurrencySymbolBasedOnCurrentLanguage,
} from '@/shared/utils/formatCurrencyUtil'
import { showErrorToast, showSuccessToast } from '@/shared/utils/toastUtil'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  FileAddOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Input,
  InputNumber,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  Upload,
  theme,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NATIONALITY = EnumConfig.NationalityCategory

const getRequiredDocuments = (scheme) => scheme.requiredDocuments || []

const ApplicationSection = ({
  scheme,
  draft,
  household,
  loading,
  onSaveDraft,
  onSubmit,
}) => {
  const { token } = theme.useToken()
  const { t } = useTranslation()
  const [documents, setDocuments] = useState(() =>
    getRequiredDocuments(scheme).map((document) => {
      const existing = (draft?.documents || []).find(
        (item) =>
          item.requiredDocumentId === document.id || item.fasRequiredDocumentId === document.id
      )
      return {
        requiredDocumentId: document.id,
        documentName: document.documentName,
        file: null,
        fileKey: existing?.fileKey || '',
        fileName: existing?.fileName || '',
      }
    })
  )
  const [answers, setAnswers] = useState(() =>
    (scheme.additionalQuestions || []).map((question) => {
      const existing = (draft?.additionalAnswers || []).find(
        (item) => item.fasSchemeAdditionalQuestionId === question.id
      )
      return {
        fasSchemeAdditionalQuestionId: question.id,
        questionText: question.questionText,
        isRequired: question.isRequired,
        answerText: existing?.answerText || '',
      }
    })
  )

  const uploadedCount = documents.filter((document) => document.file || document.fileKey).length
  const answeredCount = answers.filter((answer) => answer.answerText.trim()).length
  const requiredAnswers = answers.filter((answer) => answer.isRequired)
  const completedRequiredAnswers = requiredAnswers.filter((answer) => answer.answerText.trim()).length
  const completionTotal = documents.length + requiredAnswers.length
  const completionCount = uploadedCount + completedRequiredAnswers
  const completionPercent = completionTotal
    ? Math.round((completionCount / completionTotal) * 100)
    : 100

  const payload = () =>
    buildApplicationPayload({
      schemeId: scheme.id,
      guardianNationality: household.guardianNationality,
      grossHouseholdIncome: household.grossHouseholdIncome,
      householdMemberCount: household.householdMemberCount,
      documents,
      additionalAnswers: answers,
    })

  const validateSubmit = () => {
    const missingDocument = documents.find((document) => !document.file && !document.fileKey)
    if (missingDocument) {
      showErrorToast(t('financial_assistance.message.document_required', { name: missingDocument.documentName }))
      return false
    }
    const missingAnswer = requiredAnswers.find((answer) => !answer.answerText.trim())
    if (missingAnswer) {
      showErrorToast(t('financial_assistance.message.question_required', { name: missingAnswer.questionText }))
      return false
    }
    return true
  }

  return (
    <Flex vertical gap={24}>
      <section style={{ paddingBlock: 20, borderTop: `1px solid ${token.colorBorder}` }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('financial_assistance.apply.application_title')}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t('financial_assistance.apply.application_description')}
        </Typography.Text>
      </section>

      <Row gutter={[24, 24]} align="top">
        <Col xs={24} xl={17}>
          <Flex vertical gap={16}>
            <section
              style={{
                padding: 16,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
              }}
            >
              <Flex vertical gap={12}>
                <Flex align="center" gap={8} wrap="wrap">
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {scheme.schemeName}
                  </Typography.Title>
                  {draft ? <Tag color="gold">{t('financial_assistance.status.draft')}</Tag> : null}
                </Flex>
                <Typography.Text type="secondary">
                  {[scheme.schemeCode, scheme.durationInMonths ? t('financial_assistance.text.months', { count: scheme.durationInMonths }) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography.Text>
                <Row gutter={[16, 12]}>
                  <Col xs={24} md={8}>
                    <Flex vertical gap={2}>
                      <Typography.Text type="secondary">{t('financial_assistance.field.household_income')}</Typography.Text>
                      <Typography.Text strong>
                        {formatCurrencyBasedOnCurrentLanguage(household.grossHouseholdIncome)}
                      </Typography.Text>
                    </Flex>
                  </Col>
                  <Col xs={24} md={8}>
                    <Flex vertical gap={2}>
                      <Typography.Text type="secondary">{t('financial_assistance.field.members')}</Typography.Text>
                      <Typography.Text strong>{household.householdMemberCount}</Typography.Text>
                    </Flex>
                  </Col>
                  <Col xs={24} md={8}>
                    <Flex vertical gap={2}>
                      <Typography.Text type="secondary">{t('financial_assistance.field.guardian')}</Typography.Text>
                      <Typography.Text strong>{household.guardianNationality}</Typography.Text>
                    </Flex>
                  </Col>
                </Row>
              </Flex>
            </section>

            <section
              style={{
                padding: 16,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
              }}
            >
              <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 14 }}>
                <div>
                  <Typography.Text strong>{t('financial_assistance.section.required_documents')}</Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                    {t('financial_assistance.apply.required_documents_help')}
                  </Typography.Paragraph>
                </div>
                <Typography.Text type="secondary">
                  {t('financial_assistance.text.uploaded_count', { uploaded: uploadedCount, total: documents.length })}
                </Typography.Text>
              </Flex>
              <Flex vertical gap={10}>
                {documents.length ? (
                  documents.map((document, index) => (
                    <Flex
                      key={document.requiredDocumentId}
                      align="center"
                      justify="space-between"
                      gap={16}
                      wrap="wrap"
                      style={{
                        minHeight: 72,
                        padding: '12px 14px',
                        background: token.colorFillAlter,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: token.borderRadius,
                      }}
                    >
                      <Flex align="center" gap={12} style={{ minWidth: 0 }}>
                        <FileTextOutlined style={{ color: token.colorInfo }} />
                        <Flex vertical gap={2} style={{ minWidth: 0 }}>
                          <Typography.Text strong>{document.documentName}</Typography.Text>
                          <Typography.Text type="secondary" ellipsis>
                            {document.file?.name || document.fileName || t('financial_assistance.text.no_file_selected')}
                          </Typography.Text>
                        </Flex>
                      </Flex>
                      <Space>
                        <Upload
                          maxCount={1}
                          showUploadList={false}
                          beforeUpload={(file) => {
                            setDocuments((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, file, fileName: file.name } : item
                              )
                            )
                            return false
                          }}
                        >
                          <Button icon={<FileAddOutlined />}>
                            {document.file || document.fileKey
                              ? t('financial_assistance.action.replace_file')
                              : t('financial_assistance.action.upload_file')}
                          </Button>
                        </Upload>
                        {document.file || document.fileKey ? (
                          <Button
                            danger
                            type="text"
                            aria-label={t('financial_assistance.action.remove_document', { name: document.documentName })}
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              setDocuments((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, file: null, fileKey: '', fileName: '' }
                                    : item
                                )
                              )
                            }
                          />
                        ) : null}
                      </Space>
                    </Flex>
                  ))
                ) : (
                  <Typography.Text type="secondary">{t('financial_assistance.empty.no_documents_required')}</Typography.Text>
                )}
              </Flex>
            </section>

            {answers.length ? (
              <section
                style={{
                  padding: 16,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                }}
              >
                <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 14 }}>
                  <div>
                    <Typography.Text strong>{t('financial_assistance.section.additional_questions')}</Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                      {t('financial_assistance.apply.additional_questions_help')}
                    </Typography.Paragraph>
                  </div>
                  <Typography.Text type="secondary">
                    {t('financial_assistance.text.answered_count', { answered: answeredCount, total: answers.length })}
                  </Typography.Text>
                </Flex>
                <Flex vertical gap={16}>
                  {answers.map((answer, index) => (
                    <Flex key={answer.fasSchemeAdditionalQuestionId} vertical gap={6}>
                      <Typography.Text strong>
                        {answer.questionText}
                        {answer.isRequired ? (
                          <Typography.Text type="danger"> *</Typography.Text>
                        ) : null}
                      </Typography.Text>
                      <Input.TextArea
                        value={answer.answerText}
                        rows={3}
                        placeholder={t('financial_assistance.placeholder.enter_answer')}
                        onChange={(event) =>
                          setAnswers((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, answerText: event.target.value } : item
                            )
                          )
                        }
                      />
                    </Flex>
                  ))}
                </Flex>
              </section>
            ) : null}
          </Flex>
        </Col>

        <Col xs={24} xl={7}>
          <section
            style={{
              position: 'sticky',
              top: 16,
              padding: 16,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Flex vertical gap={12}>
              <Flex justify="space-between" gap={12}>
                <Typography.Text strong>{t('financial_assistance.apply.application_status')}</Typography.Text>
                <Typography.Text type="secondary">{completionPercent}%</Typography.Text>
              </Flex>
              <Progress percent={completionPercent} showInfo={false} />
              <Flex vertical gap={6}>
                <Typography.Text type="secondary">
                  {t('financial_assistance.text.documents_uploaded', { uploaded: uploadedCount, total: documents.length })}
                </Typography.Text>
                {requiredAnswers.length ? (
                  <Typography.Text type="secondary">
                    {t('financial_assistance.text.required_questions_completed', {
                      completed: completedRequiredAnswers,
                      total: requiredAnswers.length,
                    })}
                  </Typography.Text>
                ) : null}
              </Flex>
              <Flex vertical gap={8} style={{ marginTop: 8 }}>
                <Button block loading={loading} onClick={() => onSaveDraft(payload())}>
                  {t('financial_assistance.action.save_draft')}
                </Button>
                <Button
                  block
                  type="primary"
                  icon={<SendOutlined />}
                  loading={loading}
                  onClick={() => validateSubmit() && onSubmit(payload())}
                >
                  {t('financial_assistance.action.submit_application')}
                </Button>
              </Flex>
            </Flex>
          </section>
        </Col>
      </Row>
    </Flex>
  )
}

const SchemeOption = ({ scheme, expanded, onToggle, onApply }) => {
  const { token } = theme.useToken()
  const { t } = useTranslation()
  const requiredDocuments = scheme.requiredDocuments || []
  const additionalQuestions = scheme.additionalQuestions || []
  const tiers = scheme.tiers || []
  const conditions = scheme.conditionsSummary || []
  const isApplyDisabled = Boolean(scheme.hasBlockingApplication)
  const applyUnavailableReason =
    scheme.applyUnavailableReason ||
    t('financial_assistance.message.duplicate_application_active')

  return (
    <section
      style={{
        padding: 20,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Flex vertical gap={16}>
        <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
          <div>
            <Flex align="center" gap={8} wrap="wrap">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {scheme.schemeName}
              </Typography.Title>
              <Tag color="success">{t('financial_assistance.status.eligible')}</Tag>
              {isApplyDisabled ? <Tag color="default">{t('financial_assistance.status.already_applied')}</Tag> : null}
            </Flex>
            <Typography.Text type="secondary">
              {scheme.schemeCode} · {t('financial_assistance.text.valid_for_months', { count: scheme.durationInMonths })}
            </Typography.Text>
          </div>
          <Flex gap={8} wrap="wrap">
            <Button onClick={onToggle}>
              {expanded ? t('financial_assistance.action.hide_details') : t('financial_assistance.action.view_details')}
            </Button>
            <Button type="primary" disabled={isApplyDisabled} onClick={onApply}>
              {t('financial_assistance.action.apply')} <ArrowRightOutlined />
            </Button>
          </Flex>
        </Flex>
        {isApplyDisabled ? (
          <div
            style={{
              padding: '10px 12px',
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
            }}
          >
            <Typography.Text type="secondary">{applyUnavailableReason}</Typography.Text>
          </div>
        ) : null}
        <Typography.Paragraph style={{ margin: 0 }}>
          {scheme.description || t('financial_assistance.text.default_scheme_description')}
        </Typography.Paragraph>
        <Flex gap={20} wrap="wrap">
          <Typography.Text type="secondary">
            {t('financial_assistance.text.required_documents_count', { count: requiredDocuments.length })}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('financial_assistance.text.additional_questions_count', { count: additionalQuestions.length })}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('financial_assistance.text.assistance_tiers_count', { count: tiers.length })}
          </Typography.Text>
        </Flex>
        {expanded ? (
          <div
            style={{
              padding: 16,
              background: token.colorFillAlter,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Flex vertical gap={18}>
              <section>
                <Typography.Text strong>{t('financial_assistance.section.assistance_tiers')}</Typography.Text>
                <Flex vertical gap={8} style={{ marginTop: 10 }}>
                  {tiers.map((tier) => (
                    <Flex
                      key={tier.id}
                      justify="space-between"
                      align="center"
                      gap={16}
                      wrap="wrap"
                      style={{
                        padding: '10px 12px',
                        background: token.colorBgContainer,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: token.borderRadius,
                      }}
                    >
                      <Typography.Text strong>{tier.tierName}</Typography.Text>
                      <Typography.Text>
                        {formatFriendlyTierRanges(tier).join(' · ')} ·{' '}
                        {tier.isPerComponent
                          ? t('financial_assistance.text.per_component_subsidy', {
                              course: formatSubsidy(tier.courseFeeSubsidyValue, tier.subsidyType),
                              misc: formatSubsidy(tier.miscFeeSubsidyValue, tier.subsidyType),
                            })
                          : formatSubsidy(tier.subsidyValue, tier.subsidyType)}
                      </Typography.Text>
                    </Flex>
                  ))}
                </Flex>
              </section>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Flex vertical gap={10}>
                    <Typography.Text strong>{t('financial_assistance.section.required_documents')}</Typography.Text>
                    {requiredDocuments.length ? (
                      requiredDocuments.map((document, index) => (
                        <Flex key={document.id || `${document.documentName}-${index}`} gap={10}>
                          <FileTextOutlined style={{ color: token.colorInfo, marginTop: 3 }} />
                          <Flex vertical gap={2}>
                            <Typography.Text>{document.documentName}</Typography.Text>
                            <Typography.Text type="secondary">
                              {document.templateFileName || document.templateFileKey
                                ? t('financial_assistance.text.template_file', {
                                    name: document.templateFileName || document.templateFileKey,
                                  })
                                : t('financial_assistance.empty.no_template_required')}
                            </Typography.Text>
                          </Flex>
                        </Flex>
                      ))
                    ) : (
                      <Typography.Text type="secondary">{t('financial_assistance.empty.no_required_documents')}</Typography.Text>
                    )}
                  </Flex>
                </Col>
                <Col xs={24} lg={12}>
                  <Flex vertical gap={10}>
                    <Typography.Text strong>{t('financial_assistance.section.additional_questions')}</Typography.Text>
                    {additionalQuestions.length ? (
                      additionalQuestions.map((question, index) => (
                        <Flex
                          key={question.id || `${question.questionText}-${index}`}
                          align="flex-start"
                          justify="space-between"
                          gap={10}
                        >
                          <Typography.Text>{question.questionText}</Typography.Text>
                          <Tag>
                            {question.isRequired
                              ? t('financial_assistance.status.required')
                              : t('financial_assistance.status.optional')}
                          </Tag>
                        </Flex>
                      ))
                    ) : (
                      <Typography.Text type="secondary">{t('financial_assistance.empty.no_additional_questions')}</Typography.Text>
                    )}
                  </Flex>
                </Col>
              </Row>

              <section>
                <Typography.Text strong>{t('financial_assistance.section.why_eligible')}</Typography.Text>
                <Flex vertical gap={6} style={{ marginTop: 8 }}>
                  {conditions.length ? (
                    conditions.map((condition, index) => (
                      <Flex key={`${condition}-${index}`} align="center" gap={8}>
                        <CheckCircleFilled style={{ color: token.colorSuccess }} />
                        <Typography.Text>{condition}</Typography.Text>
                      </Flex>
                    ))
                  ) : (
                    <Typography.Text type="secondary">
                      {t('financial_assistance.text.scheme_matches_household')}
                    </Typography.Text>
                  )}
                </Flex>
              </section>
            </Flex>
          </div>
        ) : null}
      </Flex>
    </section>
  )
}

const MyFasApplyPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { t } = useTranslation()
  const { fasNationalityOptions } = useEnum()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const [household, setHousehold] = useState({
    grossHouseholdIncome: '',
    householdMemberCount: '',
    guardianNationality: NATIONALITY.SingaporeCitizen,
  })
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [expandedSchemeId, setExpandedSchemeId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [checked, setChecked] = useState(false)

  const availableParams = useMemo(
    () => ({
      grossHouseholdIncome: household.grossHouseholdIncome || undefined,
      householdMemberCount: household.householdMemberCount || undefined,
      guardianNationality: household.guardianNationality,
    }),
    [household]
  )
  const available = useFetch(
    checked ? ApiUrls.ACCOUNT_HOLDER.FAS_AVAILABLE_SCHEMES : '',
    availableParams,
    [checked, availableParams],
    checked
  )
  const availableData = available.data || { schemes: [] }
  const availableSchemes = useMemo(
    () =>
      [...(availableData.schemes || [])].sort(
        (left, right) => Number(Boolean(left.hasBlockingApplication)) - Number(Boolean(right.hasBlockingApplication))
      ),
    [availableData.schemes]
  )
  const draftDetail = useAxiosSubmit({ method: 'GET' })
  const saveDraft = useAxiosSubmit({ method: 'POST' })
  const updateDraft = useAxiosSubmit({ method: 'PUT' })
  const submitApplication = useAxiosSubmit({
    url: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    method: 'POST',
  })

  useEffect(() => {
    const draftId = location.state?.draftApplicationId
    if (!draftId) return
    draftDetail
      .submit({ overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(draftId) })
      .then((response) => {
        if (!response) return
        const detail = response.data
        setDraft(detail)
        setSelectedScheme(detail.scheme)
        setHousehold({
          grossHouseholdIncome: detail.grossHouseholdIncomeSnapshot,
          householdMemberCount: detail.householdMemberCountSnapshot,
          guardianNationality: detail.guardianNationalitySnapshot,
        })
      })
    // The submit helper is intentionally excluded because its object identity changes per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.draftApplicationId])

  const validateHousehold = () => {
    if (household.grossHouseholdIncome === '' || household.grossHouseholdIncome == null) {
      return showErrorToast(t('financial_assistance.message.gross_income_required'))
    }
    if (Number(household.grossHouseholdIncome) < 0) {
      return showErrorToast(t('financial_assistance.message.gross_income_non_negative'))
    }
    if (Number(household.householdMemberCount) <= 0) {
      return showErrorToast(t('financial_assistance.message.household_member_positive'))
    }
    setChecked(true)
  }

  const currentStep = selectedScheme ? 2 : checked ? 1 : 0
  const applicationLoading = saveDraft.loading || updateDraft.loading || submitApplication.loading
  const goToHouseholdDetails = () => {
    setSelectedScheme(null)
    setDraft(null)
    setChecked(false)
  }
  const goToSchemeSelection = () => {
    if (draft) {
      navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT))
      return
    }
    setSelectedScheme(null)
  }
  const handleStepChange = (step) => {
    if (step >= currentStep) return
    if (step === 0) {
      goToHouseholdDetails()
      return
    }
    if (step === 1) goToSchemeSelection()
  }
  const guardianNationalityLabel =
    fasNationalityOptions.find((option) => option.value === household.guardianNationality)?.label ||
    household.guardianNationality

  return (
    <Card>
      <Flex vertical gap={20}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('financial_assistance.apply.title')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t('financial_assistance.apply.description')}
          </Typography.Text>
        </div>
        <Steps
          current={currentStep}
          size="small"
          onChange={handleStepChange}
          items={[
            { title: t('financial_assistance.step.household_details') },
            { title: t('financial_assistance.step.select_scheme') },
            { title: t('financial_assistance.step.application') },
          ]}
        />
        {currentStep > 0 ? (
          <Flex
            align="center"
            gap={10}
            style={{
              width: 'fit-content',
              maxWidth: '100%',
              padding: '10px 14px',
              background: token.colorInfoBg,
              border: `1px solid ${token.colorInfoBorder}`,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <InfoCircleOutlined style={{ color: token.colorInfo }} />
            <Typography.Text>
              {t('financial_assistance.apply.step_back_hint')}
            </Typography.Text>
          </Flex>
        ) : null}

        {draftDetail.loading && !selectedScheme ? (
          <Flex vertical align="center" gap={12} style={{ padding: 48 }}>
            <Spin size="large" />
            <Typography.Text type="secondary">{t('financial_assistance.apply.loading_draft')}</Typography.Text>
          </Flex>
        ) : selectedScheme ? (
          <ApplicationSection
            key={`${selectedScheme.id}-${draft?.id || 'new'}`}
            scheme={selectedScheme}
            draft={draft}
            household={household}
            loading={applicationLoading}
            onSaveDraft={async (payload) => {
              const response = draft?.id
                ? await updateDraft.submit({
                    overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_UPDATE_DRAFT(draft.id),
                    overrideData: payload,
                  })
                : await saveDraft.submit({
                    overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_SAVE_DRAFT,
                    overrideData: payload,
                  })
              if (response) {
                showSuccessToast(t('financial_assistance.message.draft_saved'))
                navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT))
              }
            }}
            onSubmit={async (payload) => {
              const response = await submitApplication.submit({
                overrideUrl: draft?.id
                  ? ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_PUBLISH_DRAFT(draft.id)
                  : ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
                overrideData: payload,
              })
              if (response) {
                navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT))
              }
            }}
          />
        ) : (
          <>
            {!checked ? (
              <section style={{ paddingBlock: 20, borderTop: `1px solid ${token.colorBorder}` }}>
                <Flex vertical gap={16}>
                  <div>
                    <Typography.Text strong>{t('financial_assistance.step.household_details')}</Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                      {t('financial_assistance.apply.household_help')}
                    </Typography.Paragraph>
                  </div>
                  <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} md={8}>
                      <Flex vertical gap={6}>
                        <Typography.Text strong>{t('financial_assistance.field.gross_household_income')}</Typography.Text>
                        <InputNumber
                          value={household.grossHouseholdIncome}
                          min={0}
                          prefix={currencySymbol}
                          style={{ width: '100%', height: 40 }}
                          onChange={(grossHouseholdIncome) => {
                            setChecked(false)
                            setHousehold((current) => ({ ...current, grossHouseholdIncome }))
                          }}
                        />
                      </Flex>
                    </Col>
                    <Col xs={24} md={8}>
                      <Flex vertical gap={6}>
                        <Typography.Text strong>{t('financial_assistance.field.household_members')}</Typography.Text>
                        <InputNumber
                          value={household.householdMemberCount}
                          min={1}
                          precision={0}
                          style={{ width: '100%', height: 40 }}
                          onChange={(householdMemberCount) => {
                            setChecked(false)
                            setHousehold((current) => ({ ...current, householdMemberCount }))
                          }}
                        />
                      </Flex>
                    </Col>
                    <Col xs={24} md={8}>
                      <Flex vertical gap={6}>
                        <Typography.Text strong>{t('financial_assistance.field.guardian_nationality')}</Typography.Text>
                        <Select
                          value={household.guardianNationality}
                          options={fasNationalityOptions}
                          style={{ width: '100%', height: 40 }}
                          onChange={(guardianNationality) => {
                            setChecked(false)
                            setHousehold((current) => ({ ...current, guardianNationality }))
                          }}
                        />
                      </Flex>
                    </Col>
                  </Row>
                  <Flex justify="flex-end">
                    <Button type="primary" loading={available.loading} onClick={validateHousehold}>
                      {t('financial_assistance.action.check_eligibility')} <ArrowRightOutlined />
                    </Button>
                  </Flex>
                </Flex>
              </section>
            ) : (
              <section style={{ paddingBlock: 20, borderTop: `1px solid ${token.colorBorder}` }}>
                <Flex vertical gap={12}>
                  <div>
                    <Typography.Text strong>{t('financial_assistance.apply.household_summary')}</Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                      {t('financial_assistance.apply.household_summary_help')}
                    </Typography.Paragraph>
                  </div>
                  <div
                    style={{
                      padding: 16,
                      background: token.colorFillAlter,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} lg={6}>
                        <Flex vertical gap={4}>
                          <Typography.Text type="secondary">{t('financial_assistance.field.income')}</Typography.Text>
                          <Typography.Text strong>
                            {formatCurrencyBasedOnCurrentLanguage(household.grossHouseholdIncome)}
                          </Typography.Text>
                        </Flex>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Flex vertical gap={4}>
                          <Typography.Text type="secondary">{t('financial_assistance.field.members')}</Typography.Text>
                          <Typography.Text strong>{household.householdMemberCount}</Typography.Text>
                        </Flex>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Flex vertical gap={4}>
                          <Typography.Text type="secondary">{t('financial_assistance.field.guardian_nationality')}</Typography.Text>
                          <Typography.Text strong>{guardianNationalityLabel}</Typography.Text>
                        </Flex>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Flex vertical gap={4}>
                          <Typography.Text type="secondary">{t('financial_assistance.field.per_capita_income')}</Typography.Text>
                          <Typography.Text strong>
                            {available.loading
                              ? t('financial_assistance.text.checking')
                              : formatCurrencyBasedOnCurrentLanguage(
                                  availableData.calculatedPerCapitaIncome
                                )}
                          </Typography.Text>
                        </Flex>
                      </Col>
                    </Row>
                  </div>
                </Flex>
              </section>
            )}

            {available.loading ? (
              <Flex vertical align="center" gap={12} style={{ padding: 48 }}>
                <Spin size="large" />
                <Typography.Text strong>{t('financial_assistance.apply.finding_schemes')}</Typography.Text>
                <Typography.Text type="secondary">
                  {t('financial_assistance.apply.matching_household')}
                </Typography.Text>
              </Flex>
            ) : null}

            {checked && !available.loading ? (
              <section>
                <Flex
                  align="center"
                  justify="space-between"
                  gap={16}
                  wrap="wrap"
                  style={{
                    padding: 16,
                    background: token.colorSuccessBg,
                    border: `1px solid ${token.colorSuccessBorder}`,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  <Flex align="center" gap={12}>
                    <CheckCircleFilled style={{ color: token.colorSuccess }} />
                    <div>
                      <Typography.Text strong>{t('financial_assistance.apply.eligibility_checked')}</Typography.Text>
                      <Flex gap={16} wrap="wrap">
                        <Typography.Text type="secondary">
                          {t('financial_assistance.apply.eligible_schemes_available')}
                        </Typography.Text>
                      </Flex>
                    </div>
                  </Flex>
                </Flex>
              </section>
            ) : null}

            {checked && !available.loading && !availableSchemes.length ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>{t('financial_assistance.empty.no_eligible_schemes')}</Typography.Text>
                    <Typography.Text type="secondary">
                      {t('financial_assistance.empty.no_eligible_schemes_help')}
                    </Typography.Text>
                  </Space>
                }
              />
            ) : null}

            {checked && !available.loading && availableSchemes.length ? (
              <section>
                <Flex align="end" justify="space-between" gap={12} style={{ marginBottom: 12 }}>
                  <div>
                    <Typography.Text strong>{t('financial_assistance.apply.eligible_schemes')}</Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                      {t('financial_assistance.apply.compare_schemes')}
                    </Typography.Paragraph>
                  </div>
                  <Typography.Text type="secondary">
                    {t('financial_assistance.text.available_count', { count: availableSchemes.length })}
                  </Typography.Text>
                </Flex>
                <Flex vertical gap={12}>
                  {availableSchemes.map((scheme) => (
                    <SchemeOption
                      key={scheme.id}
                      scheme={scheme}
                      expanded={expandedSchemeId === scheme.id}
                      onToggle={() =>
                        setExpandedSchemeId((current) => (current === scheme.id ? null : scheme.id))
                      }
                      onApply={() => {
                        if (!scheme.hasBlockingApplication) setSelectedScheme(scheme)
                      }}
                    />
                  ))}
                </Flex>
              </section>
            ) : null}
          </>
        )}
      </Flex>
    </Card>
  )
}

export default MyFasApplyPage
