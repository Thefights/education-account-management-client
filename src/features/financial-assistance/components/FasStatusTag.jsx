import { defaultFasStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import { Tag } from 'antd'

const formatStatus = (status) =>
  String(status || '-')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (value) => value.toUpperCase())

const FasStatusTag = ({ status, children }) => (
  <Tag color={defaultFasStatusStyle(status)}>{children || formatStatus(status)}</Tag>
)

export default FasStatusTag
