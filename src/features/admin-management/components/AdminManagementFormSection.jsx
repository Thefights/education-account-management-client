import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import NricInput from '@/shared/components/textFields/NricInput'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { isEmail, maxLen } from '@/shared/utils/validateUtil'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
  schoolId:
    values.role === EnumConfig.RoleId.SchoolAdmin && values.schoolId !== '' && values.schoolId != null
      ? Number(values.schoolId)
      : null,
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
  const [currentRole, setCurrentRole] = useState('')
  const updateInitialValues = useMemo(() => normalizeInitialValues(selectedRow), [selectedRow])
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
        required: false,
      },
      ...(currentRole === EnumConfig.RoleId.SchoolAdmin
        ? [
            {
              key: 'schoolId',
              title: t('admin_management.field.school'),
              type: 'select',
              options: schoolOptions,
              placeholder: 'Select a school',
              props: {
                loading: schoolsLoading,
                showSearch: true,
                allowClear: true,
                optionFilterProp: 'label',
              },
              required: true,
            },
          ]
        : []),
    ],
    [t, adminRoleOptions, schoolOptions, schoolsLoading, currentRole]
  )

  const handleSubmit =
    (submit) =>
    async ({ values, closeDialog }) => {
      const response = await submit({ overrideData: toPayload(values) })
      if (!response) return
      closeDialog()
      await refetch()
    }

  const handleValuesChange = useCallback((values) => {
    setCurrentRole((prev) => (values.role !== prev ? values.role : prev))
  }, [])

  useEffect(() => {
    if (openUpdate) {
      setCurrentRole(updateInitialValues.role)
      return
    }

    if (openCreate) {
      setCurrentRole(initialValues.role)
    }
  }, [openCreate, openUpdate, updateInitialValues.role])

  return (
    <>
      <GenericFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title={t('admin_management.title.create')}
        submitLabel={t('button.create')}
        initialValues={initialValues}
        fields={fields}
        destroyOnHidden
        onSubmit={handleSubmit(onCreateSubmit)}
        onValuesChange={openCreate ? handleValuesChange : undefined}
      />
      <GenericFormDialog
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        title={t('admin_management.title.update')}
        submitLabel={t('button.update')}
        initialValues={updateInitialValues}
        fields={fields}
        destroyOnHidden
        onSubmit={handleSubmit(onUpdateSubmit)}
        onValuesChange={openUpdate ? handleValuesChange : undefined}
      />
    </>
  )
}

export default AdminManagementFormSection
