import { Form } from 'antd'

const DrawingRenderField = ({ field, showError, onDrawingChange }) => {
	const fieldLabel = (
		<span style={{ whiteSpace: 'normal', lineHeight: 1.35 }}>
			{field.title}
		</span>
	)

	return (
		<Form.Item
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
			labelAlign='left'
			colon={false}
			style={{ marginBottom: 8 }}
			label={fieldLabel}
			required={field.required ?? true}
			validateStatus={showError ? 'error' : ''}
			help={showError ? 'Required' : undefined}
		>
			<input
				type='file'
				accept='image/*'
				onChange={(event) => onDrawingChange(event.target.files?.[0] || null)}
			/>
		</Form.Item>
	)
}

export default DrawingRenderField
