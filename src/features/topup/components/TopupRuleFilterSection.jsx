import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'

const defaultFilters = { name: '', statuses: [] }

const TopupRuleFilterSection = ({ filters, loading, onFilter, onReset }) => {
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
      placeholder: 'e.g. Student Support Top-up 2026',
      reserveLabelSpace: true,
    },
    {
      key: 'statuses',
      title: t('topup.status'),
      type: 'multi-check-dropdown',
      options: _enum.systemTopupStatusOptions,
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
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={defaultFilters}
      onReset={onReset}
      onFilter={onFilter}
      loading={loading}
      getFieldColProps={() => ({ xs: 24, md: 12 })}
    />
  )
}

export default TopupRuleFilterSection
