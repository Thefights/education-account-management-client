import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Descriptions, Flex, Input, Select, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const targetStatusOptions = Object.entries(EnumConfig.TopupTargetStatusId).map(([label, value]) => ({ label, value }))

const TopupHistoryDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [accountNumber, setAccountNumber] = useState('')
  const [statuses, setStatuses] = useState([])
  const detail = useFetch(ApiUrls.TOPUP.HISTORY_DETAIL(id), {}, [id])
  const targetParams = useMemo(() => ({ page, pageSize, sort: `${sort.key} ${sort.direction}`, accountNumber, statuses }), [accountNumber, page, pageSize, sort, statuses])
  const targets = useFetch(ApiUrls.TOPUP.HISTORY_TARGETS(id), targetParams, [id, targetParams])
  const data = detail.data
  const fields = [
    { key: 'accountNumber', title: t('topup.account_number', 'Account Number'), sortable: true },
    { key: 'accountName', title: t('topup.account_name', 'Name') },
    { key: 'amount', title: t('topup.amount'), sortable: true },
    { key: 'status', title: t('topup.status'), type: 'tag', color: (value) => value === 'Success' ? 'success' : value === 'Failed' ? 'error' : 'processing' },
    { key: 'failureReason', title: t('topup.failure_reason', 'Failure Reason') },
    { key: 'transactionCode', title: t('topup.transaction_code', 'Transaction Code') },
    { key: 'createdAt', title: t('topup.created_at'), sortable: true },
  ]

  return <Flex vertical gap={16}>
    <Card loading={detail.loading}>
      <Flex justify="space-between" align="center"><Typography.Title level={4}>{data?.executionCode || t('topup.execution_detail', 'Execution Detail')}</Typography.Title><Button onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY))}>{t('button.back', 'Back')}</Button></Flex>
      <Descriptions bordered column={{ xs: 1, md: 2, lg: 3 }}>
        <Descriptions.Item label={t('topup.source', 'Source')}><Tag>{data?.sourceType}</Tag></Descriptions.Item>
        <Descriptions.Item label={t('topup.status')}><Tag>{data?.status}</Tag></Descriptions.Item>
        <Descriptions.Item label={t('topup.rule_name')}>{data?.ruleNameSnapshot}</Descriptions.Item>
        <Descriptions.Item label={t('topup.total_targets', 'Targets')}>{data?.totalTargetCount}</Descriptions.Item>
        <Descriptions.Item label={t('topup.succeeded', 'Success')}>{data?.successCount}</Descriptions.Item>
        <Descriptions.Item label={t('topup.failed', 'Failed')}>{data?.failedCount}</Descriptions.Item>
        <Descriptions.Item label={t('topup.amount')}>{data?.totalExecutedAmount}</Descriptions.Item>
        <Descriptions.Item label={t('topup.reason')}>{data?.manualReason}</Descriptions.Item>
        <Descriptions.Item label={t('topup.created_at')}>{data?.createdAt}</Descriptions.Item>
      </Descriptions>
    </Card>
    <Card>
      <Flex vertical gap={16}>
        <Flex gap={12} wrap="wrap">
          <Input allowClear value={accountNumber} onChange={(e) => { setPage(1); setAccountNumber(e.target.value) }} placeholder={t('topup.account_number', 'Account Number')} style={{ width: 220 }} />
          <Select allowClear mode="multiple" value={statuses} onChange={(v) => { setPage(1); setStatuses(v) }} options={targetStatusOptions} placeholder={t('topup.status')} style={{ minWidth: 200 }} />
        </Flex>
        <GenericTable data={targets.data?.collection} fields={fields} rowKey="id" loading={targets.loading} sort={sort} setSort={setSort} />
        <GenericTablePagination totalCount={targets.data?.totalCount} totalPage={targets.data?.totalPage} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} loading={targets.loading} />
      </Flex>
    </Card>
  </Flex>
}

export default TopupHistoryDetailPage
