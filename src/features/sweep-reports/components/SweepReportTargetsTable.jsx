import { ApiUrls } from '@/shared/api/apiUrls'
import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Card, Col, Flex, Row, Space } from 'antd'
import { useMemo, useState } from 'react'

const defaultFilters = { search: '' }

const SweepReportTargetsTable = ({ batchDate }) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(defaultFilters)
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const params = useMemo(
    () => ({ search: filters.search, page, pageSize }),
    [filters.search, page, pageSize]
  )
  const url = batchDate ? ApiUrls.SWEEP_REPORT.TARGETS(batchDate) : ''
  const { data, loading } = useFetch(url, params, [params], !!batchDate)

  const fields = [
    { key: 'accountNumber', title: t('batch_report.account_number') },
    { key: 'name', title: t('batch_report.name') },
    {
      key: 'createdDate',
      title: t('batch_report.created_date'),
      render: formatDateBasedOnCurrentLanguage,
    },
  ]

  const handleReset = () => {
    reset(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
  }

  return (
    <Card size="small" title={t('batch_report.success_accounts')}>
      <Row gutter={[16, 16]} align="bottom" style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          {renderField({
            key: 'search',
            title: t('batch_report.search_success_accounts'),
            label: t('batch_report.search_success_accounts'),
            type: 'search',
            required: false,
          })}
        </Col>
        <Col xs={24} md={12}>
          <Flex justify="end">
            <Space>
              <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
              <FilterButton
                loading={loading}
                onFilterClick={() => {
                  setFilters(values)
                  setPage(1)
                }}
              />
            </Space>
          </Flex>
        </Col>
      </Row>
      <GenericTable
        data={data?.collection || []}
        fields={fields}
        rowKey="accountNumber"
        loading={loading}
      />
      <GenericTablePagination
        totalCount={data?.totalCount || 0}
        totalPage={data?.totalPage || 0}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        loading={loading}
      />
    </Card>
  )
}

export default SweepReportTargetsTable
