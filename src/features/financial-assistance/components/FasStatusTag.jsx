import { defaultFasStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import { Tag } from 'antd'

const formatStatus = (status) =>
  String(status || '-')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (value) => value.toUpperCase())

const FasStatusTag = ({ status, children }) => {
  const { t } = useTranslation()
  const statusKey = String(status || '').replace(/^./, (value) => value.toLowerCase())
  const label = statusKey ? t(`financial_assistance.enum.status.${statusKey}`) : formatStatus(status)

  return <Tag color={defaultFasStatusStyle(status)}>{children || label}</Tag>
}

export default FasStatusTag
