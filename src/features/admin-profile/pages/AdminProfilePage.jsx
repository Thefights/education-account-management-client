import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import {
  defaultAuthAccountStatusStyle,
  defaultRoleStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getEnumLabelByValue, renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { Tag } from 'antd'
import { useMemo } from 'react'

const AdminProfilePage = () => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const profile = useFetch(ApiUrls.ADMIN_PROFILE.CURRENT)
  const admin = profile.data

  const roleLabel = getEnumLabelByValue(_enum.roleOptions, admin?.role) || admin?.role
  const statusLabel =
    getEnumLabelByValue(_enum.authAccountStatusOptions, admin?.status) || admin?.status

  const fields = useMemo(
    () => [
      {
        key: 'staffCode',
        label: t('admin_management.field.staff_code'),
      },
      {
        key: 'fullName',
        label: t('admin_management.field.full_name'),
      },
      {
        key: 'email',
        label: t('admin_management.field.email'),
      },
      {
        key: 'role',
        label: t('admin_management.field.role'),
        render: (value) =>
          value ? (
            <Tag color={defaultRoleStyle(value)}>{roleLabel}</Tag>
          ) : (
            renderEmptyFallback(null)
          ),
      },
      {
        key: 'status',
        label: t('admin_management.field.status'),
        render: (value) =>
          value ? (
            <Tag color={defaultAuthAccountStatusStyle(value)}>{statusLabel}</Tag>
          ) : (
            renderEmptyFallback(null)
          ),
      },
      {
        key: 'nric',
        label: t('admin_management.field.nric'),
        render: (value) => <MaskedNric value={value} />,
      },
      {
        key: 'phoneNumber',
        label: t('admin_management.field.phone_number'),
      },
      {
        key: 'schoolName',
        label: t('admin_management.field.school'),
      },
      {
        key: 'azureObjectId',
        label: t('admin_management.field.azure_object_id'),
        render: (value) => (
          <MaskedNric value={value} label={t('admin_management.field.azure_object_id')} code />
        ),
      },
      {
        key: 'createdAt',
        label: t('audit_log.field.created_at'),
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [roleLabel, statusLabel, t]
  )

  return (
    <GenericDetail
      title={t('admin_management.title.profile')}
      data={admin}
      fields={fields}
      loading={profile.loading}
    />
  )
}

export default AdminProfilePage
