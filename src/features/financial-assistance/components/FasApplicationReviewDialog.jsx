import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  formatFriendlyTierRanges,
  formatMoney,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { EnumConfig } from '@/shared/config/enumConfig'
import { envConfig } from '@/shared/config/envConfig'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  CheckCircleFilled,
  CheckOutlined,
  EyeOutlined,
  FileTextOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Descriptions,
  Flex,
  Input,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from 'antd'
import { useState } from 'react'

const FAS_APPLICATION_STATUS = EnumConfig.FasApplicationStatus

const getFileUrl = (fileKey) => {
  if (!fileKey) return null
  if (/^https?:\/\//i.test(fileKey)) return fileKey
  return `${envConfig.imageCloudUrl.replace(/\/$/, '')}/${fileKey.replace(/^\//, '')}`
}

const TierOptionLabel = ({ tier }) => (
  <Flex vertical gap={2}>
    <Typography.Text>{tier.tierName}</Typography.Text>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {formatFriendlyTierRanges(tier).join(' · ')}
    </Typography.Text>
  </Flex>
)

const lowerFirst = (value) => (value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : '')

const buildRecommendationText = (tier, fallbackReason) => {
  if (!tier) return fallbackReason || 'No recommendation reason provided.'

  const reasons = formatFriendlyTierRanges(tier).map((range) => {
    const [label, value] = range.split(': ')
    if (label === 'Per capita') return `the student's per-capita income is ${lowerFirst(value)}`
    if (label === 'Gross household') return `the household income is ${lowerFirst(value)}`
    return lowerFirst(range)
  })

  if (!reasons.length) return fallbackReason || 'No recommendation reason provided.'
  return `Suggested because ${reasons.join(' or ')}.`
}

const SectionHeader = ({ title, count, countLabel }) => (
  <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 8 }}>
    <Typography.Text strong>{title}</Typography.Text>
    {count != null ? (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {count} {count === 1 ? countLabel : `${countLabel}s`}
      </Typography.Text>
    ) : null}
  </Flex>
)

const FasApplicationReviewDialog = ({ detail, loading, onClose, onApprove, onReject }) => {
  const tiers = detail.scheme.tiers
  const recommendedTier = detail.systemSuggestedTier
  const approvedTier = detail.approvedTier
  const student = detail.studentProfile
  const { token } = theme.useToken()
  const [selectedTierId, setSelectedTierId] = useState(
    approvedTier?.id || recommendedTier?.id || undefined
  )
  const [reason, setReason] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [externalReason, setExternalReason] = useState('')
  const [internalReason, setInternalReason] = useState('')
  const isPending = detail.status === FAS_APPLICATION_STATUS.Pending
  const canApprove = isPending && Boolean(recommendedTier?.id)
  const isOverride = canApprove && selectedTierId !== recommendedTier.id
  const selectedTier = tiers.find((tier) => tier.id === selectedTierId)
  const overrideHistory = detail.tierOverrideHistories?.at(-1)
  const recommendedTierDetail = tiers.find((tier) => tier.id === recommendedTier?.id)

  const decisionPanelStyle = {
    padding: 16,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadiusLG,
    background: token.colorFillAlter,
  }

  const handleApprove = () => {
    if (!selectedTierId) return message.error('Select an approved tier.')
    if (isOverride && reason.trim().length < 10) {
      return message.error('Override reason must be at least 10 characters.')
    }
    if (reason.trim().length > 500) {
      return message.error('Override reason must be 500 characters or fewer.')
    }
    onApprove({ approvedTierId: selectedTierId, reason: reason.trim() || undefined })
  }

  const handleReject = () => {
    const external = externalReason.trim()
    const internal = internalReason.trim()
    if (!external || !internal) return message.error('Both rejection reasons are required.')
    if (external.length > 1000 || internal.length > 1000) {
      return message.error('Each rejection reason must be 1,000 characters or fewer.')
    }
    onReject({ externalRejectionReason: external, internalRejectionReason: internal })
  }

  return (
    <Modal
      open
      width={960}
      title={`FAS Application ${detail.applicationNumber}`}
      onCancel={onClose}
      footer={
        isPending ? (
          <Space>
            <Button danger icon={<StopOutlined />} onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loading}
              disabled={!canApprove}
              onClick={handleApprove}
            >
              {selectedTier ? `Approve ${selectedTier.tierName}` : 'Approve'}
            </Button>
          </Space>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )
      }
      destroyOnHidden
    >
      <Flex vertical gap={24}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Student age">{student.age}</Descriptions.Item>
          <Descriptions.Item label="Student nationality">
            {student.studentNationality || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Scheme">{detail.scheme.schemeName}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <FasStatusTag status={detail.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Gross household income">
            {formatMoney(student.grossHouseholdIncome)}
          </Descriptions.Item>
          <Descriptions.Item label="Per-capita income">
            {formatMoney(student.perCapitaIncome)}
          </Descriptions.Item>
          <Descriptions.Item label="Guardian nationality">
            {student.guardianNationality || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Household members">
            {student.householdMembers}
          </Descriptions.Item>
        </Descriptions>

        <section>
          <SectionHeader title={isPending ? 'Review decision' : 'Review outcome'} />
          <Flex vertical gap={12}>
            {!recommendedTier && isPending ? (
              <Alert
                type="warning"
                showIcon
                message="No eligible tier was recommended"
                description="This application cannot be approved until it has an eligible system-recommended tier."
              />
            ) : null}
            {isPending && recommendedTier ? (
              <div style={{ ...decisionPanelStyle, background: token.colorInfoBg }}>
                <Flex align="flex-start" gap={12}>
                  <CheckCircleFilled style={{ color: token.colorInfo, marginTop: 3 }} />
                  <Flex vertical gap={4} style={{ flex: 1 }}>
                    <Flex align="center" justify="space-between" gap={8} wrap="wrap">
                      <Typography.Text strong>{recommendedTier.tierName}</Typography.Text>
                      <Tag color="blue">Recommended</Tag>
                    </Flex>
                    {formatFriendlyTierRanges(recommendedTierDetail || recommendedTier).map((range) => (
                      <Typography.Text key={range} type="secondary">
                        {range}
                      </Typography.Text>
                    ))}
                    <Typography.Text>
                      {buildRecommendationText(
                        recommendedTierDetail || recommendedTier,
                        recommendedTier.reason
                      )}
                    </Typography.Text>
                  </Flex>
                </Flex>
              </div>
            ) : null}
            {!isPending ? (
              <div style={decisionPanelStyle}>
                <Flex align="flex-start" gap={12}>
                  {approvedTier ? (
                    <CheckCircleFilled style={{ color: token.colorSuccess, marginTop: 3 }} />
                  ) : (
                    <FasStatusTag status={detail.status} />
                  )}
                  <Flex vertical gap={4}>
                    <Typography.Text strong>
                      {approvedTier ? `Approved tier: ${approvedTier.tierName}` : detail.status}
                    </Typography.Text>
                    {approvedTier ? (
                      <Typography.Text type="secondary">
                        {overrideHistory
                          ? `Overridden from ${overrideHistory.oldTierName || 'the recommended tier'}`
                          : 'System recommendation was followed'}
                      </Typography.Text>
                    ) : null}
                    {overrideHistory?.reason ? <Typography.Text>{overrideHistory.reason}</Typography.Text> : null}
                  </Flex>
                </Flex>
              </div>
            ) : null}
            {isPending && canApprove ? (
              <Flex vertical gap={6}>
                <Typography.Text strong>Tier to approve</Typography.Text>
                <Select
                  value={selectedTierId}
                  style={{ width: '100%', minHeight: 40 }}
                  placeholder="Select approved tier"
                  options={tiers.map((tier) => ({
                    value: tier.id,
                    label: <TierOptionLabel tier={tier} />,
                  }))}
                  onChange={setSelectedTierId}
                />
              </Flex>
            ) : null}
            {isPending && isOverride ? (
              <Flex vertical gap={6}>
                <Typography.Text strong>Override reason</Typography.Text>
                <Input.TextArea
                  value={reason}
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder="Explain why another tier is more appropriate"
                  onChange={(event) => setReason(event.target.value)}
                />
              </Flex>
            ) : null}
          </Flex>
        </section>

        <section>
          <SectionHeader
            title="Supporting documents"
            count={detail.scheme.requiredDocuments.length}
            countLabel="document"
          />
          <List
            dataSource={detail.scheme.requiredDocuments}
            locale={{ emptyText: 'No documents.' }}
            renderItem={(document) => (
              <List.Item
                extra={
                  document.fileKey ? (
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      href={getFileUrl(document.fileKey)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View document
                    </Button>
                  ) : (
                    <Typography.Text type="secondary">Not uploaded</Typography.Text>
                  )
                }
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined />}
                  title={document.documentName}
                  description={document.fileName || undefined}
                />
              </List.Item>
            )}
          />
        </section>

        <section>
          <SectionHeader
            title="Applicant responses"
            count={(detail.additionalAnswers || []).length}
            countLabel="response"
          />
          <List
            dataSource={detail.additionalAnswers || []}
            locale={{ emptyText: 'No additional answers.' }}
            renderItem={(answer) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Typography.Text strong>{answer.questionText}</Typography.Text>
                      <Tag>{answer.isRequired ? 'Required' : 'Optional'}</Tag>
                    </Space>
                  }
                  description={answer.answerText || 'No answer provided'}
                />
              </List.Item>
            )}
          />
        </section>

        {(detail.tierOverrideHistories || []).length ? (
          <>
            <SectionHeader
              title="Tier override history"
              count={detail.tierOverrideHistories.length}
              countLabel="change"
            />
            <List
              dataSource={detail.tierOverrideHistories}
              renderItem={(history) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${history.oldTierName || 'No tier'} → ${history.newTierName}`}
                    description={
                      <Flex vertical gap={2}>
                        <Typography.Text type="secondary">{history.reason}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {history.modifiedByName || 'Unknown admin'} ·{' '}
                          {formatDatetimeStringBasedOnCurrentLanguage(history.modifiedAt)}
                        </Typography.Text>
                      </Flex>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : null}

        {detail.externalRejectionReason || detail.internalRejectionReason ? (
          <>
            <SectionHeader title="Rejection reasons" />
            <Typography.Paragraph>
              Applicant: {detail.externalRejectionReason || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              Internal: {detail.internalRejectionReason || '-'}
            </Typography.Paragraph>
          </>
        ) : null}
      </Flex>

      <Modal
        open={rejectOpen}
        title="Reject FAS application"
        okText="Reject"
        okButtonProps={{ danger: true, loading }}
        onCancel={() => setRejectOpen(false)}
        onOk={handleReject}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.TextArea
            value={externalReason}
            rows={3}
            maxLength={1000}
            showCount
            placeholder="Reason shown to the applicant"
            onChange={(event) => setExternalReason(event.target.value)}
          />
          <Input.TextArea
            value={internalReason}
            rows={3}
            maxLength={1000}
            showCount
            placeholder="Internal review reason"
            onChange={(event) => setInternalReason(event.target.value)}
          />
        </Space>
      </Modal>
    </Modal>
  )
}

export default FasApplicationReviewDialog
