import React, { useState, useEffect } from 'react'
import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { message, Modal, Button, Upload, Typography, Space, theme } from 'antd'
import { InboxOutlined, FilePdfOutlined } from '@ant-design/icons'

const { Dragger } = Upload
const { Title, Text } = Typography

const AiDocumentUploadDialog = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const uploadDoc = useAxiosSubmit({
    url: ApiUrls.AI_DOCUMENT_MANAGEMENT.UPLOAD,
    method: 'POST'
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl('')
    }
  }, [selectedFile])

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    onClose?.()
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      message.error('Please select a PDF file first.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('adminOnly', true)

      const response = await uploadDoc.submit({
        overrideData: formData,
        overrideConfig: {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      })
      
      if (response) {
        message.success('Document uploaded successfully.')
        onSuccess?.()
        handleClose()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const draggerProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    showUploadList: false,
    beforeUpload: (file) => {
      const isPdf = file.type === 'application/pdf'
      if (!isPdf) {
        message.error('You can only upload PDF files!')
        return Upload.LIST_IGNORE
      }
      setSelectedFile(file)
      return false // Prevent automatic upload
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={<Title level={4} style={{ margin: 0, color: token.colorText }}>Upload AI Document</Title>}
      width={previewUrl ? 1100 : 500}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={handleClose} disabled={uploadDoc.loading}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            loading={uploadDoc.loading}
            disabled={!selectedFile}
          >
            Confirm Upload
          </Button>
        </Space>
      }
      styles={{
        body: { 
          paddingTop: 16, 
          height: previewUrl ? '75vh' : 'auto',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      {!previewUrl ? (
        <Dragger {...draggerProps} style={{ padding: '60px 0', background: token.colorBgLayout, borderColor: token.colorBorder, borderRadius: 12 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: token.colorPrimary, fontSize: 48 }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 600, color: token.colorText, marginTop: 16 }}>
            Click or drag a PDF file to this area to upload
          </p>
          <p className="ant-upload-hint" style={{ color: token.colorTextSecondary, marginTop: 8, fontSize: 14 }}>
            Support for a single PDF document. The file will be processed by AI for Q&A.
          </p>
        </Dragger>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
          {/* Top Bar: File Info + Action */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px 20px',
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <Space align="center" size={16}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: token.colorErrorBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${token.colorErrorBorder}`
              }}>
                <FilePdfOutlined style={{ fontSize: 24, color: token.colorError }} />
              </div>
              <div>
                <Text strong style={{ display: 'block', wordBreak: 'break-all', fontSize: 15, color: token.colorText, lineHeight: 1.2, marginBottom: 2 }}>
                  {selectedFile.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 13, color: token.colorTextSecondary }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </div>
            </Space>

            <Upload {...draggerProps} showUploadList={false}>
              <Button 
                type="default" 
                icon={<InboxOutlined />} 
                style={{ 
                  borderRadius: 8,
                  fontWeight: 500,
                  borderColor: token.colorBorder,
                  color: token.colorText,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                Change File
              </Button>
            </Upload>
          </div>
          
          {/* Bottom: PDF Preview */}
          <div style={{ 
            flex: 1, 
            borderRadius: 12, 
            overflow: 'hidden', 
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            background: token.colorBgContainer
          }}>
            <iframe
              src={previewUrl}
              title="PDF Preview"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

export default AiDocumentUploadDialog
