import ActionMenu from '@/shared/components/generals/ActionMenu'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultAuthAccountStatusStyle,
  defaultRoleStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { useMemo } from 'react'

const AdminManagementTableSection = ({
  admins,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onEdit,
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
        key: 'nric',
        title: t('admin_management.field.nric'),
        width: 130,
        sortable: true,
        render: (value) => <MaskedNric value={value} />,
      },
      {
        key: 'phoneNumber',
        title: t('admin_management.field.phone_number'),
        width: 150,
        sortable: true,
      },
      {
        key: 'schoolName',
        title: t('admin_management.field.school'),
        width: 190,
        sortable: true,
      },
      {
        key: 'azureObjectId',
        title: t('admin_management.field.azure_object_id'),
        width: 280,
        sortable: true,
        render: (value) => (
          <MaskedNric value={value} label={t('admin_management.field.azure_object_id')} />
        ),
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
      {
        key: 'createdAt',
        title: t('audit_log.field.created_at'),
        width: 180,
        sortable: true,
        render: formatDatetimeStringBasedOnCurrentLanguage,
      },
      {
        key: 'actions',
        title: '',
        width: 70,
        render: (_, row) => (
          <ActionMenu actions={[{ title: t('button.edit'), onClick: () => onEdit?.(row) }]} />
        ),
      },
    ],
    [t, _enum.authAccountStatusOptions, _enum.roleOptions, onEdit]
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
    />
  )
}

export default AdminManagementTableSection
