import {
  buildApplicationPayload,
  formatTierRange,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import { FileAddOutlined, SendOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

const NATIONALITY = EnumConfig.NationalityCategory

const getRequiredDocuments = (scheme) => scheme.requiredDocuments || []
const getSchemeDescription = (scheme) =>
  scheme.description || 'Financial assistance for eligible students.'

const getSupportText = (scheme) => {
  const courses = scheme.schemeCourses || scheme.courses || []
  if (!courses.length) return 'Financial assistance for eligible students.'
  return courses
    .map((course) => course.courseName || course.name || course.courseCode)
    .filter(Boolean)
    .join(', ')
}

const formatHouseholdIncome = (value) => (value === '' || value == null ? '-' : `S$${value}`)
const formatHouseholdMemberCount = (value) => (value === '' || value == null ? '-' : value)

const blockStyle = {
  border: '1px solid #f0f0f0',
  borderRadius: 8,
  padding: 24,
  background: '#fff',
}

const SchemeDetailsDialog = ({ scheme, onClose }) => (
  <Modal
    open
    width={720}
    title="Eligibility Details"
    footer={<Button onClick={onClose}>Close</Button>}
    onCancel={onClose}
    destroyOnHidden
  >
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Paragraph>
        This scheme is available because your household information matches its eligibility criteria.
      </Typography.Paragraph>
      {!!(scheme.conditionsSummary || []).length && (
        <div>
          <Typography.Text strong>Matched rules</Typography.Text>
          <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 8 }}>
            {scheme.conditionsSummary.map((condition, index) => (
              <Typography.Text key={`${condition}-${index}`}>{condition}</Typography.Text>
            ))}
          </Space>
        </div>
      )}
      {!!(scheme.tiers || []).length && (
        <div>
          <Typography.Text strong>Tier details</Typography.Text>
          <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 8 }}>
            {scheme.tiers.map((tier) => (
              <Typography.Text key={tier.id}>
                {tier.tierName}: {formatTierRange(tier)}
              </Typography.Text>
            ))}
          </Space>
        </div>
      )}
    </Space>
  </Modal>
)

const ApplicationDialog = ({
  scheme,
  draft,
  household,
  loading,
  onClose,
  onSaveDraft,
  onSubmit,
}) => {
  const [documents, setDocuments] = useState(() =>
    getRequiredDocuments(scheme).map((document) => {
      const existing = (draft?.documents || []).find(
        (item) => item.requiredDocumentId === document.id || item.fasRequiredDocumentId === document.id
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
      message.error(`${missingDocument.documentName} is required.`)
      return false
    }
    const missingAnswer = answers.find((answer) => answer.isRequired && !answer.answerText.trim())
    if (missingAnswer) {
      message.error(`${missingAnswer.questionText} is required.`)
      return false
    }
    return true
  }

  return (
    <Modal
      open
      width={800}
      title={`Apply for ${scheme.schemeName}`}
      onCancel={onClose}
      footer={
        <Space>
          <Button loading={loading} onClick={() => onSaveDraft(payload())}>
            Save draft
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={loading}
            onClick={() => validateSubmit() && onSubmit(payload())}
          >
            Submit application
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Typography.Paragraph>{scheme.description}</Typography.Paragraph>
      <Divider orientation="left">Required documents</Divider>
      <Space direction="vertical" style={{ width: '100%' }}>
        {documents.map((document, index) => (
          <Flex key={document.requiredDocumentId} gap={12} align="center" wrap="wrap">
            <Typography.Text style={{ width: 260 }}>{document.documentName}</Typography.Text>
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
              <Button icon={<FileAddOutlined />}>Choose file</Button>
            </Upload>
            <Typography.Text type="secondary">
              {document.file?.name || document.fileName || 'No file selected'}
            </Typography.Text>
          </Flex>
        ))}
      </Space>
      {!!answers.length && (
        <>
          <Divider orientation="left">Additional questions</Divider>
          <Space direction="vertical" style={{ width: '100%' }}>
            {answers.map((answer, index) => (
              <div key={answer.fasSchemeAdditionalQuestionId}>
                <Typography.Text>
                  {answer.questionText}
                  {answer.isRequired ? ' *' : ''}
                </Typography.Text>
                <Input.TextArea
                  value={answer.answerText}
                  rows={2}
                  onChange={(event) =>
                    setAnswers((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, answerText: event.target.value } : item
                      )
                    )
                  }
                />
              </div>
            ))}
          </Space>
        </>
      )}
    </Modal>
  )
}

const MyFasApplyPage = () => {
  const location = useLocation()
  const { fasNationalityOptions } = useEnum()
  const [household, setHousehold] = useState({
    grossHouseholdIncome: '',
    householdMemberCount: '',
    guardianNationality: NATIONALITY.SingaporeCitizen,
  })
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [detailScheme, setDetailScheme] = useState(null)
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
  const availableSchemes = availableData.schemes || []
  const draftDetail = useAxiosSubmit({ method: 'GET' })
  const saveDraft = useAxiosSubmit({ method: 'POST' })
  const updateDraft = useAxiosSubmit({ method: 'PUT' })
  const submitApplication = useAxiosSubmit({ url: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS, method: 'POST' })

  useEffect(() => {
    const draftId = location.state?.draftApplicationId
    if (!draftId) return
    draftDetail
      .submit({ overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(draftId) })
      .then((response) => {
        if (!response) return
        const detail = response.data
        setDraft(detail)
        setSelectedScheme({
          ...detail.scheme,
          requiredDocuments: detail.scheme.requiredDocuments,
          additionalQuestions: detail.scheme.additionalQuestions,
        })
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
    if (Number(household.grossHouseholdIncome) < 0) return message.error('Gross household income cannot be negative.')
    if (Number(household.householdMemberCount) <= 0) return message.error('Household member count must be greater than 0.')
    setChecked(true)
  }

  const closeDialog = () => {
    setSelectedScheme(null)
    setDraft(null)
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>Apply for Financial Assistance</Typography.Title>
        <Alert
          showIcon
          type="info"
          message="We use your household information to find FAS schemes you may apply for."
        />
        <section style={blockStyle}>
          <Flex vertical gap={16}>
            <div>
              <Typography.Title level={5} style={{ margin: 0 }}>Household Information</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                Enter your household details to check which FAS schemes you may apply for.
              </Typography.Paragraph>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Typography.Text>Gross household income</Typography.Text>
                <InputNumber
                  value={household.grossHouseholdIncome}
                  min={0}
                  prefix="S$"
                  style={{ width: '100%' }}
                  onChange={(grossHouseholdIncome) =>
                    setHousehold((current) => ({ ...current, grossHouseholdIncome }))
                  }
                />
              </Col>
              <Col xs={24} md={8}>
                <Typography.Text>Household members</Typography.Text>
                <InputNumber
                  value={household.householdMemberCount}
                  min={1}
                  style={{ width: '100%' }}
                  onChange={(householdMemberCount) =>
                    setHousehold((current) => ({ ...current, householdMemberCount }))
                  }
                />
              </Col>
              <Col xs={24} md={8}>
                <Typography.Text>Guardian nationality</Typography.Text>
                <Select
                  value={household.guardianNationality}
                  options={fasNationalityOptions}
                  style={{ width: '100%' }}
                  onChange={(guardianNationality) =>
                    setHousehold((current) => ({ ...current, guardianNationality }))
                  }
                />
              </Col>
            </Row>
            <Flex justify="flex-end">
              <Button
                type="primary"
                loading={available.loading}
                onClick={validateHousehold}
                style={{ width: 240, maxWidth: '100%' }}
              >
                Find Eligible Schemes
              </Button>
            </Flex>
          </Flex>
        </section>
        {available.loading && (
          <section style={blockStyle}>
            <Flex vertical align="center" gap={16}>
              <Spin size="large" />
              <div style={{ textAlign: 'center' }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Finding eligible schemes...
                </Typography.Title>
                <Space direction="vertical" size={4} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary">Checking household information</Typography.Text>
                  <Typography.Text type="secondary">Matching available FAS schemes</Typography.Text>
                  <Typography.Text type="secondary">Preparing application options</Typography.Text>
                </Space>
              </div>
            </Flex>
          </section>
        )}
        {checked && !available.loading && (
          <section style={blockStyle}>
            <Flex vertical gap={12}>
              <div>
                <Typography.Title level={5} style={{ margin: 0 }}>Eligibility Check Result</Typography.Title>
                <Typography.Paragraph style={{ margin: '4px 0 0' }}>
                  Based on your household details, you may apply for {availableSchemes.length} FAS schemes.
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  Matched eligibility rules are used internally for assessment.
                </Typography.Text>
              </div>
              <Descriptions column={{ xs: 1, sm: 1, md: 3 }} size="small">
                <Descriptions.Item label="Gross household income">
                  {formatHouseholdIncome(household.grossHouseholdIncome)}
                </Descriptions.Item>
                <Descriptions.Item label="Household members">
                  {formatHouseholdMemberCount(household.householdMemberCount)}
                </Descriptions.Item>
                <Descriptions.Item label="Guardian nationality">
                  {household.guardianNationality}
                </Descriptions.Item>
              </Descriptions>
            </Flex>
          </section>
        )}
        {checked && !available.loading && !availableSchemes.length && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Typography.Text strong>No FAS schemes available</Typography.Text>
                <Typography.Text type="secondary">
                  Based on your household information, there are currently no FAS schemes available for application.
                </Typography.Text>
              </Space>
            }
          >
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Review Household Information
            </Button>
          </Empty>
        )}
        {checked && !available.loading && !!availableSchemes.length && (
          <Typography.Title level={5} style={{ margin: 0 }}>
            Schemes You May Apply For ({availableSchemes.length})
          </Typography.Title>
        )}
        <Row gutter={[16, 16]}>
          {availableSchemes.map((scheme) => (
            <Col xs={24} lg={availableSchemes.length >= 3 ? 12 : 24} key={scheme.id}>
              <Card>
                <Flex vertical gap={16} style={{ height: '100%' }}>
                  <Space direction="vertical" size={4}>
                    <Tag color="success" style={{ width: 'fit-content' }}>Eligible</Tag>
                    <Typography.Title level={5} style={{ margin: 0 }}>{scheme.schemeName}</Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                      {getSchemeDescription(scheme)}
                    </Typography.Paragraph>
                  </Space>
                  <div>
                    <Typography.Text strong>Supports</Typography.Text>
                    <Typography.Paragraph style={{ margin: '4px 0 0' }}>
                      {getSupportText(scheme)}
                    </Typography.Paragraph>
                  </div>
                  <div>
                    <Typography.Text strong>Required Documents</Typography.Text>
                    <Typography.Paragraph style={{ margin: '4px 0 0' }}>
                      {getRequiredDocuments(scheme).length
                        ? getRequiredDocuments(scheme).map((document) => document.documentName).join(', ')
                        : 'No additional documents configured.'}
                    </Typography.Paragraph>
                  </div>
                  <Flex justify="flex-end" gap={8} wrap="wrap" style={{ marginTop: 'auto' }}>
                    <Button onClick={() => setDetailScheme(scheme)}>View Details</Button>
                    <Button type="primary" onClick={() => setSelectedScheme(scheme)}>Apply</Button>
                  </Flex>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>
      {detailScheme && (
        <SchemeDetailsDialog
          scheme={detailScheme}
          onClose={() => setDetailScheme(null)}
        />
      )}
      {selectedScheme && (
        <ApplicationDialog
          scheme={selectedScheme}
          draft={draft}
          household={household}
          loading={saveDraft.loading || updateDraft.loading || submitApplication.loading}
          onClose={closeDialog}
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
              message.success('Draft saved.')
              closeDialog()
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
              message.success('FAS application submitted.')
              closeDialog()
            }
          }}
        />
      )}
    </Card>
  )
}

export default MyFasApplyPage
