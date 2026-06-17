import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import useTranslation from '@/shared/hooks/useTranslation'
import { Table, Typography } from 'antd'
import { useMemo } from 'react'

const initialImportValues = {
  file: null,
  sendEmail: true,
}

const getResultValue = (result, camelKey, pascalKey) => result?.[camelKey] ?? result?.[pascalKey] ?? 0

const AccountManagementImportSection = ({
  open,
  onClose,
  result,
  onSubmit,
}) => {
  const { t } = useTranslation()

  const fields = useMemo(
    () => [
      {
        key: 'file',
        title: t('account.field.file'),
        type: 'file',
        buttonText: t('button.add_file'),
      },
      {
        key: 'sendEmail',
        title: t('account.field.send_email'),
        type: 'checkbox',
        required: false,
      },
    ],
    [t]
  )

  const columns = useMemo(
    () => [
      {
        key: 'rowNumber',
        dataIndex: 'rowNumber',
        title: t('account.import.row_number'),
      },
      {
        key: 'field',
        dataIndex: 'field',
        title: t('account.import.field'),
      },
      {
        key: 'message',
        dataIndex: 'message',
        title: t('account.import.message'),
      },
    ],
    [t]
  )

  const errors = result?.errors || result?.Errors || []
  const resultSummary = result ? (
    <>
      <Typography.Text>
        {t('account.import.total')}: {getResultValue(result, 'total', 'Total')}
      </Typography.Text>
      <Typography.Text>
        {t('account.import.succeeded')}: {getResultValue(result, 'succeeded', 'Succeeded')}
      </Typography.Text>
      <Typography.Text>
        {t('account.import.failed')}: {getResultValue(result, 'failed', 'Failed')}
      </Typography.Text>
      {errors.length > 0 && (
        <>
          <Typography.Text strong>{t('account.import.errors')}</Typography.Text>
          <Table
            size="small"
            columns={columns}
            dataSource={errors.map((error, index) => ({
              key: index,
              rowNumber: error.rowNumber ?? error.RowNumber,
              field: error.field ?? error.Field,
              message: error.message ?? error.Message,
            }))}
            pagination={false}
          />
        </>
      )}
    </>
  ) : null

  const handleSubmit = async ({ values }) => {
    await onSubmit?.(values)
  }

  return (
    <GenericFormDrawer
      open={open}
      onClose={onClose}
      initialValues={initialImportValues}
      fields={fields}
      submitLabel={t('account.button.batch_import')}
      title={t('account.title.batch_import')}
      width={720}
      destroyOnClose
      onSubmit={handleSubmit}
    >
      {resultSummary}
    </GenericFormDrawer>
  )
}

export default AccountManagementImportSection
