import { PlusOutlined } from '@ant-design/icons'

const AddTileRenderField = ({ remaining, inputId }) => (
	<label
		htmlFor={inputId}
		style={{
			width: 120,
			height: 120,
			border: '1px dashed #d9d9d9',
			borderRadius: 8,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
			cursor: 'pointer',
			color: '#1677ff',
			background: '#fafafa',
		}}
	>
		<PlusOutlined />
		<span>{remaining}</span>
	</label>
)

export default AddTileRenderField
