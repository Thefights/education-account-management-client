import useTranslation from '@/shared/hooks/useTranslation'
import {
  SwapOutlined
} from '@ant-design/icons';
import { Button } from 'antd'

/**
 * @typedef {Object} CustomProps
 * @property {function} props.onSortClick
 */

/**
 * @param {Object & CustomProps} props
 */
const SortButton = ({ onSortClick, loading = false, ascend =  false, ...props }) => {
  const { t } = useTranslation()

  return (
    <Button
      onClick={onSortClick}
      type="primary"
      icon={ascend ? <SwapOutlined rotate={90} style={{ transform: 'scaleX(-1)' }} /> : <SwapOutlined rotate={90} /> }
      loading={loading}
      {...props}
    >
      {loading ? t('text.loading') : t('button.sort')}
    </Button>
  )
}

export default SortButton
