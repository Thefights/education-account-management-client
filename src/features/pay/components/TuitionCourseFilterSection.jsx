import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const TuitionCourseFilterSection = ({
  filters,
  onFilter,
  onReset,
  schoolOptions,
  schoolsLoading,
  loading = false,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    false,
    'outlined',
    'medium'
  )

  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: 'Search',
        label: 'Search',
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: t('admin_management.field.status'),
        type: 'multi-check-dropdown',
        options: _enum.studentTuitionFilterStatusOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      }
    ],
    [t, _enum.studentTuitionFilterStatusOptions, schoolOptions, schoolsLoading]
  )

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={{ search: '', roles: [], statuses: [], schoolIds: [] }}
      onReset={onReset}
      onFilter={onFilter}
      loading={loading}
    />
  )
}

export default TuitionCourseFilterSection
