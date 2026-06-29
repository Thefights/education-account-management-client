import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { useMemo } from 'react'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const AuditLogManagementFilterSection = ({
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
    [_enum.auditLogCategoryOptions, t]
  )

  const handleFilter = (nextValues) => {
    if (!validateAll()) return
    onFilter?.(nextValues)
  }

  const handleReset = () => {
    resetValidation()
    onReset?.()
  }

  return (
    <GenericFilterSection
      fields={filterFields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={defaultFilters}
      onReset={handleReset}
      onFilter={handleFilter}
      loading={loading}
      getFieldColProps={() => ({ xs: 24, md: 12, xl: 8 })}
    />
  )
}

export default AuditLogManagementFilterSection
