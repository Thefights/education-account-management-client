import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const EServiceAccountsFilterSection = ({ filters, onFilter, onReset }) => {
  const { t } = useTranslation()
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
        title: t('education_account.search'),
        label: t('education_account.search_label'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: t('education_account.status'),
        type: 'multi-check-dropdown',
        required: false,
        options: [
          { value: 'Active', label: t('education_account.active') },
          { value: 'Extended', label: t('education_account.extended') },
          { value: 'Closed', label: t('education_account.inactive') },
        ],
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      },
    ],
    [t]
  )

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={{ search: '', statuses: [] }}
      onReset={onReset}
      onFilter={onFilter}
      cardProps={{
        style: { boxShadow: 'none', background: 'var(--app-filter-bg, #f8fbfe)' },
        styles: { body: { padding: 16 } },
      }}
      getFieldColProps={(_, index) => (index === 0 ? { xs: 24, md: 16 } : { xs: 24, md: 8 })}
    />
  )
}

export default EServiceAccountsFilterSection
