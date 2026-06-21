import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Card, Col, DatePicker, Flex, Form, Input, Row, Select, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDateToLongUS } from '@/shared/utils/formatDateUtil'

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
    { key: 'executionCode', title: t('topup.execution_code'), sortable: true },
    { key: 'sourceType', title: t('topup.source'), type: 'tag' },
    { key: 'ruleNameSnapshot', title: t('topup.rule_name') },
    { key: 'status', title: t('topup.status'), type: 'tag' },
    { key: 'totalTargetCount', title: t('topup.total_targets') },
    { key: 'successCount', title: t('topup.succeeded') },
    { key: 'failedCount', title: t('topup.failed') },
    { key: 'totalExecutedAmount', title: t('topup.amount') },
    { key: 'createdAt', title: t('topup.created_at'), sortable: true, render: formatDateToLongUS },
    { key: 'actions', title: '', render: (_, row) => <Button type="link" onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(row.id)))}>{t('button.view')}</Button> },
  ]

  return <Card><Flex vertical gap={16}>
    <Flex justify="space-between" align="center"><Typography.Title level={4}>{t('topup.history_title')}</Typography.Title><Button onClick={() => navigate(routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX))}>{t('button.back')}</Button></Flex>
    <Card size="small">
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={5}>
          <Form.Item label={t('topup.search_execution')} style={{ marginBottom: 0 }}>
            <Input allowClear value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder={t('topup.search_execution')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item label={t('topup.source')} style={{ marginBottom: 0 }}>
            <Select allowClear mode="multiple" value={filters.sourceTypes} onChange={(v) => setFilter('sourceTypes', v)} options={options(EnumConfig.TopupExecutionSourceTypeId)} placeholder={t('text.all')} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item label={t('topup.status')} style={{ marginBottom: 0 }}>
            <Select allowClear mode="multiple" value={filters.statuses} onChange={(v) => setFilter('statuses', v)} options={options(EnumConfig.TopupExecutionStatusId)} placeholder={t('text.all')} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={5}>
          <Form.Item label={t('topup.account_number')} style={{ marginBottom: 0 }}>
            <Input allowClear value={filters.accountNumber} onChange={(e) => setFilter('accountNumber', e.target.value)} placeholder={t('topup.account_number')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label={t('topup.created_at')} style={{ marginBottom: 0 }}>
            <DatePicker.RangePicker value={filters.dates} onChange={(v) => setFilter('dates', v)} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
    <GenericTable data={history.data?.collection} fields={fields} rowKey="id" loading={history.loading} sort={sort} setSort={setSort} />
    <GenericTablePagination totalCount={history.data?.totalCount} totalPage={history.data?.totalPage} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} loading={history.loading} />
  </Flex></Card>
}

export default TopupHistoryPage
