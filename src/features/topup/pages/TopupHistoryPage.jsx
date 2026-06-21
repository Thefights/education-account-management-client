import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, DatePicker, Flex, Input, Select, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const options = (values) => Object.entries(values).map(([label, value]) => ({ label, value }))

const TopupHistoryPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [filters, setFilters] = useState({ search: '', accountNumber: '', sourceTypes: [], statuses: [], dates: null })
  const params = useMemo(() => ({
    page, pageSize, sort: `${sort.key} ${sort.direction}`,
    search: filters.search, accountNumber: filters.accountNumber,
    sourceTypes: filters.sourceTypes, statuses: filters.statuses,
    createdFrom: filters.dates?.[0]?.startOf('day').toISOString(),
    createdTo: filters.dates?.[1]?.endOf('day').toISOString(),
  }), [filters, page, pageSize, sort])
  const history = useFetch(ApiUrls.TOPUP.HISTORY, params, [params])
  const setFilter = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })) }
  const fields = [
    { key: 'executionCode', title: t('topup.execution_code', 'Execution Code'), sortable: true },
    { key: 'sourceType', title: t('topup.source', 'Source'), type: 'tag' },
    { key: 'ruleNameSnapshot', title: t('topup.rule_name') },
    { key: 'status', title: t('topup.status'), type: 'tag' },
    { key: 'totalTargetCount', title: t('topup.total_targets', 'Targets') },
    { key: 'successCount', title: t('topup.succeeded', 'Success') },
    { key: 'failedCount', title: t('topup.failed', 'Failed') },
    { key: 'totalExecutedAmount', title: t('topup.amount') },
    { key: 'createdAt', title: t('topup.created_at'), sortable: true },
    { key: 'actions', title: '', render: (_, row) => <Button type="link" onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(row.id)))}>{t('button.view', 'View')}</Button> },
  ]

  return <Card><Flex vertical gap={16}>
    <Flex justify="space-between" align="center"><Typography.Title level={4}>{t('topup.history_title', 'Top-up Execution History')}</Typography.Title><Button onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX))}>{t('button.back', 'Back')}</Button></Flex>
    <Flex gap={12} wrap="wrap">
      <Input allowClear value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder={t('topup.search_execution', 'Execution code or rule')} style={{ width: 220 }} />
      <Select allowClear mode="multiple" value={filters.sourceTypes} onChange={(v) => setFilter('sourceTypes', v)} options={options(EnumConfig.TopupExecutionSourceTypeId)} placeholder={t('topup.source', 'Source')} style={{ minWidth: 180 }} />
      <Select allowClear mode="multiple" value={filters.statuses} onChange={(v) => setFilter('statuses', v)} options={options(EnumConfig.TopupExecutionStatusId)} placeholder={t('topup.status')} style={{ minWidth: 180 }} />
      <Input allowClear value={filters.accountNumber} onChange={(e) => setFilter('accountNumber', e.target.value)} placeholder={t('topup.account_number', 'Account Number')} style={{ width: 200 }} />
      <DatePicker.RangePicker value={filters.dates} onChange={(v) => setFilter('dates', v)} />
    </Flex>
    <GenericTable data={history.data?.collection} fields={fields} rowKey="id" loading={history.loading} sort={sort} setSort={setSort} />
    <GenericTablePagination totalCount={history.data?.totalCount} totalPage={history.data?.totalPage} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} loading={history.loading} />
  </Flex></Card>
}

export default TopupHistoryPage
