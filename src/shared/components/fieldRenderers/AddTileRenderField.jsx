import { PlusOutlined } from '@ant-design/icons'
import { theme } from 'antd'

const AddTileRenderField = ({ remaining, inputId }) => {
	const { token } = theme.useToken()

	return (
		<label
			htmlFor={inputId}
			style={{
				width: 120,
				height: 120,
				border: `1px dashed ${token.colorBorder}`,
				borderRadius: 8,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 6,
				cursor: 'pointer',
				color: token.colorPrimary,
				background: token.colorFillTertiary,
			}}
		>
			<PlusOutlined />
			<span>{remaining}</span>
		</label>
	)
}

export default AddTileRenderField
