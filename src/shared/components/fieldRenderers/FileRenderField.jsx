import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Upload } from 'antd'

const FileRenderField = ({ field, values, setField, showError }) => {
	const currentValue = values?.[field.key]
	const files = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []
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
			<Upload
				beforeUpload={(file) => {
					setField(field.key, field.multiple ? [...files, file] : file)
					return false
				}}
				onRemove={(file) => {
					if (!field.multiple) {
						setField(field.key, null)
						return
					}
					setField(
						field.key,
						files.filter((item) => item.uid !== file.uid && item.name !== file.name)
					)
				}}
				fileList={files.map((file, index) => ({
					uid: file.uid || `${field.key}-${index}`,
					name: file.name || String(file),
					status: 'done',
				}))}
				multiple={!!field.multiple}
			>
				<Button icon={<UploadOutlined />}>{field.buttonText || 'Upload'}</Button>
			</Upload>
		</Form.Item>
	)
}

export default FileRenderField
