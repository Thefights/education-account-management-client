import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { useMemo } from 'react'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const ManagementActionLogManagementFilterSection = ({
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
        title: t('management_action_log.placeholder.search_text'),
        type: 'search',
        required: false,
        label: t('management_action_log.placeholder.search_text'),
        placeholder: t('management_action_log.placeholder.search_text'),
        reserveLabelSpace: true,
      },
      {
        key: 'entityTypes',
        title: t('management_action_log.field.entity_type'),
        type: 'multi-check-dropdown',
        options: _enum.managementActionEntityTypeOptions,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        required: false,
      },
      {
        key: 'actions',
        title: t('management_action_log.field.action'),
        type: 'multi-check-dropdown',
        options: _enum.managementActionOptions,
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
        title: t('management_action_log.field.occurred_at'),
        type: 'range-picker',
        valueType: 'language-datetime',
        from: { key: 'occurredFrom' },
        to: { key: 'occurredTo' },
        showTime: DATE_HOUR_SHOW_TIME,
        format: getDateHourFormatBasedOnCurrentLanguage(),
        disallowFutureFrom: true,
        placeholder: [
          t('management_action_log.placeholder.occurred_from'),
          t('management_action_log.placeholder.occurred_to'),
        ],
      },
    ],
    [_enum.managementActionEntityTypeOptions, _enum.managementActionOptions, t]
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
      getFieldColProps={() => ({ xs: 24, md: 12, xl: 6 })}
    />
  )
}

export default ManagementActionLogManagementFilterSection
