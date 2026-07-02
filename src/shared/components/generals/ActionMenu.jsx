import useTranslation from '@/shared/hooks/useTranslation'
import { MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Tooltip } from 'antd'

/**
 * @param {Object} props
 * @param {Array<{title?: string, icon?: ReactNode, disabled?: boolean, hidden?: boolean, onClick?: () => void | Promise<void>}>} props.actions
 * @param {string} props.menuTooltip
 */
const ActionMenu = ({ actions = [], menuTooltip }) => {
	const { t } = useTranslation()

	const makeRun = (a) => async () => {
		await a.onClick?.()
	}

	const visibleActions = actions.filter((action) => !action.hidden)

	if (visibleActions.length === 0) return null

	const items = visibleActions.map((a, idx) => ({
		key: idx,
		label: a.title,
		icon: a.icon,
		disabled: a.disabled,
		onClick: makeRun(a),
	}))

	return (
		<Tooltip title={menuTooltip || t('tooltip.menu')}>
			<Dropdown menu={{ items }} trigger={['click']}>
				<Button
					type='text'
					size='small'
					icon={<MoreOutlined />}
					style={{ cursor: 'pointer' }}
				/>
			</Dropdown>
		</Tooltip>
	)
}

export default ActionMenu
