import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen } from '@/shared/utils/validateUtil'
import { Alert } from 'antd'
import { useMemo } from 'react'

const AiSupportRequestFormSection = ({ open, initialValues, onClose, onSubmit }) => {
  const { t } = useTranslation()
  const fields = useMemo(
    () => [
      {
        key: 'title',
        title: t('ai_support_request.field.title'),
        placeholder: t('ai_support_request.placeholder.title'),
        validate: [maxLen(255)],
      },
      {
        key: 'questionMessage',
        title: t('ai_support_request.field.question'),
        placeholder: t('ai_support_request.placeholder.question'),
        multiple: 5,
        validate: [maxLen(1000)],
      },
    ],
    [t]
  )

  return (
    <GenericFormDialog
      open={open}
      onClose={onClose}
      title={t('ai_support_request.title.create')}
      submitLabel={t('button.submit')}
      initialValues={initialValues}
      fields={fields}
      destroyOnHidden
      onSubmit={onSubmit}
    >
      <Alert type="info" showIcon message={t('ai_support_request.text.create_help')} />
    </GenericFormDialog>
  )
}

export default AiSupportRequestFormSection
