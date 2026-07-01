import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import { useMemo } from 'react'

const emptyFasApplicationQueueFilters = {
  search: '',
  statuses: [],
  submittedFrom: '',
  submittedTo: '',
}

const FasApplicationQueueFilterSection = ({ filters, loading, onFilter, onReset }) => {
  const { fasApplicationStatusOptions } = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(filters)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: 'Search by application number, account number, account name, or scheme name',
        label: 'Search by application number, account number, account name, or scheme name',
        type: 'search',
        required: false,
        reserveLabelSpace: true,
        colProps: { xs: 24, lg: 12 },
      },
      {
        key: 'statuses',
        title: 'Status',
        type: 'multi-check-dropdown',
        options: fasApplicationStatusOptions,
        required: false,
        placeholder: 'All',
        selectAllText: 'Select all',
        searchPlaceholder: 'Input keyword',
        cancelText: 'Cancel',
        okText: 'OK',
        selectedText: (count) => `${count} items`,
        colProps: { xs: 24, sm: 12, lg: 5 },
      },
      {
        key: 'submittedRange',
        title: 'Submitted date',
        type: 'range-picker',
        required: false,
        from: { key: 'submittedFrom' },
        to: { key: 'submittedTo' },
        placeholder: ['From date', 'To date'],
        colProps: { xs: 24, sm: 12, lg: 7 },
      },
    ],
    [fasApplicationStatusOptions]
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
