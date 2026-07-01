import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const AdminManagementFilterSection = ({
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

  const adminRoleOptions = useMemo(
    () => _enum.roleOptions.filter((option) => option.value !== EnumConfig.RoleEnum.AccountHolder),
    [_enum.roleOptions]
  )
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: t('admin_management.label.search'),
        label: t('admin_management.label.search'),
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'roles',
        title: t('admin_management.field.role'),
        type: 'multi-check-dropdown',
        options: adminRoleOptions,
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
        title: t('admin_management.field.status'),
        type: 'multi-check-dropdown',
        options: _enum.authAccountStatusOptions,
        required: false,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
      },
      {
        key: 'schoolIds',
        title: t('admin_management.field.school'),
        type: 'multi-check-dropdown',
        options: schoolOptions,
        loading: schoolsLoading,
        placeholder: t('text.all'),
        selectAllText: t('general.select_all'),
        searchPlaceholder: t('general.input_keyword'),
        cancelText: t('general.cancel'),
        okText: t('general.ok'),
        selectedText: (count) => `${count} ${t('text.items')}`,
        required: false,
      },
    ],
    [t, adminRoleOptions, _enum.authAccountStatusOptions, schoolOptions, schoolsLoading]
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

export default AdminManagementFilterSection
