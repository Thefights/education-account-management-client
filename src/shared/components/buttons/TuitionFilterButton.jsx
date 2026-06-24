import useTranslation from '@/shared/hooks/useTranslation'
import { FilterOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'

/**
 * @typedef {Object} CustomProps
 * @property {function} props.onFilterClick
 */

/**
 * @param {Object & CustomProps} props
 */
const TuitionFilterButton = ({ setFilters, onFilterClick, loading = false, ...props }) => {
  const { t } = useTranslation()

  const items = [
    {
      key: 'all',
      label:  
      <div style={{ textAlign: 'center' }}>
        {t('text.all')}
      </div>,
      onClick: () => setFilters('en'),
    },
    {
      key: 'overdue',
      label: 
      <div style={{ textAlign: 'center' }}>
        {t('text.overdue')}
      </div>,
      onClick: () => setFilters('vi'),
    },
    {
      key: 'due',
      label: 
      <div style={{ textAlign: 'center' }}>
        {t('text.due')}
      </div>,
      onClick: () => setFilters('zh'),
    },
    {
      key: 'paid',
      label: 
      <div style={{ textAlign: 'center' }}>
        {t('text.paid')}
      </div>,
      onClick: () => setFilters('zh'),
    },
  ]

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button
        onClick={onFilterClick}
        type="primary"
        icon={<FilterOutlined />}
        loading={loading}
        {...props}
      >
        {loading ? t('text.loading') : t('button.filter')}
      </Button>

    </Dropdown>


  )
}

export default TuitionFilterButton
