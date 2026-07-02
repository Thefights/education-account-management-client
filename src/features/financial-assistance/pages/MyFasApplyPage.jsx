import {
  buildApplicationPayload,
  formatFriendlyTierRanges,
  formatSubsidy,
} from '@/features/financial-assistance/utils/fasFormUtil'
import FasFormAiChat from '@/features/financial-assistance/components/FasFormAiChat'
import { ApiUrls } from '@/shared/api/apiUrls'
import { getAccessToken } from '@/shared/api/authTokenStore'
import { EnumConfig } from '@/shared/config/enumConfig'
import { envConfig } from '@/shared/config/envConfig'
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
  AuditOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  FileAddOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
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

const RequiredMark = () => <Typography.Text type="danger"> *</Typography.Text>
const APPLICATION_DOCUMENT_ACCEPT = '.pdf,.docx'
const APPLICATION_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.docx'])
const APPLICATION_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const getFileExtension = (fileName = '') => {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

const isAllowedApplicationDocument = (file) => {
  const extension = getFileExtension(file?.name)
  return APPLICATION_DOCUMENT_EXTENSIONS.has(extension) || APPLICATION_DOCUMENT_MIME_TYPES.has(file?.type)
}

const buildFasAutoFillRequest = (payload) => ({
  SessionId: payload.session_id,
  FasSchemeId: payload.fas_scheme_id,
  Message: payload.message,
  Questions: (payload.questions || []).map((question) => ({
    QuestionId: question.question_id,
    QuestionText: question.question_text,
    IsRequired: question.is_required,
    Description: question.description,
    Type: question.type,
    Options: question.options || [],
  })),
  CurrentAnswers: Object.entries(payload.current_answers || {})
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([Key, Value]) => ({ Key, Value })),
})

const getAbsoluteApiUrl = (path) => {
  const baseUrl = envConfig.api.baseUrl || window.location.origin
  return new URL(path, baseUrl).toString()
}

const getCloudFileUrl = (fileKey) => {
  if (!fileKey) return null
  if (/^https?:\/\//i.test(fileKey)) return fileKey
  return `${envConfig.imageCloudUrl.replace(/\/$/, '')}/${fileKey.replace(/^\//, '')}`
}

const resetFasAutoFillSessionSilently = (sessionId, { keepalive = false } = {}) => {
  if (!sessionId) return undefined

  const formData = new FormData()
  formData.append('SessionId', sessionId)

  const accessToken = getAccessToken()
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined

  return fetch(getAbsoluteApiUrl(ApiUrls.AI_CHAT.FAS_AUTO_FILL_RESET_SESSION), {
    method: 'POST',
    body: formData,
    credentials: 'include',
    keepalive,
    headers,
  }).catch(() => {})
}

const resetFasAutoFillSessionDuringUnload = (sessionId) =>
  resetFasAutoFillSessionSilently(sessionId, { keepalive: true })

const ApplicationSection = ({
  scheme,
  draft,
  household,
  studentProfile,
  loading,
  onSaveDraft,
  onSubmit,
}) => {
  const { token } = theme.useToken()
  const { t } = useTranslation()
  const { fasNationalityOptions } = useEnum()
  const [documents, setDocuments] = useState(() =>
    getRequiredDocuments(scheme).map((document) => {
      const existing = (draft?.documents || []).find(
        (item) =>
          item.requiredDocumentId === document.id || item.fasRequiredDocumentId === document.id
      )
      return {
        requiredDocumentId: document.id,
        documentName: document.documentName,
        templateUrl: document.templateUrl || document.templateFileKey || '',
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
  const additionalAnswerMap = useMemo(
    () =>
      Object.fromEntries(
        answers.map((answer) => [
          String(answer.fasSchemeAdditionalQuestionId),
          answer.answerText || '',
        ])
      ),
    [answers]
  )
  const aiStatusQuery = useFetch(ApiUrls.AI_CHAT.STATUS)
  const fasAutoFillSubmit = useAxiosSubmit({
    url: ApiUrls.AI_CHAT.FAS_AUTO_FILL,
    method: 'POST',
  })
  const studentNationality =
    studentProfile?.nationality ??
    draft?.studentProfile?.nationality ??
    draft?.studentNationalitySnapshot
  const studentNationalityLabel =
    fasNationalityOptions.find((option) => option.value === studentNationality)?.label ||
    studentNationality ||
    '-'

  const updateAnswerByQuestionId = (questionId, answerText) => {
    setAnswers((current) =>
      current.map((answer) =>
        String(answer.fasSchemeAdditionalQuestionId) === String(questionId)
          ? { ...answer, answerText }
          : answer
      )
    )
  }

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

  const questionsSection = answers.length ? (
    <section
      style={{
        padding: 16,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 14 }}>
        <div>
          <Flex align="center" gap={8}>
            <QuestionCircleOutlined style={{ color: token.colorInfo }} />
            <Typography.Text strong>{t('financial_assistance.section.questions')}</Typography.Text>
          </Flex>
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
                <RequiredMark />
              ) : (
                <Typography.Text type="secondary">
                  {' '}
                  ({t('financial_assistance.status.optional')})
                </Typography.Text>
              )}
            </Typography.Text>
            <Input.TextArea
              value={answer.answerText}
              rows={3}
              placeholder={t('financial_assistance.placeholder.enter_answer')}
              aria-required={answer.isRequired ? 'true' : undefined}
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
  ) : null

  const requiredDocumentsSection = (
    <section
      style={{
        padding: 16,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 14 }}>
        <div>
          <Flex align="center" gap={8}>
            <FileTextOutlined style={{ color: token.colorInfo }} />
            <Typography.Text strong>{t('financial_assistance.section.required_documents')}</Typography.Text>
          </Flex>
          <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
            {t('financial_assistance.apply.required_documents_help')}
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            {t('financial_assistance.apply.document_file_type_note')}
          </Typography.Paragraph>
        </div>
        <Typography.Text type="secondary">
          {t('financial_assistance.text.uploaded_count', { uploaded: uploadedCount, total: documents.length })}
        </Typography.Text>
      </Flex>
      <Flex vertical gap={10}>
        {documents.length ? (
          documents.map((document, index) => {
            const templateUrl = getCloudFileUrl(document.templateUrl)
            return (
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
                    <Typography.Text strong>
                      {document.documentName}
                      <RequiredMark />
                    </Typography.Text>
                    <Typography.Text type="secondary" ellipsis>
                      {document.file?.name || document.fileName || t('financial_assistance.text.no_file_selected')}
                    </Typography.Text>
                  </Flex>
                </Flex>
                <Space wrap>
                  {templateUrl ? (
                    <Button type="link" href={templateUrl} target="_blank" rel="noreferrer">
                      {t('financial_assistance.action.view_template')}
                    </Button>
                  ) : null}
                  <Upload
                    accept={APPLICATION_DOCUMENT_ACCEPT}
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      if (!isAllowedApplicationDocument(file)) {
                        showErrorToast(t('financial_assistance.message.document_file_invalid'))
                        return Upload.LIST_IGNORE
                      }

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
            )
          })
        ) : (
          <Typography.Text type="secondary">{t('financial_assistance.empty.no_documents_required')}</Typography.Text>
        )}
      </Flex>
    </section>
  )

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
                background: token.colorFillAlter,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
              }}
            >
              <Flex vertical gap={14}>
                <div>
                  <Flex align="center" gap={8}>
                    <UserOutlined style={{ color: token.colorInfo }} />
                    <Typography.Text strong>{t('financial_assistance.section.student_information')}</Typography.Text>
                  </Flex>
                  <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                    {t('financial_assistance.apply.student_information_help')}
                  </Typography.Paragraph>
                </div>
                <Row gutter={[16, 12]}>
                  <Col xs={24} md={8}>
                    <Flex vertical gap={6}>
                      <Typography.Text type="secondary">{t('financial_assistance.field.student_name')}</Typography.Text>
                      <Input disabled value={studentProfile?.fullName || draft?.studentProfile?.fullName || '-'} />
                    </Flex>
                  </Col>
                  <Col xs={24} md={8}>
                    <Flex vertical gap={6}>
                      <Typography.Text type="secondary">{t('financial_assistance.field.student_age')}</Typography.Text>
                      <Input disabled value={studentProfile?.age ?? draft?.studentProfile?.age ?? draft?.studentAgeSnapshot ?? '-'} />
                    </Flex>
                  </Col>
                  <Col xs={24} md={8}>
                    <Flex vertical gap={6}>
                      <Typography.Text type="secondary">{t('financial_assistance.field.student_nationality')}</Typography.Text>
                      <Input disabled value={studentNationalityLabel} />
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
              <Flex vertical gap={12}>
                <Flex align="center" gap={8} wrap="wrap">
                  <AuditOutlined style={{ color: token.colorInfo }} />
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

            {questionsSection}

            {requiredDocumentsSection}
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
              {answers.length ? (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <FasFormAiChat
                    key={scheme.id}
                    scheme={scheme}
                    additionalAnswers={additionalAnswerMap}
                    isSending={fasAutoFillSubmit.loading}
                    onSendMessage={async (requestPayload) => {
                      const response = await fasAutoFillSubmit.submit({
                        overrideData: buildFasAutoFillRequest(requestPayload),
                      })
                      return response?.data || response
                    }}
                    onResetSession={resetFasAutoFillSessionSilently}
                    onResetSessionDuringUnload={resetFasAutoFillSessionDuringUnload}
                    onApplySuggestion={updateAnswerByQuestionId}
                    onApplyAllSuggestions={(nextAnswers) => {
                      setAnswers((current) =>
                        current.map((answer) => {
                          const answerText =
                            nextAnswers[String(answer.fasSchemeAdditionalQuestionId)]
                          return answerText === undefined ? answer : { ...answer, answerText }
                        })
                      )
                    }}
                    isAiEnabled={aiStatusQuery.data?.isEnabled ?? !aiStatusQuery.error}
                    isStatusLoading={aiStatusQuery.loading}
                  />
                </div>
              ) : null}
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
  const appliesToCurrentCourses = Boolean(scheme.appliesToCurrentCourses)
  const isApplyDisabled = Boolean(scheme.hasBlockingApplication)
  const applyUnavailableReason = scheme.hasBlockingApplication
    ? scheme.applyUnavailableReason || t('financial_assistance.message.duplicate_application_active')
    : t('financial_assistance.message.no_current_course_for_scheme')

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
              {appliesToCurrentCourses ? (
                <Tag color="processing">
                  {t('financial_assistance.status.course_applicable')}
                </Tag>
              ) : (
                <Tag color="warning">
                  {t('financial_assistance.status.no_matching_course')}
                </Tag>
              )}
              {scheme.hasBlockingApplication ? (
                <Tag color="default">{t('financial_assistance.status.already_applied')}</Tag>
              ) : null}
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
        {isApplyDisabled || !appliesToCurrentCourses ? (
          <Alert
            showIcon
            type={scheme.hasBlockingApplication ? 'info' : 'warning'}
            message={applyUnavailableReason}
          />
        ) : null}
        <Typography.Paragraph style={{ margin: 0 }}>
          {scheme.description || t('financial_assistance.text.default_scheme_description')}
        </Typography.Paragraph>
        <Flex gap={20} wrap="wrap">
          <Typography.Text type="secondary">
            {t('financial_assistance.text.required_documents_count', { count: requiredDocuments.length })}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('financial_assistance.text.questions_count', { count: additionalQuestions.length })}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('financial_assistance.text.assistance_tiers_count', { count: tiers.length })}
          </Typography.Text>
          <Typography.Text type={appliesToCurrentCourses ? 'secondary' : 'warning'}>
            {appliesToCurrentCourses
              ? t('financial_assistance.text.applies_to_courses_count', {
                  count: scheme.matchedCurrentCourseCount || 0,
                })
              : t('financial_assistance.text.no_current_course_match')}
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
                    <Typography.Text strong>{t('financial_assistance.section.questions')}</Typography.Text>
                    {additionalQuestions.length ? (
                      additionalQuestions.map((question, index) => (
                        <Flex
                          key={question.id || `${question.questionText}-${index}`}
                          align="flex-start"
                          justify="space-between"
                          gap={10}
                        >
                          <Typography.Text>{question.questionText}</Typography.Text>
                          {question.isRequired ? (
                            <Tag>{t('financial_assistance.status.required')}</Tag>
                          ) : (
                            <Typography.Text type="secondary">
                              ({t('financial_assistance.status.optional')})
                            </Typography.Text>
                          )}
                        </Flex>
                      ))
                    ) : (
                      <Typography.Text type="secondary">{t('financial_assistance.empty.no_additional_questions')}</Typography.Text>
                    )}
                  </Flex>
                </Col>
              </Row>

              <section>
                <Typography.Text strong>{t('financial_assistance.section.current_courses')}</Typography.Text>
                <Flex gap={8} wrap="wrap" style={{ marginTop: 8 }}>
                  {(scheme.matchedCurrentCourses || []).length ? (
                    scheme.matchedCurrentCourses.map((course) => (
                      <Tag key={course.id}>
                        {course.courseCode} · {course.courseName}
                      </Tag>
                    ))
                  ) : (
                    <Typography.Text type="secondary">
                      {t('financial_assistance.empty.no_matching_current_courses')}
                    </Typography.Text>
                  )}
                </Flex>
              </section>

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
        (left, right) =>
          Number(Boolean(left.hasBlockingApplication)) -
            Number(Boolean(right.hasBlockingApplication)) ||
          Number(Boolean(right.appliesToCurrentCourses)) -
            Number(Boolean(left.appliesToCurrentCourses))
      ),
    [availableData.schemes]
  )
  const applicableSchemeCount = availableSchemes.filter((scheme) => scheme.appliesToCurrentCourses)
    .length
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
          <Flex align="center" gap={10} wrap="wrap">
            <FileDoneOutlined style={{ color: token.colorInfo, fontSize: 24 }} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              {t('financial_assistance.apply.title')}
            </Typography.Title>
          </Flex>
          <Typography.Text type="secondary">
            {t('financial_assistance.apply.description')}
          </Typography.Text>
        </div>
        <Steps
          current={currentStep}
          size="small"
          onChange={handleStepChange}
          items={[
            {
              title: t('financial_assistance.step.household_details'),
              icon: <HomeOutlined />,
            },
            {
              title: t('financial_assistance.step.select_scheme'),
              icon: <FileSearchOutlined />,
            },
            {
              title: t('financial_assistance.step.application'),
              icon: <FileDoneOutlined />,
            },
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
            studentProfile={draft?.studentProfile || availableData.studentProfile}
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
                    <Flex align="center" gap={8}>
                      <HomeOutlined style={{ color: token.colorInfo }} />
                      <Typography.Text strong>{t('financial_assistance.step.household_details')}</Typography.Text>
                    </Flex>
                    <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                      {t('financial_assistance.apply.household_help')}
                    </Typography.Paragraph>
                  </div>
                  <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} md={8}>
                      <Flex vertical gap={6}>
                        <Typography.Text strong>
                          {t('financial_assistance.field.gross_household_income')}
                          <RequiredMark />
                        </Typography.Text>
                        <InputNumber
                          value={household.grossHouseholdIncome}
                          min={0}
                          prefix={currencySymbol}
                          placeholder={t('financial_assistance.placeholder.gross_household_income')}
                          aria-required="true"
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
                        <Typography.Text strong>
                          {t('financial_assistance.field.household_members')}
                          <RequiredMark />
                        </Typography.Text>
                        <InputNumber
                          value={household.householdMemberCount}
                          min={1}
                          precision={0}
                          placeholder={t('financial_assistance.placeholder.household_members')}
                          aria-required="true"
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
                        <Typography.Text strong>
                          {t('financial_assistance.field.guardian_nationality')}
                          <RequiredMark />
                        </Typography.Text>
                        <Select
                          value={household.guardianNationality}
                          options={fasNationalityOptions}
                          placeholder={t('financial_assistance.placeholder.guardian_nationality')}
                          aria-required="true"
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
                    <Flex align="center" gap={8}>
                      <FileSearchOutlined style={{ color: token.colorInfo }} />
                      <Typography.Text strong>{t('financial_assistance.apply.eligible_schemes')}</Typography.Text>
                    </Flex>
                    <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                      {t('financial_assistance.apply.compare_schemes')}
                    </Typography.Paragraph>
                  </div>
                  <Typography.Text type="secondary">
                    {t('financial_assistance.text.available_count', { count: availableSchemes.length })}
                  </Typography.Text>
                </Flex>
                {applicableSchemeCount === 0 ? (
                  <Alert
                    showIcon
                    type="warning"
                    style={{ marginBottom: 12 }}
                    message={t('financial_assistance.message.no_applicable_scheme_for_current_courses')}
                    description={t(
                      'financial_assistance.message.no_applicable_scheme_for_current_courses_help'
                    )}
                  />
                ) : null}
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
                        if (!scheme.hasBlockingApplication) {
                          setSelectedScheme(scheme)
                        }
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
