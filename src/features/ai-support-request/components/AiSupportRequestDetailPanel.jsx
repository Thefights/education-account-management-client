import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Flex, Space, Typography, theme } from 'antd'
import { isAiSupportRequestResolved } from '../utils/aiSupportRequestUtil'
import AiSupportRequestStatusBadge from './AiSupportRequestStatusBadge'

const AiSupportRequestDetailPanel = ({ request, showAccountHolder = false }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const resolved = isAiSupportRequestResolved(request?.status)

  if (!request) return null

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Flex justify="space-between" align="flex-start" gap={12} wrap>
        <div style={{ minWidth: 0 }}>
          <Typography.Title level={4} style={{ margin: 0, overflowWrap: 'anywhere' }}>
            {request.title}
          </Typography.Title>
          <Typography.Text type="secondary">#{request.id}</Typography.Text>
        </div>
        <AiSupportRequestStatusBadge status={request.status} />
      </Flex>

      <Flex gap={16} wrap>
        {showAccountHolder && (
          <Flex align="center" gap={6}>
            <UserOutlined style={{ color: token.colorTextSecondary }} />
            <Typography.Text>
              {t('ai_support_request.field.account_holder')}: {request.accountHolderName}
            </Typography.Text>
          </Flex>
        )}
        <Flex align="center" gap={6}>
          <CalendarOutlined style={{ color: token.colorTextSecondary }} />
          <Typography.Text type="secondary">
            {t('ai_support_request.field.created_at')}:{' '}
            {formatDatetimeStringBasedOnCurrentLanguage(request.createdAt)}
          </Typography.Text>
        </Flex>
        {resolved && request.resolvedAt && (
          <Flex align="center" gap={6}>
            <CheckCircleOutlined style={{ color: token.colorSuccess }} />
            <Typography.Text type="secondary">
              {t('ai_support_request.field.resolved_at')}:{' '}
              {formatDatetimeStringBasedOnCurrentLanguage(request.resolvedAt)}
            </Typography.Text>
          </Flex>
        )}
        {resolved && request.responsedByName && (
          <Flex align="center" gap={6}>
            <UserOutlined style={{ color: token.colorTextSecondary }} />
            <Typography.Text type="secondary">
              {t('ai_support_request.field.responded_by')}: {request.responsedByName}
            </Typography.Text>
          </Flex>
        )}
      </Flex>

      <div
        style={{
          padding: 16,
          borderRadius: token.borderRadiusLG,
          background: token.colorFillAlter,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
          <QuestionCircleOutlined style={{ color: token.colorPrimary }} />
          <Typography.Text strong>{t('ai_support_request.field.question')}</Typography.Text>
        </Flex>
        <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {request.questionMessage}
        </Typography.Paragraph>
      </div>

      {resolved && (
        <div
          style={{
            padding: 16,
            borderRadius: token.borderRadiusLG,
            background: token.colorSuccessBg,
            border: `1px solid ${token.colorSuccessBorder}`,
          }}
        >
          <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
            <CustomerServiceOutlined style={{ color: token.colorSuccess }} />
            <Typography.Text strong>
              {t('ai_support_request.field.admin_response')}
            </Typography.Text>
          </Flex>
          <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {request.adminResponse}
          </Typography.Paragraph>
        </div>
      )}
    </Space>
  )
}

export default AiSupportRequestDetailPanel
