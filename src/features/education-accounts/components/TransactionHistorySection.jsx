import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Col, DatePicker, Flex, Row, Space, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

const defaultFilters = { search: '', type: '', direction: '', createdFrom: '', createdTo: '' }

const TransactionHistorySection = ({ url }) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const params = useMemo(
    () => ({ ...filters, sort: `${sort.key} ${sort.direction}`, page, pageSize }),
    [filters, page, pageSize, sort]
  )
  const transactions = useFetch(url, params, [params])
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const typeLabels = useMemo(() => ({
    Topup: t('transaction.topup'),
    CourseFee: t('transaction.course_fee'),
    Refund: t('transaction.refund'),
    Adjustment: t('transaction.adjustment'),
    Interest: t('transaction.interest'),
  }), [t])
  const directionLabels = useMemo(() => ({
    Credit: t('transaction.credit'),
    Debit: t('transaction.debit'),
  }), [t])
  const filterFields = [
    { key: 'search', title: t('transaction.search'), type: 'search', required: false },
    {
      key: 'type',
      title: t('transaction.type'),
      type: 'select',
      required: false,
      options: ['', 'Topup', 'CourseFee', 'Refund', 'Adjustment', 'Interest'].map((value) => ({
        value,
        label: value ? typeLabels[value] : t('text.all'),
      })),
    },
    {
      key: 'direction',
      title: t('transaction.direction'),
      type: 'select',
      required: false,
      options: ['', 'Credit', 'Debit'].map((value) => ({
        value,
        label: value ? directionLabels[value] : t('text.all'),
      })),
    },
  ]
  const fields = useMemo(
    () => [
      { key: 'transactionCode', title: t('transaction.code'), width: 250 },
      {
        key: 'type',
        title: t('transaction.type'),
        width: 130,
        sortable: true,
        render: (value) => <Tag>{typeLabels[value] || value}</Tag>,
      },
      { key: 'description', title: t('transaction.description'), width: 240 },
      {
        key: 'amount',
        title: t('transaction.amount'),
        width: 130,
        sortable: true,
        render: (amount, row) => {
          const isCredit = row.direction === 'Credit'
          return (
            <Typography.Text strong type={isCredit ? 'success' : 'danger'}>
              {isCredit ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {isCredit ? '+' : '-'}
              {Number(amount).toFixed(2)}
            </Typography.Text>
          )
        },
      },
      { key: 'balanceBefore', title: t('transaction.balance_before'), width: 140 },
      { key: 'balanceAfter', title: t('transaction.balance_after'), width: 140 },
      {
        key: 'direction',
        title: t('transaction.direction'),
        width: 110,
        render: (value) => (
          <Tag color={value === 'Credit' ? 'success' : 'error'}>
            {directionLabels[value] || value}
          </Tag>
        ),
      },
      { key: 'createdAt', title: t('transaction.created_at'), width: 190, sortable: true },
    ],
    [t, typeLabels, directionLabels]
  )
  const applyFilters = () => {
    setFilters(values)
    setPage(1)
  }
  const resetFilters = () => {
    reset(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
  }

  return (
    <Card title={t('transaction.title')}>
      <Flex vertical gap={16}>
        <Row gutter={[12, 12]} align="bottom">
          {filterFields.map((field) => (
            <Col key={field.key} xs={24} md={6}>{renderField(field)}</Col>
          ))}
          <Col xs={24} md={6}>
            <DatePicker.RangePicker
              showTime
              value={values.createdFrom ? [dayjs(values.createdFrom), dayjs(values.createdTo)] : null}
              onChange={(range) => {
                setField('createdFrom', range?.[0]?.toISOString() || '')
                setField('createdTo', range?.[1]?.toISOString() || '')
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24}>
            <Flex justify="end"><Space>
              <ResetFilterButton loading={transactions.loading} onResetFilterClick={resetFilters} />
              <FilterButton loading={transactions.loading} onFilterClick={applyFilters} />
            </Space></Flex>
          </Col>
        </Row>
        <GenericTable
          data={transactions.data?.collection}
          fields={fields}
          rowKey="transactionCode"
          loading={transactions.loading}
          sort={sort}
          setSort={setSort}
        />
        <GenericTablePagination
          totalCount={transactions.data?.totalCount}
          totalPage={transactions.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={transactions.loading}
        />
      </Flex>
    </Card>
  )
}

export default TransactionHistorySection
