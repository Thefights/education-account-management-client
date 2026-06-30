import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
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
import { Card } from 'antd'
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
        type: 'search',
        reserveLabelSpace: true,
        required: false,
      },
      {
        key: 'actions',
        title: t('batch_report.action'),
        type: 'multi-check-dropdown',
        options: _enum.sweepActionOptions,
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
        options: _enum.sweepTargetStatusOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      },
    ],
    [t, _enum.sweepActionOptions, _enum.sweepTargetStatusOptions]
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
    setFilters(defaultFilters)
    setPage(1)
  }

  return (
    <Card size="small" title={t('batch_report.targets')}>
      <GenericFilterSection
        fields={filterFields}
        values={values}
        renderField={renderField}
        reset={reset}
        resetValues={defaultFilters}
        onReset={handleReset}
        onFilter={(currentValues) => {
          setFilters(currentValues)
          setPage(1)
        }}
        loading={loading}
        cardProps={false}
        rowProps={{ style: { marginBottom: 16 } }}
        getFieldColProps={() => ({ xs: 24, sm: 12, lg: 6 })}
      />
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
