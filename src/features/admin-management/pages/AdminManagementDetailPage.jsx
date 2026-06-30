import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import NricInput from '@/shared/components/textFields/NricInput'
import { EnumConfig } from '@/shared/config/enumConfig'
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
import { isEmail, maxLen } from '@/shared/utils/validateUtil'
import { Tag } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const AdminManagementDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const _enum = useEnum()
  const detail = useFetch(ApiUrls.ADMIN_MANAGEMENT.DETAIL(id))
  const updateAdmin = useAxiosSubmit({
    url: ApiUrls.ADMIN_MANAGEMENT.DETAIL(id),
    method: 'PUT',
  })
  const schools = useApiOptions({
    url: ApiUrls.SCHOOL_MANAGEMENT.GET_ALL,
    valueKey: 'id',
    labelKey: 'schoolName',
  })
  const admin = detail.data

  const roleLabel = getEnumLabelByValue(_enum.roleOptions, admin?.role) || admin?.role
  const statusLabel =
    getEnumLabelByValue(_enum.authAccountStatusOptions, admin?.status) || admin?.status
  const initialValues = useMemo(
    () => ({
      role: admin.role,
      azureObjectId: admin.azureObjectId,
      fullName: admin.fullName,
      nric: admin.nric,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      schoolId: admin.schoolId ?? renderEmptyFallback(null),
      staffCode: admin.staffCode,
      statusDisplay: statusLabel,
      schoolName: admin?.schoolName ?? renderEmptyFallback(null),
      createdAtDisplay: formatDatetimeStringBasedOnCurrentLanguage(admin?.createdAt) ?? '',
    }),
    [admin, statusLabel]
  )
  const adminRoleOptions = useMemo(
    () => _enum.roleIdOptions.filter((option) => option.value !== EnumConfig.RoleId.AccountHolder),
    [_enum.roleIdOptions]
  )
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

  const getEditableFields = ({ values }) => [
    {
      key: 'role',
      title: t('admin_management.field.role'),
      type: 'select',
      options: adminRoleOptions,
      placeholder: 'Select a role',
    },
    {
      key: 'azureObjectId',
      title: t('admin_management.field.azure_object_id'),
      placeholder: 'e.g. 00000000-0000-0000-0000-000000000000',
      validate: [maxLen(256)],
    },
    {
      key: 'fullName',
      title: t('admin_management.field.full_name'),
      placeholder: 'e.g. Tan Wei Ming',
      validate: [maxLen(150)],
    },
    {
      key: 'nric',
      title: t('admin_management.field.nric'),
      type: 'custom',
      render: ({ value, onChange }) => (
        <NricInput value={value} onChange={onChange} placeholder="e.g. S1234567D" />
      ),
      validate: [maxLen(9)],
    },
    {
      key: 'email',
      title: t('admin_management.field.email'),
      type: 'email',
      placeholder: 'e.g. admin@example.com',
      validate: [isEmail(), maxLen(320)],
    },
    {
      key: 'phoneNumber',
      title: t('admin_management.field.phone_number'),
      type: 'phone',
      placeholder: 'e.g. 91234567',
    },
    ...(values.role === EnumConfig.RoleId.SchoolAdmin
      ? [
          {
            key: 'schoolId',
            title: t('admin_management.field.school'),
            type: 'select',
            options: schools.options,
            placeholder: 'Select a school',
            props: {
              loading: schools.loading,
              showSearch: true,
              allowClear: true,
              optionFilterProp: 'label',
            },
            required: true,
          },
        ]
      : []),
  ]

  const getDisabledFields = ({ values }) => [
    {
      key: 'staffCode',
      title: t('admin_management.field.staff_code'),
      required: false,
      props: { disabled: true },
    },
    {
      key: 'statusDisplay',
      title: t('admin_management.field.status'),
      required: false,
      props: { disabled: true },
    },
    ...(values.role !== EnumConfig.RoleId.SchoolAdmin
      ? [
          {
            key: 'schoolName',
            title: t('admin_management.field.school'),
            required: false,
            props: { disabled: true },
          },
        ]
      : []),
    {
      key: 'createdAtDisplay',
      title: t('audit_log.field.created_at'),
      required: false,
      props: { disabled: true },
    },
  ]

  const handleSave = async ({ values }) => {
    const response = await updateAdmin.submit({
      overrideData: {
        role: values.role,
        azureObjectId: values.azureObjectId,
        fullName: values.fullName,
        nric: values.nric,
        email: values.email,
        phoneNumber: values.phoneNumber,
        schoolId:
          values.role === EnumConfig.RoleId.SchoolAdmin &&
          values.schoolId !== '' &&
          values.schoolId != null
            ? Number(values.schoolId)
            : null,
      },
    })
    if (!response) return false

    await detail.fetch()
    return true
  }

  return (
    <GenericDetail
      title={t('admin_management.title.detail')}
      data={admin}
      fields={fields}
      loading={detail.loading}
      onBack={() => navigate(-1)}
      edit={{
        initialValues,
        fields: getEditableFields,
        disabledFields: getDisabledFields,
        loading: updateAdmin.loading,
        onSubmit: handleSave,
      }}
    />
  )
}

export default AdminManagementDetailPage
