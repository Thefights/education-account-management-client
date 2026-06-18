import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen } from '@/shared/utils/validateUtil'
import { useCallback, useMemo, useState } from 'react'

const initialCreateValues = {
  userIdText: '',
  email: '',
  fullName: '',
  phoneNumber: '',
  gender: EnumConfig.UserGender.Unknown,
  imageUrl: null,
  roleIds: [],
  productAssignments: [],
}

const normalizeIdArray = (values = []) =>
  (Array.isArray(values) ? values : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)

const normalizeProductAssignments = (assignments = []) =>
  (Array.isArray(assignments) ? assignments : [])
    .map((assignment) => ({
      productId: Number(assignment.productId),
      roleInProduct: assignment.roleInProduct,
    }))
    .filter(
      (assignment) =>
        Number.isFinite(assignment.productId) &&
        assignment.productId > 0 &&
        !!assignment.roleInProduct
    )

const hasRole = (roleIds = [], roleId) => normalizeIdArray(roleIds).includes(roleId)

const hasAdminRole = (roleIds = []) => hasRole(roleIds, EnumConfig.RoleId.SystemAdmin)

const hasAccountHolderRole = (roleIds = []) => hasRole(roleIds, EnumConfig.RoleId.AccountHolder)

const canAssignProductPermissions = (roleIds = []) =>
  hasAccountHolderRole(roleIds) && !hasAdminRole(roleIds)

const createAccountPayload = (values, { includeUserIdText = true } = {}) => {
  const roleIds = normalizeIdArray(values.roleIds)
  const shouldSendProductAssignments = canAssignProductPermissions(roleIds)

  const payload = {
    ...values,
    roleIds,
    productAssignments: shouldSendProductAssignments
      ? normalizeProductAssignments(values.productAssignments)
      : [],
  }

  if (!includeUserIdText) {
    delete payload.userIdText
  }

  if (!(payload.imageUrl instanceof File)) {
    delete payload.imageUrl
  }

  return payload
}

const normalizeAccountInitialValues = (account = {}) => ({
  ...account,
  imageUrl: account.imageUrl || null,
  roleIds: normalizeIdArray(account.roleIds),
  productAssignments:
    account.productAssignments?.length > 0
      ? account.productAssignments.map((assignment) => ({
          productId: Number(assignment.productId) || '',
          roleInProduct: assignment.roleInProduct || '',
        }))
      : [],
})

const AccountManagementFormSection = ({
  openCreate,
  setOpenCreate,
  openUpdate,
  setOpenUpdate,
  selectedRow,
  productOptions = [],
  productsLoading = false,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const [createRoleIds, setCreateRoleIds] = useState(initialCreateValues.roleIds)
  const [updateRoleIds, setUpdateRoleIds] = useState([])

  const syncProductPermissionValues = useCallback((values, { setField } = {}, setRoleIds) => {
    const roleIds = normalizeIdArray(values.roleIds)
    setRoleIds(roleIds)

    if (
      !canAssignProductPermissions(roleIds) &&
      Array.isArray(values.productAssignments) &&
      values.productAssignments.length > 0
    ) {
      setField?.('productAssignments', [])
    }
  }, [])

  const handleCreateValuesChange = useCallback(
    (values, helpers) => syncProductPermissionValues(values, helpers, setCreateRoleIds),
    [syncProductPermissionValues]
  )

  const handleUpdateValuesChange = useCallback(
    (values, helpers) => syncProductPermissionValues(values, helpers, setUpdateRoleIds),
    [syncProductPermissionValues]
  )

  const getProductAssignmentField = useCallback(
    (enabled) => ({
      key: 'productAssignments',
      title: t('account.field.product_assignments'),
      type: 'array',
      required: enabled,
      props: {
        disabled: !enabled,
      },
      of: [
        {
          key: 'productId',
          title: t('account.field.product'),
          type: 'select-dialog',
          options: productOptions,
          props: {
            disabled: productsLoading || !enabled,
          },
        },
        {
          key: 'roleInProduct',
          title: t('account.field.role_in_product'),
          type: 'select',
          options: _enum.productAssignmentRoleOptions,
          props: {
            disabled: !enabled,
          },
        },
      ],
    }),
    [t, productOptions, productsLoading, _enum.productAssignmentRoleOptions]
  )

  const getBaseFields = useCallback(
    (productAssignmentsEnabled) => [
      {
        key: 'email',
        title: t('account.field.email'),
        type: 'email',
        validate: [maxLen(320)],
      },
      {
        key: 'fullName',
        title: t('account.field.full_name'),
        validate: [maxLen(100)],
      },
      {
        key: 'phoneNumber',
        title: t('account.field.phone_number'),
        type: 'phone',
        required: false,
      },
      {
        key: 'gender',
        title: t('account.field.gender'),
        type: 'select',
        options: _enum.genderOptions,
      },
      {
        key: 'imageUrl',
        title: t('account.field.image'),
        type: 'image',
        required: false,
      },
      {
        key: 'roleIds',
        title: t('account.field.roles'),
        type: 'select',
        multiple: true,
        options: _enum.roleIdOptions,
      },
      getProductAssignmentField(productAssignmentsEnabled),
    ],
    [t, _enum.genderOptions, _enum.roleIdOptions, getProductAssignmentField]
  )

  const createProductAssignmentsEnabled = canAssignProductPermissions(createRoleIds)
  const updateProductAssignmentsEnabled = canAssignProductPermissions(updateRoleIds)

  const createFields = useMemo(
    () => [
      {
        key: 'userIdText',
        title: t('account.field.user_id_text'),
        validate: [maxLen(256)],
      },
      ...getBaseFields(createProductAssignmentsEnabled),
    ],
    [t, getBaseFields, createProductAssignmentsEnabled]
  )

  const updateFields = useMemo(
    () => [
      {
        key: 'status',
        title: t('account.field.status'),
        type: 'select',
        options: _enum.authAccountStatusOptions,
      },
      ...getBaseFields(updateProductAssignmentsEnabled),
    ],
    [t, _enum.authAccountStatusOptions, getBaseFields, updateProductAssignmentsEnabled]
  )

  const handleCreateSubmit = async ({ values, closeDrawer }) => {
    const response = await onCreateSubmit({
      overrideData: createAccountPayload(values),
    })

    if (!response) return

    closeDrawer()
    refetch()
  }

  const handleUpdateSubmit = async ({ values, closeDrawer }) => {
    if (!selectedRow?.id) return

    const response = await onUpdateSubmit({
      overrideData: createAccountPayload(values, { includeUserIdText: false }),
    })

    if (!response) return

    closeDrawer()
    refetch()
  }

  return (
    <>
      <GenericFormDrawer
        open={openCreate}
        onClose={() => {
          setCreateRoleIds(initialCreateValues.roleIds)
          setOpenCreate(false)
        }}
        initialValues={initialCreateValues}
        fields={createFields}
        submitLabel={t('button.create')}
        title={t('account.title.create_account')}
        width={760}
        destroyOnClose
        onValuesChange={handleCreateValuesChange}
        onSubmit={handleCreateSubmit}
      />

      <GenericFormDrawer
        open={openUpdate}
        onClose={() => {
          setUpdateRoleIds([])
          setOpenUpdate(false)
        }}
        initialValues={normalizeAccountInitialValues(selectedRow)}
        fields={updateFields}
        submitLabel={t('button.update')}
        title={t('account.title.edit_account')}
        width={760}
        destroyOnClose
        onValuesChange={handleUpdateValuesChange}
        onSubmit={handleUpdateSubmit}
      />
    </>
  )
}

export default AccountManagementFormSection
