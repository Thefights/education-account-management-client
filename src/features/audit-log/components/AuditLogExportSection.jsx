import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const exportFieldKeys = [
  'id',
  'actorUserId',
  'category',
  'action',
  'nRic',
  'ipAddress',
  'payloadJson',
  'occurredAt',
]

const initialExportValues = {
  fields: exportFieldKeys,
}

const AuditLogExportSection = ({ open, onClose, onSubmit }) => {
  const { t } = useTranslation()

  const exportFieldOptions = useMemo(
    () => [
      {
        value: 'id',
        label: t('audit_log.field.id'),
      },
      {
        value: 'actorUserId',
        label: t('audit_log.field.actor_user_id'),
      },
      {
        value: 'category',
        label: t('audit_log.field.category'),
      },
      {
        value: 'action',
        label: t('audit_log.field.action'),
      },
      {
        value: 'nRic',
        label: 'NRIC',
      },
      {
        value: 'ipAddress',
        label: t('audit_log.field.ip_address'),
      },
      {
        value: 'payloadJson',
        label: 'Payload JSON',
      },
      {
        value: 'occurredAt',
        label: t('audit_log.field.created_at'),
      },
    ],
    [t]
  )

  const fields = useMemo(
    () => [
      {
        key: 'fields',
        title: t('audit_log.field.export_fields'),
        type: 'checkbox-group',
        options: exportFieldOptions,
      },
    ],
    [exportFieldOptions, t]
  )

  const handleSubmit = async ({ values, closeDrawer }) => {
    await onSubmit?.(values.fields)
    closeDrawer()
  }

  return (
    <GenericFormDrawer
      open={open}
      onClose={onClose}
      initialValues={initialExportValues}
      fields={fields}
      submitLabel={t('audit_log.button.export')}
      title={t('audit_log.title.export')}
      width={520}
      destroyOnClose
      onSubmit={handleSubmit}
    />
  )
}

export default AuditLogExportSection
