import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useTranslation from '@/shared/hooks/useTranslation'
import { downloadCsvTemplate } from '@/shared/utils/downloadFile'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Flex, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'

const DEFAULT_INITIAL_VALUES = { file: null }

const getResultValue = (result, key) =>
  result?.[key] ?? result?.[`${key[0].toUpperCase()}${key.slice(1)}`]

const GenericImportSection = ({
  open,
  onClose,
  result,
  onSubmit,
  title,
  submitLabel,
  fields,
  initialValues = DEFAULT_INITIAL_VALUES,
  renderResult,
  template,
}) => {
  const { t } = useTranslation()
  const [hasFile, setHasFile] = useState(false)

  const defaultFields = useMemo(
    () => [
      {
        key: 'file',
        title: t('import.file'),
        type: 'file',
        buttonText: t('button.add_file'),
        props: { accept: '.csv,text/csv' },
      },
    ],
    [t]
  )

  const columns = useMemo(
    () => [
      {
        key: 'rowNumber',
        dataIndex: 'rowNumber',
        title: t('import.row_number'),
      },
      {
        key: 'field',
        dataIndex: 'field',
        title: t('import.field'),
      },
      {
        key: 'message',
        dataIndex: 'message',
        title: t('import.message'),
      },
    ],
    [t]
  )

  const errors = getResultValue(result, 'errors') ?? getResultValue(result, 'failures') ?? []
  const succeeded =
    getResultValue(result, 'succeeded') ?? getResultValue(result, 'successes')?.length ?? 0
  const failed = getResultValue(result, 'failed') ?? errors.length
  const total = getResultValue(result, 'total') ?? succeeded + failed
  const defaultResult = result ? (
    <Flex vertical gap={16}>
      <Flex gap={24} wrap>
        <Typography.Text>
          <Typography.Text type="secondary">{t('import.total')}: </Typography.Text>
          <Typography.Text strong>{total}</Typography.Text>
        </Typography.Text>
        <Typography.Text>
          <Typography.Text type="secondary">{t('import.succeeded')}: </Typography.Text>
          <Typography.Text type="success" strong>
            {succeeded}
          </Typography.Text>
        </Typography.Text>
        <Typography.Text>
          <Typography.Text type="secondary">{t('import.failed')}: </Typography.Text>
          <Typography.Text type="danger" strong>
            {failed}
          </Typography.Text>
        </Typography.Text>
      </Flex>
      {errors.length > 0 && (
        <Flex vertical gap={8}>
          <Typography.Text strong>{t('import.errors')}</Typography.Text>
          <Table
            size="small"
            columns={columns}
            dataSource={errors.map((error, index) => ({
              key: `${getResultValue(error, 'rowNumber') ?? index}-${
                getResultValue(error, 'field') ?? ''
              }`,
              rowNumber: error.rowNumber ?? error.RowNumber,
              field: error.field ?? error.Field,
              message: error.message ?? error.Message ?? error.errorMessage ?? error.ErrorMessage,
            }))}
            pagination={false}
          />
        </Flex>
      )}
    </Flex>
  ) : null

  const resultContent = renderResult ? renderResult(result) : defaultResult

  const handleSubmit = async ({ values }) => {
    await onSubmit?.(values)
  }

  return (
    <GenericFormDialog
      open={open}
      onClose={() => {
        setHasFile(false)
        onClose?.()
      }}
      initialValues={initialValues}
      fields={fields ?? defaultFields}
      submitLabel={submitLabel ?? t('import.submit')}
      title={title ?? t('import.title')}
      width={720}
      destroyOnClose
      onSubmit={handleSubmit}
      onValuesChange={(values) => setHasFile(!!values.file)}
    >
      {template && !hasFile && (
        <Flex justify="end" style={{ marginBottom: 16 }}>
          <Button icon={<DownloadOutlined />} onClick={() => downloadCsvTemplate(template)}>
            {t('import.download_template')}
          </Button>
        </Flex>
      )}
      {resultContent}
    </GenericFormDialog>
  )
}

export default GenericImportSection
