import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const defaultFilters = {
  Year: new Date().getFullYear(),
  Search: '',
  Statuses: [],
}

const TuitionFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { t } = useTranslation()
  const { studentTuitionFilterStatusOptions } = useEnum()
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
        key: 'Year',
        title: t('tuition-payment.filter.year'),
        label: t('tuition-payment.filter.year'),
        type: 'select',
        options: Array.from({ length: 81 }, (_, index) => ({
          value: 2100 - index,
          label: String(2100 - index),
        })),
        required: true,
      },
      {
        key: 'Search',
        title: t('tuition-payment.filter.search_label'),
        label: t('tuition-payment.filter.search_label'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'Statuses',
        title: t('tuition-payment.filter.status'),
        label: t('tuition-payment.filter.status'),
        type: 'multi-check-dropdown',
        options: studentTuitionFilterStatusOptions,
        loading,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        required: false,
      },
    ],
    [loading, studentTuitionFilterStatusOptions, t]
  )

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
      getFieldColProps={() => ({ xs: 24, md: 8 })}
    />
  )
}

export default TuitionFilterSection
