import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { defaultEducationCreditTransactionDirectionStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getEnumLabelByValue } from '@/shared/utils/handleStringUtil'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Flex, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'

const defaultFilters = { search: '', types: [], directions: [], createdFrom: '', createdTo: '' }

const TransactionHistorySection = ({ url, pageMode = false }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
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
      options: _enum.educationCreditTransactionTypeOptions,
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
      options: _enum.educationCreditTransactionDirectionOptions,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
    {
      key: 'createdRange',
      title: t('transaction.created_at'),
      type: 'range-picker',
      valueType: 'language-datetime',
      from: { key: 'createdFrom' },
      to: { key: 'createdTo' },
      placeholder: ['From date', 'To date'],
    },
  ]
  const fields = useMemo(
    () => [
      { key: 'transactionCode', title: t('transaction.code'), width: 250, sortable: true },
      { key: 'description', title: t('transaction.description'), width: 240, sortable: true },
      {
        key: 'type',
        title: t('transaction.type'),
        width: 130,
        sortable: true,
        render: (value) => (
          <Tag>
            {getEnumLabelByValue(_enum.educationCreditTransactionTypeOptions, value) || value}
          </Tag>
        ),
      },
      {
        key: 'direction',
        title: t('transaction.direction'),
        width: 110,
        sortable: true,
        render: (value) => (
          <Tag color={defaultEducationCreditTransactionDirectionStyle(value)}>
            {getEnumLabelByValue(_enum.educationCreditTransactionDirectionOptions, value) || value}
          </Tag>
        ),
      },
      {
        key: 'amount',
        title: t('transaction.amount'),
        width: 130,
        sortable: true,
        render: (amount, row) => {
          const isIncreased =
            row.direction === EnumConfig.EducationCreditTransactionDirection.Increased
          const isDecreased =
            row.direction === EnumConfig.EducationCreditTransactionDirection.Decreased
          const sign = isIncreased ? 'credit' : isDecreased ? 'debit' : undefined
          return (
            <Typography.Text
              strong
              type={isIncreased ? 'success' : isDecreased ? 'danger' : undefined}
            >
              {isIncreased && <ArrowUpOutlined />}
              {isDecreased && <ArrowDownOutlined />}
              {(isIncreased || isDecreased) && ' '}
              {formatCurrencyBasedOnCurrentLanguage(amount, { sign })}
            </Typography.Text>
          )
        },
      },
      {
        key: 'balanceBefore',
        title: t('transaction.balance_before'),
        width: 150,
        sortable: true,
        render: formatCurrencyBasedOnCurrentLanguage,
      },
      {
        key: 'balanceAfter',
        title: t('transaction.balance_after'),
        width: 150,
        sortable: true,
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
    [
      t,
      _enum.educationCreditTransactionDirectionOptions,
      _enum.educationCreditTransactionTypeOptions,
    ]
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
        <GenericFilterSection
          fields={filterFields}
          values={values}
          renderField={renderField}
          reset={reset}
          onFilter={applyFilters}
          onReset={resetFilters}
          loading={transactions.loading}
          getFieldColProps={() => ({ xs: 24, md: 6 })}
          gutter={[12, 12]}
          cardProps={{
            style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
            styles: { body: { padding: 16 } },
          }}
        />
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
