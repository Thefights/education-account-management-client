import useTranslation from '@/shared/hooks/useTranslation'
import { ReloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'

/**
 * @typedef {Object} CustomProps
 * @property {function} props.onResetFilterClick
 */

/**
 * @param {Object & CustomProps} props
 */
const ResetFilterButton = ({ onResetFilterClick, loading = false, ...props }) => {
	const { t } = useTranslation()

	return (
		<Button
			onClick={onResetFilterClick}
			variant='outlined'
			icon={<ReloadOutlined />}
			loading={loading}
			{...props}
		>
			{loading ? t('text.loading') : t('button.reset_filter')}
		</Button>
	)
}

export default ResetFilterButton
