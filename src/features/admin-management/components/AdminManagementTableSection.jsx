import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultAuthAccountStatusStyle,
  defaultRoleStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { useMemo } from 'react'

const AdminManagementTableSection = ({
  admins,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDetail,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = useMemo(
    () => [
      {
        key: 'staffCode',
        title: t('admin_management.field.staff_code'),
        width: 140,
        sortable: true,
      },
      {
        key: 'fullName',
        title: t('admin_management.field.full_name'),
        width: 190,
        sortable: true,
      },
      {
        key: 'email',
        title: t('admin_management.field.email'),
        width: 230,
        sortable: true,
      },
      {
        key: 'role',
        title: t('admin_management.field.role'),
        width: 150,
        sortable: true,
        type: 'tag',
        options: _enum.roleOptions,
        color: defaultRoleStyle,
      },
      {
        key: 'status',
        title: t('admin_management.field.status'),
        width: 120,
        sortable: true,
        type: 'tag',
        options: _enum.authAccountStatusOptions,
        color: defaultAuthAccountStatusStyle,
      },
    ],
    [t, _enum.authAccountStatusOptions, _enum.roleOptions]
  )

  return (
    <GenericTable
      data={admins}
      fields={fields}
      rowKey="userId"
      loading={loading}
      sort={sort}
      setSort={setSort}
      canSelectRows
      selectedRows={selectedIds}
      setSelectedRows={setSelectedIds}
      onRowClick={onDetail}
    />
  )
}

export default AdminManagementTableSection
