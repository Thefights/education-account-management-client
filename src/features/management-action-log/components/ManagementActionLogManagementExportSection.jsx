import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const exportFieldKeys = [
  'id',
  'batchId',
  'entityType',
  'entityId',
  'action',
  'previousStatus',
  'newStatus',
  'reason',
  'actorUserId',
  'actorUserRole',
  'actorFullName',
  'actorEmail',
  'occurredAt',
  'ipAddress',
]

const initialExportValues = {
  fields: exportFieldKeys,
}

const ManagementActionLogManagementExportSection = ({ open, onClose, onSubmit }) => {
  const { t } = useTranslation()

  const exportFieldOptions = useMemo(
    () =>
      exportFieldKeys.map((key) => ({
        value: key,
        label: t(`management_action_log.field.${key}`),
      })),
    [t]
  )

  const fields = useMemo(
    () => [
      {
        key: 'fields',
        title: t('management_action_log.field.export_fields'),
        type: 'checkbox-group',
        options: exportFieldOptions,
      },
    ],
    [exportFieldOptions, t]
  )

  const handleSubmit = async ({ values, closeDialog }) => {
    await onSubmit?.(values.fields)
    closeDialog()
  }

  return (
    <GenericFormDialog
      open={open}
      onClose={onClose}
      initialValues={initialExportValues}
      fields={fields}
      submitLabel={t('management_action_log.button.export')}
      title={t('management_action_log.title.export')}
      width={560}
      destroyOnHidden
      onSubmit={handleSubmit}
    />
  )
}

export default ManagementActionLogManagementExportSection
