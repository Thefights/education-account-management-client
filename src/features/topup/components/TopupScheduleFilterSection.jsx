import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getDateHourFormatBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'

const DATE_HOUR_SHOW_TIME = { format: 'HH', showMinute: false, showSecond: false }

const defaultFilters = { name: '', frequencies: [], statuses: [], createdFrom: '', createdTo: '' }

const TopupScheduleFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, reset, setField, registerRef } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'name',
      title: t('topup.search_topup'),
      label: t('topup.search_topup'),
      type: 'search',
      required: false,
      placeholder: 'Search...',
      reserveLabelSpace: true,
    },
    {
      key: 'frequencies',
      title: t('topup.schedule_type'),
      type: 'multi-check-dropdown',
      options: _enum.scheduleTopupFrequencyOptions,
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
      options: _enum.scheduleTopupStatusOptions,
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
      placeholder: ['From date', 'To date'],
      colProps: { xs: 24, md: 12, xl: 6 },
    },
  ]
  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={defaultFilters}
      onReset={onReset}
      onFilter={onFilter}
      loading={loading}
      getFieldColProps={() => ({ xs: 24, md: 12, xl: 6 })}
    />
  )
}

export default TopupScheduleFilterSection
