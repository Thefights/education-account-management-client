import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'

const defaultFilters = { dateFrom: '', dateTo: '' }

const SweepReportFilterSection = ({ dateRange, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const { values, handleChange, reset, setField, registerRef, validateAll, resetValidation } =
    useForm(dateRange || defaultFilters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const handleReset = () => {
    const resetDateRange = onReset?.()
    reset(resetDateRange || defaultFilters)
    resetValidation()
  }

  const handleFilter = () => {
    if (!validateAll()) return
    onFilter?.(values.dateFrom && values.dateTo ? values : defaultFilters)
  }

  const fields = [
    {
      key: 'batchDateRange',
      title: t('batch_report.batch_date'),
      type: 'range-picker',
      from: { key: 'dateFrom' },
      to: { key: 'dateTo' },
      required: false,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
  ]

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      onFilter={handleFilter}
      onReset={handleReset}
      loading={loading}
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
        styles: { body: { padding: 16 } },
      }}
    />
  )
}

export default SweepReportFilterSection
