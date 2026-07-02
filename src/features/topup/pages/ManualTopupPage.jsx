import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import { csvImportTemplates } from '@/shared/config/csvImportTemplates'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useTranslation from '@/shared/hooks/useTranslation'
import { downloadCsvTemplate } from '@/shared/utils/downloadFile'
import {
  formatCurrencyBasedOnCurrentLanguage,
  getCurrencySymbolBasedOnCurrentLanguage,
} from '@/shared/utils/formatCurrencyUtil'
import { selectInputNumberTextOnFocus } from '@/shared/utils/inputNumberFocusUtil'
import {
  CheckCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Collapse,
  Descriptions,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Space,
  Tabs,
  Tooltip,
  Typography,
  Upload,
  theme,
} from 'antd'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ResultStatCard = ({ value, label, valueColor }) => {
  return (
    <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}>
      <Flex vertical gap={4}>
        <Typography.Text strong style={{ color: valueColor, fontSize: 22, lineHeight: 1.2 }}>
          {value}
        </Typography.Text>
        <Typography.Text type="secondary">{label}</Typography.Text>
      </Flex>
    </Card>
  )
}

const ResultAccountRow = ({ account, amount, reason, failed = false }) => {
  const { token } = theme.useToken()

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={16}
      wrap
      style={{
        padding: '12px 0',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Flex align="center" gap={12} style={{ minWidth: 240, flex: 1 }}>
        <Avatar
          icon={<UserOutlined />}
          style={{ background: token.colorFillSecondary, color: token.colorText }}
        />
        <Flex vertical>
          <Typography.Text strong>{account.accountName || '-'}</Typography.Text>
          <Typography.Text type="secondary">{account.accountNumber || '-'}</Typography.Text>
          {failed && reason && (
            <Tooltip title={reason}>
              <Typography.Text type="danger" ellipsis style={{ maxWidth: 360 }}>
                {reason}
              </Typography.Text>
            </Tooltip>
          )}
        </Flex>
      </Flex>
      {!failed && (
        <Typography.Text strong style={{ color: token.colorSuccess, marginLeft: 'auto' }}>
          {formatCurrencyBasedOnCurrentLanguage(amount)}
        </Typography.Text>
      )}
    </Flex>
  )
}

const ManualTopupResult = ({ result, submittedTopup, onViewExecution, t }) => {
  const { token } = theme.useToken()
  const hasFailures = Boolean(result.totalFailed)
  const creditedAmount = formatCurrencyBasedOnCurrentLanguage(result.totalAmountCredited)
  const targetText = submittedTopup
    ? submittedTopup.mode === 'selection'
      ? `${submittedTopup.accountCount} ${t('topup.accounts')}`
      : submittedTopup.fileName
    : '-'

  const successItems = [
    {
      key: 'success',
      label: `${t('topup.succeeded')} (${result.successList?.length || 0})`,
      children: (
        <div>
          {(result.successList || []).map((account) => (
            <ResultAccountRow
              key={account.topUpTransactionId || account.accountNumber}
              account={account}
              amount={account.topUpAmount}
            />
          ))}
          <Flex justify="space-between" align="center" style={{ paddingTop: 12 }}>
            <Typography.Text strong>{t('topup.total_credited')}</Typography.Text>
            <Typography.Text strong style={{ color: token.colorSuccess, fontSize: 16 }}>
              {creditedAmount}
            </Typography.Text>
          </Flex>
        </div>
      ),
    },
  ]

  const failedItems = hasFailures
    ? [
        {
          key: 'failed',
          label: `${t('topup.failed')} (${result.failList?.length || 0})`,
          children: (result.failList || []).map((account) => (
            <ResultAccountRow
              key={account.accountId || account.accountNumber}
              account={account}
              reason={account.reason}
              failed
            />
          )),
        },
      ]
    : []

  return (
    <Card style={{ borderColor: token.colorBorderSecondary }}>
      <Flex vertical gap={20}>
        <Flex align="flex-start" justify="space-between" gap={16} wrap>
          <Flex gap={12} align="flex-start">
            <CheckCircleOutlined
              style={{ color: token.colorSuccess, fontSize: 28, marginTop: 2 }}
            />
            <Flex vertical gap={4}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('topup.manual_completed')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('topup.execution_summary', {
                  amount: creditedAmount,
                  count: result.totalSuccess,
                })}
              </Typography.Text>
            </Flex>
          </Flex>
          <Button onClick={onViewExecution}>{t('topup.view_history')}</Button>
        </Flex>

        <Flex gap={12} wrap>
          <ResultStatCard
            value={creditedAmount}
            label={t('topup.credited')}
            valueColor={token.colorSuccess}
          />
          <ResultStatCard value={result.totalProcessed} label={t('topup.processed')} />
          <ResultStatCard
            value={result.totalSuccess}
            label={t('topup.succeeded')}
            valueColor={token.colorSuccess}
          />
          <ResultStatCard
            value={result.totalFailed}
            label={t('topup.failed')}
            valueColor={hasFailures ? token.colorError : token.colorText}
          />
        </Flex>

        {submittedTopup && (
          <Card size="small" title={t('topup.execution_details')}>
            <Descriptions size="small" column={{ xs: 1, sm: 3 }}>
              <Descriptions.Item label={t('topup.amount')}>
                <Typography.Text strong>
                  {formatCurrencyBasedOnCurrentLanguage(submittedTopup.topUpAmount)}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('topup.reason')}>
                <Tooltip title={submittedTopup.disbursementReason}>
                  <Typography.Text ellipsis style={{ maxWidth: 260 }}>
                    {submittedTopup.disbursementReason}
                  </Typography.Text>
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label={t('topup.recipients')}>
                <Typography.Text strong>{targetText}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {!!result.successList?.length && (
          <Card size="small" title={t('topup.successful_accounts')}>
            <Collapse ghost defaultActiveKey={[successItems[0].key]} items={successItems} />
          </Card>
        )}

        {hasFailures && (
          <Alert
            type="warning"
            showIcon
            message={`${result.totalFailed} ${t('topup.failed').toLowerCase()}`}
            description={t('topup.review_failed_accounts')}
          />
        )}

        {!!failedItems.length && <Collapse items={failedItems} />}
      </Flex>
    </Card>
  )
}

const ManualTopupPage = ({ embedded = false }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
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
                {t('topup.balance')}: {formatCurrencyBasedOnCurrentLanguage(account.balance)}
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
              {t('topup.balance')}: {formatCurrencyBasedOnCurrentLanguage(account.balance)}
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
              {t(
                'topup.selected_count',
                { count: accountIds.length },
                `${accountIds.length} selected`
              )}
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
                  prefix={currencySymbol}
                  size="medium"
                  min={0.01}
                  precision={2}
                  value={topUpAmount}
                  onChange={(value) => {
                    invalidateSubmission()
                    setTopUpAmount(value)
                  }}
                  placeholder="e.g. 100.00"
                  style={{ width: '100%', maxWidth: 300 }}
                  onFocus={selectInputNumberTextOnFocus}
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
