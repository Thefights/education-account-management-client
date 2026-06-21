import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import NricInput from '@/shared/components/textFields/NricInput'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { isEmail, maxLen } from '@/shared/utils/validateUtil'
import { useMemo } from 'react'

const initialValues = {
  role: '',
  azureObjectId: '',
  fullName: '',
  nric: '',
  email: '',
  phoneNumber: '',
  schoolId: '',
}

const toPayload = (values) => ({
  ...values,
  schoolId: values.schoolId === '' || values.schoolId == null ? null : Number(values.schoolId),
  phoneNumber: values.phoneNumber || null,
})

const normalizeInitialValues = (admin = {}) => ({
  role: admin.role ?? '',
  azureObjectId: admin.azureObjectId ?? '',
  fullName: admin.fullName ?? '',
  nric: admin.nric ?? '',
  email: admin.email ?? '',
  schoolId: admin.schoolId ?? '',
  phoneNumber: admin.phoneNumber ?? '',
})

const AdminManagementFormSection = ({
  openCreate,
  setOpenCreate,
  openUpdate,
  setOpenUpdate,
  selectedRow,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
  schoolOptions,
  schoolsLoading,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const adminRoleOptions = useMemo(
    () => _enum.roleIdOptions.filter((option) => option.value !== EnumConfig.RoleId.AccountHolder),
    [_enum.roleIdOptions]
  )
  const fields = useMemo(
    () => [
      {
        key: 'role',
        title: t('admin_management.field.role'),
        type: 'select',
        options: adminRoleOptions,
      },
      {
        key: 'azureObjectId',
        title: t('admin_management.field.azure_object_id'),
        validate: [maxLen(256)],
      },
      {
        key: 'fullName',
        title: t('admin_management.field.full_name'),
        validate: [maxLen(150)],
      },
      {
        key: 'nric',
        title: t('admin_management.field.nric'),
        type: 'custom',
        render: ({ value, onChange }) => <NricInput value={value} onChange={onChange} />,
        validate: [maxLen(9)],
      },
      {
        key: 'email',
        title: t('admin_management.field.email'),
        type: 'email',
        validate: [isEmail(), maxLen(320)],
      },
      {
        key: 'phoneNumber',
        title: t('admin_management.field.phone_number'),
        type: 'phone',
        required: false,
      },
      {
        key: 'schoolId',
        title: t('admin_management.field.school'),
        type: 'select',
        options: schoolOptions,
        props: {
          loading: schoolsLoading,
          showSearch: true,
          allowClear: true,
          optionFilterProp: 'label',
        },
        required: false,
      },
    ],
    [t, adminRoleOptions, schoolOptions, schoolsLoading]
  )

  const handleSubmit =
    (submit) =>
    async ({ values, closeDrawer }) => {
      const response = await submit({ overrideData: toPayload(values) })
      if (!response) return
      closeDrawer()
      await refetch()
    }

  return (
    <>
      <GenericFormDrawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title={t('admin_management.title.create')}
        submitLabel={t('button.create')}
        initialValues={initialValues}
        fields={fields}
        destroyOnClose
        onSubmit={handleSubmit(onCreateSubmit)}
      />
      <GenericFormDrawer
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        title={t('admin_management.title.update')}
        submitLabel={t('button.update')}
        initialValues={normalizeInitialValues(selectedRow)}
        fields={fields}
        destroyOnClose
        onSubmit={handleSubmit(onUpdateSubmit)}
      />
    </>
  )
}

export default AdminManagementFormSection
