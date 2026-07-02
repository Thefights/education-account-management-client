import useTranslation from '@/shared/hooks/useTranslation'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { isAiSupportRequestResolved } from '../utils/aiSupportRequestUtil'

const AiSupportRequestStatusBadge = ({ status }) => {
  const { t } = useTranslation()
  const resolved = isAiSupportRequestResolved(status)

  return (
    <Tag
      color={resolved ? 'success' : 'warning'}
      icon={resolved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
      style={{ marginInlineEnd: 0 }}
    >
      {resolved
        ? t('ai_support_request.status.resolved')
        : t('ai_support_request.status.pending')}
    </Tag>
  )
}

export default AiSupportRequestStatusBadge
