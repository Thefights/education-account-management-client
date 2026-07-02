import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Flex, Skeleton, Space, Typography, theme } from 'antd'
import AiSupportRequestStatusBadge from './AiSupportRequestStatusBadge'

const ActiveAiSupportRequestSection = ({ request, loading, error, onRetry, onCreate }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  return (
    <Card title={t('ai_support_request.title.active')} styles={{ body: { padding: 20 } }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : error ? (
            <Alert
              type="error"
              showIcon
              message={t('ai_support_request.error.load_active')}
              action={<Button onClick={onRetry}>{t('ai_support_request.action.retry')}</Button>}
            />
          ) : !request ? (
            <div
              style={{
                minHeight: 220,
                padding: '32px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: token.borderRadiusLG,
                border: `1px dashed ${token.colorPrimaryBorder}`,
                background: `linear-gradient(180deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
              }}
            >
              <Space orientation="vertical" align="center" size={12} style={{ maxWidth: 560 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorPrimaryBorder}`,
                    boxShadow: token.boxShadowTertiary,
                  }}
                >
                  <CustomerServiceOutlined
                    style={{ fontSize: 30, color: token.colorPrimary }}
                  />
                </div>

                <div>
                  <Typography.Title level={4} style={{ margin: '0 0 6px' }}>
                    {t('ai_support_request.empty.no_active_title')}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                    {t('ai_support_request.empty.no_active_description')}
                  </Typography.Paragraph>
                </div>

                <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                  {t('ai_support_request.action.create')}
                </Button>

                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {t('ai_support_request.empty.no_active_note')}
                </Typography.Text>
              </Space>
            </div>
          ) : (
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                <Flex align="center" gap={10} wrap>
                  <AiSupportRequestStatusBadge status={request.status} />
                  <Typography.Text strong style={{ color: token.colorWarningText }}>
                    {t('ai_support_request.text.waiting')}
                  </Typography.Text>
                </Flex>

                <div>
                  <Typography.Title
                    level={4}
                    style={{ margin: '0 0 4px', overflowWrap: 'anywhere' }}
                  >
                    {request.title}
                  </Typography.Title>
                  <Typography.Paragraph
                    type="secondary"
                    style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {request.questionMessage}
                  </Typography.Paragraph>
                </div>

                <Flex align="center" gap={6}>
                  <ClockCircleOutlined style={{ color: token.colorTextSecondary }} />
                  <Typography.Text type="secondary">
                    {t('ai_support_request.field.created_at')}:{' '}
                    {formatDatetimeStringBasedOnCurrentLanguage(request.createdAt)}
                  </Typography.Text>
                </Flex>
            </Space>
          )}
    </Card>
  )
}

export default ActiveAiSupportRequestSection
