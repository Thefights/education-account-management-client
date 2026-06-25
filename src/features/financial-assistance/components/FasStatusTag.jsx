import { statusLabel } from '@/features/financial-assistance/utils/fasRules'

const FasStatusTag = ({ status, children }) => (
  <span className={`fas-tag fas-tag-${status}`}>{children || statusLabel(status)}</span>
)

export default FasStatusTag
