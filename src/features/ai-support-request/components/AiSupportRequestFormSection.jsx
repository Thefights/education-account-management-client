import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen } from '@/shared/utils/validateUtil'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Alert } from 'antd'
import { useMemo } from 'react'

const AiSupportRequestFormSection = ({ open, initialValues, onClose, onSubmit }) => {
  const { t } = useTranslation()
  const fields = useMemo(
    () => [
      {
        key: 'requestGuidance',
        type: 'custom',
        required: false,
        render: () => (
          <Alert
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message={t('ai_support_request.text.create_help')}
          />
        ),
      },
      {
        key: 'title',
        title: t('ai_support_request.field.title'),
        placeholder: t('ai_support_request.placeholder.title'),
        validate: [maxLen(255)],
        props: { maxLength: 255, showCount: true },
      },
      {
        key: 'questionMessage',
        title: t('ai_support_request.field.question'),
        placeholder: t('ai_support_request.placeholder.question'),
        multiple: 5,
        validate: [maxLen(1000)],
        props: { maxLength: 1000, showCount: true, style: { resize: 'none' } },
      },
      {
        key: 'questionFooterSpacer',
        type: 'custom',
        required: false,
        render: () => <div style={{ height: 8 }} />,
      },
    ],
    [t]
  )

  return (
    <GenericFormDialog
      open={open}
      onClose={onClose}
      title={t('ai_support_request.title.create')}
      submitLabel={t('ai_support_request.action.submit_request')}
      initialValues={initialValues}
      fields={fields}
      destroyOnHidden
      onSubmit={onSubmit}
    />
  )
}

export default AiSupportRequestFormSection
