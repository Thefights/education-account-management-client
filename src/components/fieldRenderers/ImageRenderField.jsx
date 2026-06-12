import ImagePreviewButton from '@/components/generals/ImagePreviewButton'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Space, Upload } from 'antd'

const ImageRenderField = ({ field, setField, showError, preview }) => {
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
			<Space orientation='vertical' size={8}>
				{preview && <ImagePreviewButton src={preview} alt={field.title} width={120} height={120} />}
				<Upload
					accept='image/*'
					showUploadList={false}
					beforeUpload={(file) => {
						setField(field.key, file)
						return false
					}}
				>
					<Button icon={<UploadOutlined />}>{field.buttonText || 'Upload image'}</Button>
				</Upload>
			</Space>
		</Form.Item>
	)
}

export default ImageRenderField
