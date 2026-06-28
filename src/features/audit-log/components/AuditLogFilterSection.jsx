import FilterButton from '@/shared/components/buttons/FilterButton'
import ResetFilterButton from '@/shared/components/buttons/ResetFilterButton'
import FilterSectionLayout from '@/shared/components/filters/FilterSectionLayout'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Col } from 'antd'
import { useMemo } from 'react'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const AuditLogFilterSection = ({
  filters = {},
  defaultFilters = {},
  onFilter,
  onReset,
  loading = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const { values, handleChange, setField, registerRef, reset, validateAll, resetValidation } =
    useForm(filters)

  const { renderField } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    false,
    'outlined',
    'medium'
  )

  const filterFields = useMemo(
    () => [
      {
        key: 'search',
        title: t('audit_log.placeholder.search_text'),
        type: 'search',
        required: false,
        label: t('audit_log.placeholder.search_text'),
        reserveLabelSpace: true,
      },
      {
        key: 'categories',
        title: t('audit_log.field.category'),
        type: 'multi-check-dropdown',
        options: _enum.auditLogCategoryOptions,
        loading,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        required: false,
      },
      {
        key: 'occurredRange',
        title: t('audit_log.field.created_at'),
        type: 'range-picker',
        valueType: 'language-datetime',
        from: { key: 'occurredFrom' },
        to: { key: 'occurredTo' },
        showTime: DATE_HOUR_SHOW_TIME,
        format: getDateHourFormatBasedOnCurrentLanguage(),
        disallowFutureFrom: true,
        placeholder: [
          t('audit_log.placeholder.created_from'),
          t('audit_log.placeholder.created_to'),
        ],
      },
    ],
    [_enum.auditLogCategoryOptions, loading, t]
  )

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
      actions={
        <>
          <ResetFilterButton loading={loading} onResetFilterClick={handleReset} />
          <FilterButton loading={loading} onFilterClick={handleFilter} />
        </>
      }
    >
      <Col xs={24} md={12} xl={8}>
        {renderField(filterFields[0])}
      </Col>

      <Col xs={24} md={12} xl={5}>
        {renderField(filterFields[1])}
      </Col>

      <Col xs={24} md={12} xl={5}>
        {renderField(filterFields[2])}
      </Col>
    </FilterSectionLayout>
  )
}

export default AuditLogFilterSection
