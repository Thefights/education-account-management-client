import { ApiUrls } from '@/shared/api/apiUrls'
import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultSweepActionStyle,
  defaultSweepTargetStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { Card, Col, Row, Space } from 'antd'
import { useMemo, useState } from 'react'

const defaultFilters = { nric: '', statuses: [], actions: [] }

const SweepReportTargetsTable = ({ batchDate }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const [filters, setFilters] = useState(defaultFilters)
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const params = useMemo(
    () => ({ ...filters, page, pageSize }),
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
        placeholder: t('batch_report.search_nric'),
        type: 'search',
        reserveLabelSpace: true,
        required: false,
      },
      {
        key: 'actions',
        title: t('batch_report.action'),
        type: 'multi-check-dropdown',
        options: _enum.sweepActionFilterOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      },
      {
        key: 'statuses',
        title: t('batch_report.status'),
        type: 'multi-check-dropdown',
        options: _enum.sweepTargetStatusFilterOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
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

  const handleReset = () => {
    reset(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
  }

  return (
    <Card size="small" title={t('batch_report.targets')}>
      <Row gutter={[16, 16]} align="bottom" style={{ marginBottom: 16 }}>
        {filterFields.map((field) => (
          <Col xs={24} sm={12} lg={6} key={field.key}>
            {renderField(field)}
          </Col>
        ))}
        <Col xs={24} sm={12} lg={6} style={{ textAlign: 'right' }}>
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
        loading={loading}
      />
    </Card>
  )
}

export default SweepReportTargetsTable
