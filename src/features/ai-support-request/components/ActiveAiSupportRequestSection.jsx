import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Alert, Card, Descriptions, Tag, Typography } from 'antd'
import { forwardRef } from 'react'

const ActiveAiSupportRequestSection = forwardRef(({ request }, ref) => {
  const { t } = useTranslation()

  if (!request) return null

  return (
    <Card ref={ref} title={t('ai_support_request.title.active')}>
      <Alert
        type="info"
        showIcon
        message={t('ai_support_request.text.waiting')}
        description={t('ai_support_request.text.waiting_description')}
        style={{ marginBottom: 16 }}
      />
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={t('ai_support_request.field.status')}>
          <Tag color="warning">{t('ai_support_request.status.pending')}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('ai_support_request.field.title')}>
          {request.title}
        </Descriptions.Item>
        <Descriptions.Item label={t('ai_support_request.field.question')}>
          <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
            {request.questionMessage}
          </Typography.Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label={t('ai_support_request.field.created_at')}>
          {formatDatetimeStringBasedOnCurrentLanguage(request.createdAt)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
})

ActiveAiSupportRequestSection.displayName = 'ActiveAiSupportRequestSection'

export default ActiveAiSupportRequestSection
