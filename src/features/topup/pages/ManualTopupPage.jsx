import axiosConfig from '@/shared/api/axiosClient'
import { ApiUrls } from '@/shared/api/apiUrls'
import MultipleSelectDialog from '@/shared/components/dialogs/commons/MultipleSelectDialog'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { Alert, Button, Card, Descriptions, Flex, Input, InputNumber, Radio, Space, Typography, Upload } from 'antd'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ManualTopupPage = ({ embedded = false }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('selection')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [accountIds, setAccountIds] = useState([])
  const [file, setFile] = useState(null)
  const [topUpAmount, setTopUpAmount] = useState(null)
  const [disbursementReason, setDisbursementReason] = useState('')
  const [result, setResult] = useState(null)
  const idempotencyKeyRef = useRef(null)
  const executeTopup = useAxiosSubmit({ url: ApiUrls.TOPUP.EXECUTE_MANUAL, method: 'POST' })

  const invalidateSubmission = () => {
    idempotencyKeyRef.current = null
    setResult(null)
  }

  const loadAccounts = useCallback(async ({ search, page, pageSize }) => {
    const response = await axiosConfig.get(ApiUrls.TOPUP.ELIGIBLE_ACCOUNTS, {
      params: { search, page, pageSize },
    })
    const data = response.data
    return {
      totalCount: data?.totalCount || 0,
      options: (data?.collection || []).map((account) => ({
        value: account.id,
        label: (
          <Flex vertical>
            <Typography.Text strong>{account.accountNumber} - {account.name}</Typography.Text>
            <Typography.Text type="secondary">
              <MaskedNric value={account.nric} /> | {t('topup.balance', 'Balance')}: {account.balance}
            </Typography.Text>
          </Flex>
        ),
        searchKey: `${account.accountNumber} ${account.nric} ${account.name}`,
      })),
    }
  }, [t])

  const submit = async () => {
    idempotencyKeyRef.current ??= crypto.randomUUID()
    const response = await executeTopup.submit({
      overrideData: {
        ...(mode === 'selection' ? { accountIds } : { file }),
        topUpAmount,
        disbursementReason: disbursementReason.trim(),
        idempotencyKey: idempotencyKeyRef.current,
      },
    })
    if (response?.data) {
      setResult(response.data)
      idempotencyKeyRef.current = null
    }
  }

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob(['AccountNumber\r\n'], { type: 'text/csv' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'manual-topup-template.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const content = (
    <>
      <Flex vertical gap={16} style={{ maxWidth: 760 }}>
        <Typography.Title level={4}>{t('topup.manual_title')}</Typography.Title>
        <Radio.Group value={mode} onChange={(event) => { invalidateSubmission(); setMode(event.target.value) }}>
          <Radio.Button value="selection">{t('topup.multiple_select', 'Multiple Select')}</Radio.Button>
          <Radio.Button value="csv">{t('topup.csv_file', 'CSV File')}</Radio.Button>
        </Radio.Group>
        {mode === 'selection' ? (
          <Space>
            <Button onClick={() => setPickerOpen(true)}>{t('topup.select_accounts', 'Select accounts')}</Button>
            <Typography.Text>{t('topup.selected_count', { count: accountIds.length }, `${accountIds.length} selected`)}</Typography.Text>
          </Space>
        ) : (
          <Space wrap>
            <Upload accept=".csv,text/csv" maxCount={1} beforeUpload={(selectedFile) => { invalidateSubmission(); setFile(selectedFile); return false }} onRemove={() => { invalidateSubmission(); setFile(null) }}>
              <Button icon={<UploadOutlined />}>{t('topup.upload_csv', 'Upload CSV')}</Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>{t('topup.csv_template', 'CSV template')}</Button>
          </Space>
        )}
        <InputNumber min={0.01} precision={2} value={topUpAmount} onChange={(value) => { invalidateSubmission(); setTopUpAmount(value) }} placeholder={t('topup.amount')} style={{ width: '100%' }} />
        <Input.TextArea rows={4} value={disbursementReason} onChange={(event) => { invalidateSubmission(); setDisbursementReason(event.target.value) }} placeholder={t('topup.reason')} />
        <Button type="primary" loading={executeTopup.loading} disabled={(mode === 'selection' ? !accountIds.length : !file) || !topUpAmount || !disbursementReason.trim()} onClick={submit}>{t('topup.execute')}</Button>
        {result && (
          <Alert type={result.totalFailed ? 'warning' : 'success'} showIcon message={t('topup.execution_completed', 'Top-up execution completed')} description={
            <Flex vertical gap={12}>
              <Descriptions size="small" column={2}>
                <Descriptions.Item label={t('topup.processed', 'Processed')}>{result.totalProcessed}</Descriptions.Item>
                <Descriptions.Item label={t('topup.succeeded', 'Succeeded')}>{result.totalSuccess}</Descriptions.Item>
                <Descriptions.Item label={t('topup.failed', 'Failed')}>{result.totalFailed}</Descriptions.Item>
                <Descriptions.Item label={t('topup.amount_credited', 'Amount credited')}>{result.totalAmountCredited}</Descriptions.Item>
              </Descriptions>
              <Button onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(result.batchId)))}>{t('topup.view_execution', 'View execution')}</Button>
              {!!result.successList?.length && <GenericTable data={result.successList} rowKey="topUpTransactionId" fields={[{ key: 'accountNumber', title: t('topup.account_number', 'Account') }, { key: 'accountName', title: t('topup.account_name', 'Name') }, { key: 'topUpAmount', title: t('topup.amount') }]} />}
              {!!result.failList?.length && <GenericTable data={result.failList} rowKey="accountId" fields={[{ key: 'accountNumber', title: t('topup.account_number', 'Account') }, { key: 'accountName', title: t('topup.account_name', 'Name') }, { key: 'reason', title: t('topup.failure_reason', 'Reason') }]} />}
            </Flex>
          } />
        )}
      </Flex>
      <MultipleSelectDialog open={pickerOpen} onClose={() => setPickerOpen(false)} value={accountIds} onChange={(values) => { invalidateSubmission(); setAccountIds(values) }} loadOptions={loadAccounts} title={t('topup.select_accounts', 'Select accounts')} />
    </>
  )

  return embedded ? content : <Card>{content}</Card>
}

export default ManualTopupPage
