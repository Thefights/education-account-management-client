import React, { useState } from 'react'
import { Button, Space, message, Popconfirm, Typography, Modal } from 'antd'
import { UploadOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import GenericTable from '@/shared/components/tables/GenericTable'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosClient from '@/shared/api/axiosClient'
import useTranslation from '@/shared/hooks/useTranslation'
import useFetch from '@/shared/hooks/useFetch'
import AiDocumentUploadDialog from './AiDocumentUploadDialog'

const AiDocumentTableSection = () => {
  const { t } = useTranslation()
  const { data, loading, fetch: refresh } = useFetch(ApiUrls.AI_DOCUMENT_MANAGEMENT.INDEX)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState('')
  const [viewerTitle, setViewerTitle] = useState('')

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(ApiUrls.AI_DOCUMENT_MANAGEMENT.DELETE(id))
      message.success('Document deleted successfully.')
      refresh()
    } catch (e) {
      console.error(e)
      message.error('Failed to delete document.')
    }
  }

  const handleView = (docId, fileName) => {
    axiosClient
      .get(ApiUrls.AI_DOCUMENT_MANAGEMENT.DOWNLOAD(docId, fileName || 'document.pdf'), {
        responseType: 'blob',
      })
      .then((blobData) => {
        const fileUrl = window.URL.createObjectURL(
          new Blob([blobData], { type: 'application/pdf' })
        )
        setViewerUrl(fileUrl)
        setViewerTitle(fileName || 'Document Viewer')
        setViewerOpen(true)
      })
      .catch(() => message.error('Failed to load document for viewing.'))
  }

  const handleDownload = (docId, fileName) => {
    axiosClient
      .get(ApiUrls.AI_DOCUMENT_MANAGEMENT.DOWNLOAD(docId, fileName || 'document.pdf'), {
        responseType: 'blob',
      })
      .then((blobData) => {
        const fileUrl = window.URL.createObjectURL(
          new Blob([blobData], { type: 'application/pdf' })
        )
        const link = document.createElement('a')
        link.href = fileUrl
        link.setAttribute('download', fileName || 'document.pdf')
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(fileUrl)
      })
      .catch(() => message.error('Failed to download document.'))
  }

  const handleCloseViewer = () => {
    setViewerOpen(false)
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl)
      setViewerUrl('')
    }
  }

  const fields = [
    {
      title: 'No',
      key: 'no',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'File Name',
      key: 'file_name',
    },
    {
      title: 'Created At',
      key: 'uploaded_at',
      render: (val) => {
        if (!val) return '-';
        const date = new Date(val);
        const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{timeStr}</span>
            <span>{dateStr}</span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.doc_id, record.file_name)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.doc_id, record.file_name)}
          >
            Download
          </Button>
          <Popconfirm
            title="Are you sure to delete this document?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            AI Supported Documents
          </Typography.Title>
          <Typography.Text type="secondary">
            Manage the documents that the AI uses for answering questions.
          </Typography.Text>
        </div>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsUploadOpen(true)}>
          Upload Document
        </Button>
      </div>

      <GenericTable data={data || []} fields={fields} rowKey="id" loading={loading} />

      <AiDocumentUploadDialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => refresh()}
      />

      <Modal
        title={viewerTitle}
        open={viewerOpen}
        onCancel={handleCloseViewer}
        footer={null}
        width={1000}
        destroyOnClose
        style={{ top: 20 }}
        styles={{ body: { height: '80vh', padding: 0 } }}
      >
        {viewerUrl && (
          <iframe
            src={viewerUrl}
            title="PDF Viewer"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </Modal>
    </div>
  )
}

export default AiDocumentTableSection
