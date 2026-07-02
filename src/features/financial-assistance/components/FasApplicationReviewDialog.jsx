import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  formatFriendlyTierRanges,
  formatMoney,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { EnumConfig } from '@/shared/config/enumConfig'
import { envConfig } from '@/shared/config/envConfig'
import useTranslation from '@/shared/hooks/useTranslation'
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

const buildRecommendationText = (tier, fallbackReason, t) => {
  if (!tier) return fallbackReason || t('financial_assistance.admin.message.no_recommendation_reason')

  const reasons = formatFriendlyTierRanges(tier).map((range) => {
    const [label, value] = range.split(': ')
    if (label === 'Per capita') {
      return t('financial_assistance.admin.text.reason_per_capita_income', {
        value: lowerFirst(value),
      })
    }
    if (label === 'Gross household') {
      return t('financial_assistance.admin.text.reason_gross_household_income', {
        value: lowerFirst(value),
      })
    }
    return lowerFirst(range)
  })

  if (!reasons.length) return fallbackReason || t('financial_assistance.admin.message.no_recommendation_reason')
  return t('financial_assistance.admin.text.suggested_because', {
    reasons: reasons.join(` ${t('financial_assistance.admin.text.or')} `),
  })
}

const SectionHeader = ({ title, count, countLabel }) => (
  <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 8 }}>
    <Typography.Text strong>{title}</Typography.Text>
    {count != null ? (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {countLabel}
      </Typography.Text>
    ) : null}
  </Flex>
)

const FasApplicationReviewDialog = ({ detail, loading, onClose, onApprove, onReject }) => {
  const { t } = useTranslation()
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
    if (!selectedTierId) return message.error(t('financial_assistance.admin.message.select_approved_tier'))
    if (isOverride && reason.trim().length < 10) {
      return message.error(t('financial_assistance.admin.message.override_reason_min'))
    }
    if (reason.trim().length > 500) {
      return message.error(t('financial_assistance.admin.message.override_reason_max'))
    }
    onApprove({ approvedTierId: selectedTierId, reason: reason.trim() || undefined })
  }

  const handleReject = () => {
    const external = externalReason.trim()
    const internal = internalReason.trim()
    if (!external || !internal) {
      return message.error(t('financial_assistance.admin.message.rejection_reasons_required'))
    }
    if (external.length > 1000 || internal.length > 1000) {
      return message.error(t('financial_assistance.admin.message.rejection_reason_max'))
    }
    onReject({ externalRejectionReason: external, internalRejectionReason: internal })
  }

  return (
    <Modal
      open
      width={960}
      title={t('financial_assistance.management.detail_title', { number: detail.applicationNumber })}
      onCancel={onClose}
      footer={
        isPending ? (
          <Space>
            <Button danger icon={<StopOutlined />} onClick={() => setRejectOpen(true)}>
              {t('financial_assistance.admin.action.reject')}
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loading}
              disabled={!canApprove}
              onClick={handleApprove}
            >
              {selectedTier
                ? t('financial_assistance.admin.action.approve_tier', { tier: selectedTier.tierName })
                : t('financial_assistance.admin.action.approve')}
            </Button>
          </Space>
        ) : (
          <Button onClick={onClose}>{t('button.close')}</Button>
        )
      }
      destroyOnHidden
    >
      <Flex vertical gap={24}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label={t('financial_assistance.admin.condition.field.student_age')}>{student.age}</Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.admin.condition.field.student_nationality')}>
            {student.studentNationality || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.field.scheme')}>{detail.scheme.schemeName}</Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.field.status')}>
            <FasStatusTag status={detail.status} />
          </Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.field.gross_household_income')}>
            {formatMoney(student.grossHouseholdIncome)}
          </Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.field.per_capita_income')}>
            {formatMoney(student.perCapitaIncome)}
          </Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.field.guardian_nationality')}>
            {student.guardianNationality || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('financial_assistance.field.household_members')}>
            {student.householdMembers}
          </Descriptions.Item>
        </Descriptions>

        <section>
          <SectionHeader
            title={
              isPending
                ? t('financial_assistance.admin.section.review_decision')
                : t('financial_assistance.admin.section.review_outcome')
            }
          />
          <Flex vertical gap={12}>
            {!recommendedTier && isPending ? (
              <Alert
                type="warning"
                showIcon
                message={t('financial_assistance.admin.message.no_eligible_tier_recommended')}
                description={t('financial_assistance.admin.message.no_eligible_tier_description')}
              />
            ) : null}
            {isPending && recommendedTier ? (
              <div style={{ ...decisionPanelStyle, background: token.colorInfoBg }}>
                <Flex align="flex-start" gap={12}>
                  <CheckCircleFilled style={{ color: token.colorInfo, marginTop: 3 }} />
                  <Flex vertical gap={4} style={{ flex: 1 }}>
                    <Flex align="center" justify="space-between" gap={8} wrap="wrap">
                      <Typography.Text strong>{recommendedTier.tierName}</Typography.Text>
                      <Tag color="blue">{t('financial_assistance.admin.status.recommended')}</Tag>
                    </Flex>
                    {formatFriendlyTierRanges(recommendedTierDetail || recommendedTier).map((range) => (
                      <Typography.Text key={range} type="secondary">
                        {range}
                      </Typography.Text>
                    ))}
                    <Typography.Text>
                      {buildRecommendationText(
                        recommendedTierDetail || recommendedTier,
                        recommendedTier.reason,
                        t
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
                      {approvedTier
                        ? t('financial_assistance.admin.text.approved_tier', {
                            tier: approvedTier.tierName,
                          })
                        : detail.status}
                    </Typography.Text>
                    {approvedTier ? (
                      <Typography.Text type="secondary">
                        {overrideHistory
                          ? t('financial_assistance.admin.text.overridden_from', {
                              tier:
                                overrideHistory.oldTierName ||
                                t('financial_assistance.admin.text.recommended_tier'),
                            })
                          : t('financial_assistance.admin.text.system_recommendation_followed')}
                      </Typography.Text>
                    ) : null}
                    {overrideHistory?.reason ? <Typography.Text>{overrideHistory.reason}</Typography.Text> : null}
                  </Flex>
                </Flex>
              </div>
            ) : null}
            {isPending && canApprove ? (
              <Flex vertical gap={6}>
                <Typography.Text strong>{t('financial_assistance.admin.field.tier_to_approve')}</Typography.Text>
                <Select
                  value={selectedTierId}
                  style={{ width: '100%', minHeight: 40 }}
                  placeholder={t('financial_assistance.admin.placeholder.select_approved_tier')}
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
                <Typography.Text strong>{t('financial_assistance.admin.field.override_reason')}</Typography.Text>
                <Input.TextArea
                  value={reason}
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder={t('financial_assistance.admin.placeholder.override_reason')}
                  onChange={(event) => setReason(event.target.value)}
                />
              </Flex>
            ) : null}
          </Flex>
        </section>

        <section>
          <SectionHeader
            title={t('financial_assistance.admin.section.supporting_documents')}
            count={detail.scheme.requiredDocuments.length}
            countLabel={t('financial_assistance.admin.text.documents_count', {
              count: detail.scheme.requiredDocuments.length,
            })}
          />
          <List
            dataSource={detail.scheme.requiredDocuments}
            locale={{ emptyText: t('financial_assistance.empty.no_documents') }}
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
                      {t('financial_assistance.action.view_document')}
                    </Button>
                  ) : (
                    <Typography.Text type="secondary">{t('financial_assistance.admin.status.not_uploaded')}</Typography.Text>
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
            title={t('financial_assistance.admin.section.applicant_responses')}
            count={(detail.additionalAnswers || []).length}
            countLabel={t('financial_assistance.admin.text.responses_count', {
              count: (detail.additionalAnswers || []).length,
            })}
          />
          <List
            dataSource={detail.additionalAnswers || []}
            locale={{ emptyText: t('financial_assistance.admin.empty.no_additional_answers') }}
            renderItem={(answer) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Typography.Text strong>{answer.questionText}</Typography.Text>
                      <Tag>
                        {answer.isRequired
                          ? t('financial_assistance.status.required')
                          : t('financial_assistance.status.optional')}
                      </Tag>
                    </Space>
                  }
                  description={answer.answerText || t('financial_assistance.admin.empty.no_answer_provided')}
                />
              </List.Item>
            )}
          />
        </section>

        {(detail.tierOverrideHistories || []).length ? (
          <>
            <SectionHeader
              title={t('financial_assistance.admin.section.tier_override_history')}
              count={detail.tierOverrideHistories.length}
              countLabel={t('financial_assistance.admin.text.changes_count', {
                count: detail.tierOverrideHistories.length,
              })}
            />
            <List
              dataSource={detail.tierOverrideHistories}
              renderItem={(history) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${history.oldTierName || t('financial_assistance.admin.empty.no_tier')} → ${history.newTierName}`}
                    description={
                      <Flex vertical gap={2}>
                        <Typography.Text type="secondary">{history.reason}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {history.modifiedByName || t('financial_assistance.admin.empty.unknown_admin')} ·{' '}
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
            <SectionHeader title={t('financial_assistance.admin.section.rejection_reasons')} />
            <Typography.Paragraph>
              {t('financial_assistance.admin.field.applicant')}: {detail.externalRejectionReason || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              {t('financial_assistance.admin.field.internal')}: {detail.internalRejectionReason || '-'}
            </Typography.Paragraph>
          </>
        ) : null}
      </Flex>

      <Modal
        open={rejectOpen}
        title={t('financial_assistance.admin.application_queue.reject_title')}
        okText={t('financial_assistance.admin.action.reject')}
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
            placeholder={t('financial_assistance.admin.placeholder.external_rejection_reason')}
            onChange={(event) => setExternalReason(event.target.value)}
          />
          <Input.TextArea
            value={internalReason}
            rows={3}
            maxLength={1000}
            showCount
            placeholder={t('financial_assistance.admin.placeholder.internal_rejection_reason')}
            onChange={(event) => setInternalReason(event.target.value)}
          />
        </Space>
      </Modal>
    </Modal>
  )
}

export default FasApplicationReviewDialog
