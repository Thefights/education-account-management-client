import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import GenericTable from '@/shared/components/tables/GenericTable'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useEnum from '@/shared/hooks/useEnum'
import useForm from '@/shared/hooks/useForm'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import {
  defaultSweepActionStyle,
  defaultSweepTargetStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import { Card, Col, Row, Space } from 'antd'
import { useMemo, useState } from 'react'
import useTranslation from '@/shared/hooks/useTranslation'

const SweepReportTargetsTable = ({ batchDate }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const defaultFilters = { nric: '', status: '', action: '' }
  const [filters, setFilters] = useState(defaultFilters)
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const params = useMemo(
    () => ({
      nric: filters.nric,
      status: filters.status,
      action: filters.action,
      page,
      pageSize,
    }),
    [filters, page, pageSize]
  )

  const url = batchDate ? ApiUrls.SWEEP_REPORT.TARGETS(batchDate) : ''
  const { data, loading } = useFetch(url, params, [params], !!batchDate)

  const filterFields = useMemo(
    () => [
      {
        key: 'nric',
        title: t('batch_report.search_nric'),
        label: t('batch_report.search_nric'),
        type: 'search',
        placeholder: t('batch_report.search_nric'),
        reserveLabelSpace: true,
        required: false,
      },
      {
        key: 'status',
        title: t('batch_report.status'),
        type: 'select',
        required: false,
        options: [
          { value: '', label: t('batch_report.all_statuses') },
          ..._enum.sweepTargetStatusFilterOptions,
        ],
      },
      {
        key: 'action',
        title: t('batch_report.action'),
        type: 'select',
        required: false,
        options: [
          { value: '', label: t('batch_report.all_actions') },
          ..._enum.sweepActionFilterOptions,
        ],
      },
    ],
    [t, _enum.sweepActionFilterOptions, _enum.sweepTargetStatusFilterOptions]
  )

  const tableFields = useMemo(
    () => [
      {
        key: 'nric',
        title: t('batch_report.nric'),
        width: 150,
        render: (value) => <MaskedNric value={value} code />,
      },
      {
        key: 'action',
        title: t('batch_report.action'),
        width: 120,
        type: 'tag',
        options: _enum.sweepActionOptions,
        color: defaultSweepActionStyle,
      },
      {
        key: 'status',
        title: t('batch_report.status'),
        width: 120,
        type: 'tag',
        options: _enum.sweepTargetStatusOptions,
        color: defaultSweepTargetStatusStyle,
      },
      { key: 'reason', title: t('batch_report.reason') },
    ],
    [t, _enum.sweepActionOptions, _enum.sweepTargetStatusOptions]
  )

  const handleFilter = () => {
    setFilters(values)
    setPage(1)
  }

  const handleReset = () => {
    reset(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
  }

  if (!batchDate) return null

  return (
    <Card size="small" title={t('batch_report.targets')} style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]} align="bottom" style={{ marginBottom: 16 }}>
        {filterFields.map((field) => (
          <Col xs={24} sm={12} lg={6} key={field.key}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} sm={12} lg={6} style={{ textAlign: 'right' }}>
          <Space>
            <ResetFilterButton onResetFilterClick={handleReset} />
            <FilterButton onFilterClick={handleFilter} />
          </Space>
        </Col>
      </Row>
      <GenericTable
        data={data?.collection || []}
        fields={tableFields}
        rowKey="nric"
        loading={loading}
      />
      <GenericTablePagination
        totalCount={data?.totalCount || 0}
        totalPage={data?.totalPage || 0}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </Card>
  )
}

export default SweepReportTargetsTable
