import useTranslation from '@/shared/hooks/useTranslation'
import { FilterOutlined } from '@ant-design/icons'
import { Button } from 'antd'

/**
 * @typedef {Object} CustomProps
 * @property {function} props.onFilterClick
 */

/**
 * @param {Object & CustomProps} props
 */
const FilterButton = ({ onFilterClick, loading = false, ...props }) => {
	const { t } = useTranslation()

	return (
		<Button
			onClick={onFilterClick}
			type='primary'
			icon={<FilterOutlined />}
			loading={loading}
			{...props}
		>
			{loading ? t('text.loading') : t('button.filter')}
		</Button>
	)
}

export default FilterButton
