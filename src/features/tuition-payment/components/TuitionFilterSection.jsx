import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const defaultFilters = {
  Search: '',
  Status: EnumConfig.StudentTuitionFilterStatus.All,
  Sort: 'createdAt desc',
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
        key: 'Search',
        title: t('tuition-payment.filter.search_label'),
        label: t('tuition-payment.filter.search_label'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'Status',
        title: t('tuition-payment.filter.status'),
        label: t('tuition-payment.filter.status'),
        type: 'select',
        options: [
          {
            value: EnumConfig.StudentTuitionFilterStatus.All,
            label: t('tuition-payment.status.All'),
          },
          ...studentTuitionFilterStatusOptions,
        ],
        required: false,
      },
      {
        key: 'Sort',
        title: t('tuition-payment.filter.sort'),
        label: t('tuition-payment.filter.sort'),
        type: 'select',
        options: [
          { value: 'createdAt desc', label: t('tuition-payment.filter.newest') },
          { value: 'createdAt asc', label: t('tuition-payment.filter.oldest') },
        ],
        required: false,
      },
    ],
    [studentTuitionFilterStatusOptions, t]
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
