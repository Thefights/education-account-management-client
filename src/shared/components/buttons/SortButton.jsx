import useTranslation from '@/shared/hooks/useTranslation'
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
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
      icon={ascend ? <SortAscendingOutlined /> : <SortDescendingOutlined /> }
      loading={loading}
      {...props}
    >
      {loading ? t('text.loading') : t('button.sort')}
    </Button>
  )
}

export default SortButton
