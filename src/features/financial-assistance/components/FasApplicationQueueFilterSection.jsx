import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const emptyFasApplicationQueueFilters = {
  search: '',
  statuses: [],
  submittedFrom: '',
  submittedTo: '',
}

const FasApplicationQueueFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { fasAdminApplicationStatusOptions } = useEnum()
  const { t } = useTranslation()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('financial_assistance.admin.application_queue.search_label'),
        label: t('financial_assistance.admin.application_queue.search_label'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
        colProps: { xs: 24, lg: 12 },
      },
      {
        key: 'statuses',
        title: t('financial_assistance.field.status'),
        type: 'multi-check-dropdown',
        options: fasAdminApplicationStatusOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        colProps: { xs: 24, sm: 12, lg: 5 },
      },
      {
        key: 'submittedRange',
        title: t('financial_assistance.field.submitted_date'),
        type: 'range-picker',
        required: false,
        from: { key: 'submittedFrom' },
        to: { key: 'submittedTo' },
        placeholder: [
          t('financial_assistance.placeholder.from_date'),
          t('financial_assistance.placeholder.to_date'),
        ],
        colProps: { xs: 24, sm: 12, lg: 7 },
      },
    ],
    [fasAdminApplicationStatusOptions, t]
  )

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={emptyFasApplicationQueueFilters}
      onReset={onReset}
      onFilter={onFilter}
      loading={loading}
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg)' },
        styles: { body: { padding: 16 } },
      }}
    />
  )
}

export default FasApplicationQueueFilterSection
