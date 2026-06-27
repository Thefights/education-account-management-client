import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'

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
      reserveLabelSpace: true,
    },
    {
      key: 'frequencies',
      title: t('topup.schedule_type'),
      type: 'multi-check-dropdown',
      options: _enum.scheduleTopupFrequencyIdOptions,
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
      title: t('topup.status'),
      type: 'multi-check-dropdown',
      options: _enum.scheduleTopupStatusIdOptions,
      required: false,
      placeholder: t('text.all'),
      selectAllText: t('general.select_all'),
      searchPlaceholder: t('general.input_keyword'),
      cancelText: t('general.cancel'),
      okText: t('general.ok'),
      selectedText: (count) => `${count} ${t('text.items')}`,
    },
  ]
  return (
    <div
      style={{
        padding: '12px 0',
        borderTop: '1px solid var(--app-border-color)',
        borderBottom: '1px solid var(--app-border-color)',
      }}
    >
      <GenericFilterSection
        fields={fields}
        values={values}
        renderField={renderField}
        reset={reset}
        resetValues={defaultFilters}
        onReset={onReset}
        onFilter={onFilter}
        loading={loading}
        cardProps={false}
        getFieldColProps={() => ({ xs: 24, md: 8 })}
      />
    </div>
  )
}

export default TopupScheduleFilterSection
