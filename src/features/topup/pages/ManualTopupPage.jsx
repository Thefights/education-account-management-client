import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import GenericTable from '@/shared/components/tables/GenericTable'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useTranslation from '@/shared/hooks/useTranslation'
import { downloadCsvTemplate } from '@/shared/utils/downloadFile'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
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
  Tag,
  Typography,
  Upload,
  theme,
} from 'antd'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ManualTopupResult = ({ result, submittedTopup, onViewExecution, t }) => {
  const { token } = theme.useToken()
  const hasFailures = Boolean(result.totalFailed)

  return (
    <div
      style={{
        border: `1px solid ${hasFailures ? token.colorWarningBorder : token.colorSuccessBorder}`,
        borderRadius: token.borderRadiusLG,
        background: hasFailures ? token.colorWarningBg : token.colorSuccessBg,
        padding: 16,
      }}
    >
      <Flex vertical gap={16}>
        <Alert
          type={hasFailures ? 'warning' : 'success'}
          showIcon
          message={t('topup.execution_completed')}
          style={{ background: 'transparent', border: 0, padding: 0 }}
        />

        <Flex gap={24} wrap>
          <Typography.Text>
            <Typography.Text type="secondary">{t('topup.processed')}: </Typography.Text>
            <Typography.Text strong>{result.totalProcessed}</Typography.Text>
          </Typography.Text>
          <Typography.Text>
            <Typography.Text type="secondary">{t('topup.succeeded')}: </Typography.Text>
            <Typography.Text type="success" strong>
              {result.totalSuccess}
            </Typography.Text>
          </Typography.Text>
          <Typography.Text>
            <Typography.Text type="secondary">{t('topup.failed')}: </Typography.Text>
            <Typography.Text type={hasFailures ? 'danger' : undefined} strong>
              {result.totalFailed}
            </Typography.Text>
          </Typography.Text>
          <Typography.Text>
            <Typography.Text type="secondary">{t('topup.amount_credited')}: </Typography.Text>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(result.totalAmountCredited)}
            </Typography.Text>
          </Typography.Text>
        </Flex>

        {submittedTopup && (
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, md: 3 }}
            bordered
            style={{ background: token.colorBgContainer }}
          >
            <Descriptions.Item label={t('topup.amount')}>
              {formatCurrencyBasedOnCurrentLanguage(submittedTopup.topUpAmount)}
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.reason')}>
              {submittedTopup.disbursementReason}
            </Descriptions.Item>
            <Descriptions.Item label={t('topup.target_selection')}>
              {submittedTopup.mode === 'selection' ? (
                <Tag color="blue">
                  {t('topup.selected_count', { count: submittedTopup.accountCount })}
                </Tag>
              ) : (
                submittedTopup.fileName
              )}
            </Descriptions.Item>
          </Descriptions>
        )}

        <Space>
          <Button onClick={onViewExecution}>{t('topup.view_execution')}</Button>
        </Space>

        {!!result.successList?.length && (
          <Flex vertical gap={8}>
            <Typography.Text strong>{t('topup.succeeded')}</Typography.Text>
            <GenericTable
              data={result.successList}
              rowKey="topUpTransactionId"
              fields={[
                { key: 'accountNumber', title: t('topup.account_number') },
                { key: 'accountName', title: t('topup.account_name') },
                {
                  key: 'topUpAmount',
                  title: t('topup.amount'),
                  isNumeric: true,
                  render: formatCurrencyBasedOnCurrentLanguage,
                },
              ]}
            />
          </Flex>
        )}

        {!!result.failList?.length && (
          <Flex vertical gap={8}>
            <Typography.Text strong>{t('topup.failed')}</Typography.Text>
            <GenericTable
              data={result.failList}
              rowKey="accountId"
              fields={[
                { key: 'accountNumber', title: t('topup.account_number') },
                { key: 'accountName', title: t('topup.account_name') },
                { key: 'reason', title: t('topup.failure_reason') },
              ]}
            />
          </Flex>
        )}
      </Flex>
    </div>
  )
}

const ManualTopupPage = ({ embedded = false }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('selection')
  const [accountIds, setAccountIds] = useState([])
  const [accountOptionCache, setAccountOptionCache] = useState({})
  const [file, setFile] = useState(null)
  const [topUpAmount, setTopUpAmount] = useState(null)
  const [disbursementReason, setDisbursementReason] = useState('')
  const [result, setResult] = useState(null)
  const [submittedTopup, setSubmittedTopup] = useState(null)
  const idempotencyKeyRef = useRef(null)
  const executeTopup = useAxiosSubmit({ url: ApiUrls.TOPUP.EXECUTE_MANUAL, method: 'POST' })

  const invalidateSubmission = () => {
    idempotencyKeyRef.current = null
    setResult(null)
    setSubmittedTopup(null)
  }

  const loadAccounts = useCallback(
    async ({ search, page, pageSize }) => {
      const response = await axiosConfig.get(ApiUrls.TOPUP.ELIGIBLE_ACCOUNTS, {
        params: { search, page, pageSize },
      })
      const data = response.data
      const accounts = data?.collection || []
      setAccountOptionCache((current) =>
        Object.fromEntries([
          ...Object.entries(current),
          ...accounts.map((account) => [String(account.id), account]),
        ])
      )
      return {
        totalCount: data?.totalCount || 0,
        options: accounts.map((account) => ({
          value: account.id,
          label: (
            <Flex vertical>
              <Typography.Text strong>
                {account.accountNumber} - {account.name}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t('topup.balance')}:{' '}
                {formatCurrencyBasedOnCurrentLanguage(account.balance)}
              </Typography.Text>
            </Flex>
          ),
          searchKey: `${account.accountNumber} ${account.name}`,
        })),
      }
    },
    [t]
  )

  const accountOptions = useMemo(
    () =>
      Object.values(accountOptionCache).map((account) => ({
        value: account.id,
        label: (
          <Flex vertical>
            <Typography.Text strong>
              {account.accountNumber} - {account.name}
            </Typography.Text>
            <Typography.Text type="secondary">
              {t('topup.balance')}:{' '}
              {formatCurrencyBasedOnCurrentLanguage(account.balance)}
            </Typography.Text>
          </Flex>
        ),
        searchKey: `${account.accountNumber} ${account.name}`,
      })),
    [accountOptionCache, t]
  )

  const handleAccountIdsChange = useCallback((selectedValues) => {
    invalidateSubmission()
    setAccountIds(selectedValues || [])
  }, [])

  const { renderField: renderTopupField } = useFieldRenderer(
    { accountIds },
    (key, value) => {
      if (key === 'accountIds') handleAccountIdsChange(value)
    },
    (event) => {
      if (event?.target?.name === 'accountIds') handleAccountIdsChange(event.target.value)
    }
  )

  const accountField = useMemo(
    () => ({
      key: 'accountIds',
      title: t('topup.select_accounts'),
      type: 'select',
      multiple: true,
      required: true,
      placeholder: 'Select one or more eligible accounts',
      options: accountOptions,
      loadOptions: loadAccounts,
      renderOptionValue: (value) => {
        const account = accountOptionCache[String(value)]
        return account ? `${account.accountNumber} - ${account.name}` : String(value)
      },
    }),
    [accountOptionCache, accountOptions, loadAccounts, t]
  )

  const submit = async () => {
    idempotencyKeyRef.current ??= crypto.randomUUID()
    const submittedSnapshot = {
      mode,
      accountCount: accountIds.length,
      fileName: file?.name,
      topUpAmount,
      disbursementReason: disbursementReason.trim(),
    }
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
      setSubmittedTopup(submittedSnapshot)
      idempotencyKeyRef.current = null
      setTopUpAmount(null)
      setDisbursementReason('')
      setAccountIds([])
      setFile(null)
    }
  }

  const tabItems = [
    {
      key: 'selection',
      label: t('topup.multiple_select'),
      children: (
        <Flex vertical gap={8}>
          {renderTopupField(accountField)}
          {accountIds.length > 0 ? (
            <Typography.Text type="success" strong>
              {t('topup.selected_count', { count: accountIds.length }, `${accountIds.length} selected`)}
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary">No accounts selected</Typography.Text>
          )}
        </Flex>
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
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => downloadCsvTemplate(csvImportTemplates.manualTopup)}
            >
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
                  placeholder="e.g. 100.00"
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
                  placeholder="e.g. Approved after reviewing supporting documents"
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
              <ManualTopupResult
                result={result}
                submittedTopup={submittedTopup}
                t={t}
                onViewExecution={() =>
                  navigate(
                    routeUrls.BASE_ROUTE.FINANCE_ADMIN(
                      routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(result.batchId)
                    )
                  )
                }
              />
            )}
          </Flex>
        </Card>
      </div>
    </>
  )

  return content
}

export default ManualTopupPage
