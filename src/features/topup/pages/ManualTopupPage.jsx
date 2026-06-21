import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import MultipleSelectDialog from '@/shared/components/dialogs/commons/MultipleSelectDialog'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  DollarOutlined,
  DownloadOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Space,
  Tabs,
  Typography,
  Upload,
} from 'antd'
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

  const loadAccounts = useCallback(
    async ({ search, page, pageSize }) => {
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
              <Typography.Text strong>
                {account.accountNumber} - {account.name}
              </Typography.Text>
              <Typography.Text type="secondary">
                <MaskedNric value={account.nric} /> | {t('topup.balance')}: {account.balance}
              </Typography.Text>
            </Flex>
          ),
          searchKey: `${account.accountNumber} ${account.nric} ${account.name}`,
        })),
      }
    },
    [t]
  )

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
      setTopUpAmount(null)
      setDisbursementReason('')
      setAccountIds([])
      setFile(null)
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

  const tabItems = [
    {
      key: 'selection',
      label: t('topup.multiple_select'),
      children: (
        <Form.Item label={t('topup.select_accounts')} required>
          <Space>
            <Button onClick={() => setPickerOpen(true)}>{t('topup.select_accounts')}</Button>
            {accountIds.length > 0 ? (
              <Typography.Text type="success" strong>
                {t(
                  'topup.selected_count',
                  { count: accountIds.length },
                  `${accountIds.length} selected`
                )}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary">No accounts selected</Typography.Text>
            )}
          </Space>
        </Form.Item>
      ),
    },
    {
      key: 'csv',
      label: t('topup.csv_file'),
      children: (
        <Form.Item label={t('topup.upload_csv')} required>
          <Space wrap>
            <Upload
              accept=".csv,text/csv"
              maxCount={1}
              beforeUpload={(selectedFile) => {
                invalidateSubmission()
                setFile(selectedFile)
                return false
              }}
              onRemove={() => {
                invalidateSubmission()
                setFile(null)
              }}
            >
              <Button icon={<UploadOutlined />}>{t('topup.upload_csv')}</Button>
            </Upload>
            <Button type="link" icon={<DownloadOutlined />} onClick={downloadTemplate}>
              {t('topup.csv_template')}
            </Button>
          </Space>
        </Form.Item>
      ),
    },
  ]

  const isFormValid = () => {
    const isTargetSelected = mode === 'selection' ? accountIds.length > 0 : !!file
    return isTargetSelected && topUpAmount > 0 && disbursementReason.trim().length > 0
  }

  const content = (
    <>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card bordered={!embedded} style={{ border: embedded ? 'none' : undefined }}>
          <Flex vertical gap={24}>
            {!embedded && (
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('topup.manual_title')}
              </Typography.Title>
            )}

            <Form layout="vertical">
              {/* Target Selection Section */}
              <Typography.Title level={5}>
                {t('topup.target_selection', '1. Target Selection')}
              </Typography.Title>
              <Tabs
                type="card"
                activeKey={mode}
                onChange={(key) => {
                  invalidateSubmission()
                  setMode(key)
                }}
                items={tabItems}
              />

              <Divider style={{ margin: '12px 0 24px 0' }} />

              {/* Amount & Reason Section */}
              <Typography.Title level={5}>
                {t('topup.details', '2. Top-up Details')}
              </Typography.Title>
              <Form.Item label={t('topup.amount')} required>
                <InputNumber
                  prefix={<DollarOutlined />}
                  size="large"
                  min={0.01}
                  precision={2}
                  value={topUpAmount}
                  onChange={(value) => {
                    invalidateSubmission()
                    setTopUpAmount(value)
                  }}
                  placeholder="0.00"
                  style={{ width: '100%', maxWidth: 300 }}
                />
              </Form.Item>

              <Form.Item label={t('topup.reason')} required>
                <Input.TextArea
                  rows={4}
                  value={disbursementReason}
                  onChange={(event) => {
                    invalidateSubmission()
                    setDisbursementReason(event.target.value)
                  }}
                  placeholder={t('topup.reason_placeholder', 'Enter a reason for this top-up')}
                />
              </Form.Item>

              <Button
                type="primary"
                size="large"
                loading={executeTopup.loading}
                disabled={!isFormValid()}
                onClick={submit}
                icon={<FileTextOutlined />}
              >
                {t('topup.execute')}
              </Button>
            </Form>

            {/* Result Section */}
            {result && (
              <Alert
                type={result.totalFailed ? 'warning' : 'success'}
                showIcon
                message={t('topup.execution_completed')}
                description={
                  <Flex vertical gap={16} style={{ marginTop: 8 }}>
                    <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }} bordered>
                      <Descriptions.Item label={t('topup.processed')}>
                        {result.totalProcessed}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={t('topup.succeeded')}
                        labelStyle={{ color: 'green' }}
                      >
                        {result.totalSuccess}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('topup.failed')} labelStyle={{ color: 'red' }}>
                        {result.totalFailed}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('topup.amount_credited')}>
                        {result.totalAmountCredited}
                      </Descriptions.Item>
                    </Descriptions>
                    <Space>
                      <Button
                        onClick={() =>
                          navigate(
                            routeUrls.BASE_ROUTE.FINANCE_ADMIN(
                              routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(result.batchId)
                            )
                          )
                        }
                      >
                        {t('topup.view_execution')}
                      </Button>
                    </Space>
                    {!!result.successList?.length && (
                      <GenericTable
                        data={result.successList}
                        rowKey="topUpTransactionId"
                        fields={[
                          { key: 'accountNumber', title: t('topup.account_number') },
                          { key: 'accountName', title: t('topup.account_name') },
                          { key: 'topUpAmount', title: t('topup.amount') },
                        ]}
                      />
                    )}
                    {!!result.failList?.length && (
                      <GenericTable
                        data={result.failList}
                        rowKey="accountId"
                        fields={[
                          { key: 'accountNumber', title: t('topup.account_number') },
                          { key: 'accountName', title: t('topup.account_name') },
                          { key: 'reason', title: t('topup.failure_reason') },
                        ]}
                      />
                    )}
                  </Flex>
                }
              />
            )}
          </Flex>
        </Card>
      </div>

      <MultipleSelectDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={accountIds}
        onChange={(values) => {
          invalidateSubmission()
          setAccountIds(values)
        }}
        loadOptions={loadAccounts}
        title={t('topup.select_accounts')}
      />
    </>
  )

  return content
}

export default ManualTopupPage
