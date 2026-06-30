import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'

const emptyFilters = { search: '', statuses: [] }

const SchoolManagementFilterSection = ({ filters, onFilter, onReset, loading }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = [
    {
      key: 'search',
      title: t('school_management.label.search'),
      label: t('school_management.label.search'),
      type: 'search',
      required: false,
      reserveLabelSpace: true,
    },
    {
      key: 'statuses',
      title: t('school_management.field.status'),
      type: 'multi-check-dropdown',
      options: _enum.schoolStatusOptions,
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
      resetValues={emptyFilters}
      onReset={onReset}
      onFilter={onFilter}
      loading={loading}
      getFieldColProps={() => ({ xs: 24, md: 12 })}
    />
  )
}

export default SchoolManagementFilterSection
