import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import {
  defaultAuthAccountStatusStyle,
  defaultRoleStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useApiOptions from '@/shared/hooks/useApiOptions'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { getEnumLabelByValue, renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { EditOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminManagementFormSection from '../components/AdminManagementFormSection'

const AdminManagementDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const _enum = useEnum()
  const [openUpdate, setOpenUpdate] = useState(false)
  const detail = useFetch(ApiUrls.ADMIN_MANAGEMENT.DETAIL(id))
  const admin = detail.data
  const schools = useApiOptions({
    url: ApiUrls.SCHOOL_MANAGEMENT.GET_ALL,
    valueKey: 'id',
    labelKey: 'schoolName',
  })
  const updateAdmin = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.DETAIL(id),
    method: 'PUT',
  })

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
    <>
      <GenericDetail
        title={t('admin_management.title.detail')}
        data={admin}
        fields={fields}
        loading={detail.loading}
        onBack={() => navigate(-1)}
        extra={
          <Button
            icon={<EditOutlined />}
            disabled={!admin}
            loading={updateAdmin.loading}
            onClick={() => setOpenUpdate(true)}
          >
            {t('button.update')}
          </Button>
        }
      />
      <AdminManagementFormSection
        openCreate={false}
        setOpenCreate={() => {}}
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        selectedRow={admin || {}}
        onCreateSubmit={async () => undefined}
        onUpdateSubmit={updateAdmin.submit}
        refetch={detail.fetch}
        schoolOptions={schools.options}
        schoolsLoading={schools.loading}
      />
    </>
  )
}

export default AdminManagementDetailPage
