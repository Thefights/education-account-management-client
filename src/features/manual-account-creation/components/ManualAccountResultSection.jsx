import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import useTranslation from '@/shared/hooks/useTranslation'
import { DownloadOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Typography } from 'antd'
import { useMemo } from 'react'

const ManualAccountResultSection = ({ result }) => {
  const { t } = useTranslation()
  const fields = useMemo(
    () => [
      { key: 'row', title: t('education_account.row'), width: 90 },
      {
        key: 'nric',
        title: t('education_account.nric'),
        width: 180,
        render: (value) => <MaskedNric value={value} />,
      },
      { key: 'error', title: t('education_account.error') },
    ],
    [t]
  )

  if (!result) return null

  const successes = result.successes || []
  const failures = result.failures || result.errors || []
  const succeededCount = result.succeeded ?? successes.length
  const normalizedFailures = failures.map((failure) => ({
    row: failure.rowNumber ?? failure.index,
    nric: failure.nric ?? failure.field,
    error: failure.errorMessage ?? failure.message,
  }))

  return (
    <Alert
      type={failures.length ? 'warning' : 'success'}
      showIcon
      message={t('education_account.result_message')}
      description={
        <Flex vertical gap={12}>
          <Typography.Text>
            {t('education_account.successes')}: {succeededCount}
          </Typography.Text>
          <Typography.Text>
            {t('education_account.failures')}: {failures.length}
          </Typography.Text>
          {failures.length > 0 && (
            <GenericTable data={normalizedFailures} fields={fields} rowKey="row" loading={false} />
          )}
          {result.failedCsvBase64 && (
            <Flex>
              <Button icon={<DownloadOutlined />}>
                {t('education_account.download_failed_csv')}
              </Button>
            </Flex>
          )}
        </Flex>
      }
    />
  )
}

export default ManualAccountResultSection
