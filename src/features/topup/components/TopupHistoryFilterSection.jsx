import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Col } from 'antd'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const defaultFilters = {
  search: '',
  sourceTypes: [],
  statuses: [],
  createdFrom: '',
  createdTo: '',
}

const TopupHistoryFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const { values, handleChange, reset, setField, registerRef, validateAll, resetValidation } =
    useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)

  const fields = [
    {
      key: 'search',
      title: t('topup.search_execution'),
      label: t('topup.search_execution'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
    {
      key: 'sourceTypes',
      title: t('topup.source'),
      type: 'multi-check-dropdown',
      options: _enum.topupExecutionSourceTypeOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'multi-check-dropdown',
      options: _enum.topupExecutionStatusOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
    {
      key: 'createdRange',
      title: t('topup.created_at'),
      type: 'range-picker',
      valueType: 'language-datetime',
      from: { key: 'createdFrom' },
      to: { key: 'createdTo' },
      showTime: DATE_HOUR_SHOW_TIME,
      format: getDateHourFormatBasedOnCurrentLanguage(),
      disallowFutureFrom: true,
      colProps: { xs: 24, md: 12, xl: 6 },
    },
  ]

  const handleFilter = () => {
    if (!validateAll()) return
    onFilter?.(values)
  }

  const handleReset = () => {
    reset(defaultFilters)
    resetValidation()
    onReset?.()
  }

  return (
    <FilterSectionLayout
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
        styles: { body: { padding: 16 } },
      }}
      actions={
        <>
          <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
          <FilterButton loading={loading} onFilterClick={handleFilter} />
        </>
      }
    >
        {fields.map((field) => (
          <Col key={field.key} {...field.colProps}>
            {renderField(field)}
          </Col>
        ))}
    </FilterSectionLayout>
  )
}

export default TopupHistoryFilterSection
