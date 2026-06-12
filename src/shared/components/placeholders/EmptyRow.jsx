import useTranslation from '@/shared/hooks/useTranslation'
import { InboxOutlined } from '@ant-design/icons'
import { Space, Typography } from 'antd'

const EmptyRow = ({
	title,
	description,
	icon = <InboxOutlined style={{ fontSize: 120, color: '#bfbfbf' }} />,
	buttons,
	minHeight = 200,
}) => {
	const { t } = useTranslation()

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				color: '#8c8c8c',
				minHeight,
				padding: 32,
			}}
		>
			{icon}
			<Space orientation='vertical' style={{ textAlign: 'left' }} size='small'>
				<Typography.Title level={4} style={{ marginBottom: 0, fontWeight: 600 }}>
					{title || t('text.placeholder.no_data')}
				</Typography.Title>
				{description && (
					<Typography.Text type='secondary'>{description}</Typography.Text>
				)}
				{buttons && (
					<div style={{ marginTop: 12 }}>{buttons}</div>
				)}
			</Space>
		</div>
	)
}

export default EmptyRow
