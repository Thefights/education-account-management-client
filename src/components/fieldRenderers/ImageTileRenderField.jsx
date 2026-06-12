import { DeleteOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const ImageTileRenderField = ({ src, alt, onRemove }) => (
	<div style={{ position: 'relative', width: 120, height: 120 }}>
		<img
			src={src}
			alt={alt}
			style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
		/>
		<Button
			danger
			size='small'
			shape='circle'
			icon={<DeleteOutlined />}
			onClick={onRemove}
			style={{ position: 'absolute', top: 6, right: 6 }}
		/>
	</div>
)

export default ImageTileRenderField
