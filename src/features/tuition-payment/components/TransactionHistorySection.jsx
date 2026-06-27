import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  toPickerValueBasedOnCurrentLanguage,
  wallTimeBasedOnCurrentLanguageToIso,
} from '@/shared/utils/dateTimeUtil'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import {
  formatDatetimeStringBasedOnCurrentLanguage,
  getDateHourFormatBasedOnCurrentLanguage,
} from '@/shared/utils/formatDateUtil'
import { ArrowDownOutlined, ArrowUpOutlined, CalendarOutlined } from '@ant-design/icons'
import { Card, Col, DatePicker, Flex, Form, Row, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const FieldBox = ({ title, children }) => (
  <div>
    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
      {title}
    </Typography.Text>
    {children}
  </div>
)

const defaultFilters = { search: '', types: [], directions: [], createdFrom: '', createdTo: '' }

const TransactionHistorySection = ({ url, pageMode = false }) => {
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
  const typeLabels = useMemo(
    () => ({
      Topup: t('transaction.topup'),
      CourseFee: t('transaction.course_fee'),
      Adjustment: t('transaction.adjustment'),
    }),
    [t]
  )
  const directionLabels = useMemo(
    () => ({
      Credit: t('transaction.credit'),
      Debit: t('transaction.debit'),
    }),
    [t]
  )
  const filterFields = [
    {
      key: 'search',
      title: t('transaction.search'),
      label: t('transaction.search'),
      type: 'search',
      reserveLabelSpace: true,
      required: false,
    },
    {
      key: 'types',
      title: t('transaction.type'),
      type: 'multi-check-dropdown',
      required: false,
      options: ['Topup', 'CourseFee', 'Adjustment'].map((value) => ({
        value,
        label: typeLabels[value],
      })),
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
    {
      key: 'directions',
      title: t('transaction.direction'),
      type: 'multi-check-dropdown',
      required: false,
      options: ['Credit', 'Debit'].map((value) => ({
        value,
        label: directionLabels[value],
      })),
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
  ]
  const fields = useMemo(
    () => [
      { key: 'transactionCode', title: t('transaction.code'), width: 250 },
      { key: 'description', title: t('transaction.description'), width: 240 },
      {
        key: 'type',
        title: t('transaction.type'),
        width: 130,
        sortable: true,
        render: (value) => <Tag>{typeLabels[value] || value}</Tag>,
      },
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
      {
        key: 'amount',
        title: t('transaction.amount'),
        width: 130,
        sortable: true,
        render: (amount, row) => {
          const isCredit = row.direction === 'Credit'
          return (
            <Typography.Text strong type={isCredit ? 'success' : 'danger'}>
              {isCredit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
              {formatCurrencyBasedOnCurrentLanguage(amount, {
                sign: isCredit ? 'credit' : 'debit',
              })}
            </Typography.Text>
          )
        },
      },
      {
        key: 'balanceBefore',
        title: t('transaction.balance_before'),
        width: 150,
        render: formatCurrencyBasedOnCurrentLanguage,
      },
      {
        key: 'balanceAfter',
        title: t('transaction.balance_after'),
        width: 150,
        render: formatCurrencyBasedOnCurrentLanguage,
      },
      {
        key: 'createdAt',
        title: t('transaction.created_at'),
        width: 190,
        sortable: true,
        render: formatDatetimeStringBasedOnCurrentLanguage,
      },
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

  const content = (
    <Card
      title={pageMode ? undefined : t('transaction.title')}
      styles={{ body: { padding: 'clamp(16px, 2vw, 24px)' } }}
    >
      <Flex vertical gap={16}>
        <Card
          size="small"
          style={{ boxShadow: 'none', background: 'var(--app-filter-bg)' }}
          styles={{ body: { padding: 16 } }}
        >
          <Row gutter={[12, 12]} align="bottom">
            {filterFields.map((field) => (
              <Col key={field.key} xs={24} md={6}>
                {renderField(field)}
              </Col>
            ))}
            <Col xs={24} md={6}>
              <FieldBox title={t('transaction.created_at')}>
                <Form.Item style={{ marginBottom: 0 }}>
                  <DatePicker.RangePicker
                    showTime={DATE_HOUR_SHOW_TIME}
                    format={getDateHourFormatBasedOnCurrentLanguage()}
                    value={
                      values.createdFrom
                        ? [
                            toPickerValueBasedOnCurrentLanguage(values.createdFrom),
                            toPickerValueBasedOnCurrentLanguage(values.createdTo),
                          ]
                        : null
                    }
                    onChange={(range) => {
                      setField('createdFrom', wallTimeBasedOnCurrentLanguageToIso(range?.[0]))
                      setField('createdTo', wallTimeBasedOnCurrentLanguageToIso(range?.[1]))
                    }}
                    suffixIcon={<CalendarOutlined />}
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </FieldBox>
            </Col>
            <Col xs={24}>
              <Flex justify="end">
                <Space>
                  <ResetFilterButton
                    loading={transactions.loading}
                    onResetFilterClick={resetFilters}
                  />
                  <FilterButton loading={transactions.loading} onFilterClick={applyFilters} />
                </Space>
              </Flex>
            </Col>
          </Row>
        </Card>
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

  if (!pageMode) return content

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1600, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
        {t('transaction.title')}
      </Typography.Title>
      {content}
    </Flex>
  )
}

export default TransactionHistorySection
