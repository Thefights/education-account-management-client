import React from 'react'
import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { message } from 'antd'

const AiDocumentUploadDialog = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const uploadDoc = useAxiosSubmit({
    url: ApiUrls.AI_DOCUMENT_MANAGEMENT.UPLOAD,
    method: 'POST'
  })

  const handleSubmit = async ({ values, closeDialog }) => {
    try {
      const formData = new FormData()
      formData.append('file', values.file)
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
        closeDialog()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fields = [
    {
      key: 'file',
      label: 'PDF File',
      type: 'file',
      required: true,
      props: {
        accept: '.pdf',
      }
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onClose={onClose}
      title="Upload AI Document"
      submitLabel="Upload"
      fields={fields}
      onSubmit={handleSubmit}
    />
  )
}

export default AiDocumentUploadDialog
