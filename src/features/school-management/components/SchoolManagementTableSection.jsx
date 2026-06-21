import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultManagementStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'

const SchoolManagementTableSection = ({
  schools,
  loading,
  sort,
  setSort,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'id',
      title: t('school_management.field.id'),
      width: 80,
      sortable: true,
      fixedColumn: true,
    },
    {
      key: 'schoolName',
      title: t('school_management.field.school_name'),
      width: 220,
      sortable: true,
    },
    {
      key: 'status',
      title: t('school_management.field.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.schoolStatusOptions,
      color: defaultManagementStatusStyle,
    },
    { key: 'address', title: t('school_management.field.address'), width: 300 },
    {
      key: 'phoneNumber',
      title: t('school_management.field.phone_number'),
      width: 160,
      sortable: true,
    },
    { key: 'email', title: t('school_management.field.email'), width: 240, sortable: true },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => (
        <ActionMenu
          actions={[
            { title: t('button.edit'), onClick: () => onEdit(row) },
            { title: t('button.delete'), onClick: () => onDelete(row) },
          ]}
        />
      ),
    },
  ]

  return (
    <GenericTable
      data={schools}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
    />
  )
}

export default SchoolManagementTableSection
