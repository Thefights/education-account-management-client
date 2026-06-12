import ActionMenu from '@/components/generals/ActionMenu'
import ConfirmationButton from '@/components/generals/ConfirmationButton'
import GenericTable from '@/components/tables/GenericTable'
import {
  defaultAuthAccountStatusStyle,
  defaultGenderStyle,
  defaultProductAssignmentRoleStyle,
} from '@/configs/defaultStylesConfig'
import useEnum from '@/hooks/useEnum'
import useTranslation from '@/hooks/useTranslation'
import { getEnumLabelByValue } from '@/utils/handleStringUtil'
import { Button, Flex, Space, Tag } from 'antd'
import { useMemo } from 'react'

const getProductLabelMap = (productOptions = []) => {
  const map = new Map()
  productOptions.forEach((option) => {
    map.set(option.value, option.label)
    map.set(String(option.value), option.label)
  })
  return map
}

const AccountManagementTableSection = ({
  accounts,
  productOptions = [],
  loading,
  sort,
  setSort,
  selectedIds = [],
  setSelectedIds = () => {},
  actionLoading = false,
  onDeleteSelected = () => {},
  onActivateSelected = () => {},
  onDeactivateSelected = () => {},
  onUnlockSelected = () => {},
  onImport = () => {},
  onCreate = () => {},
  onEdit = () => {},
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const hasSelectedAccounts = selectedIds.length > 0
  const productLabelMap = useMemo(() => getProductLabelMap(productOptions), [productOptions])

  const fields = useMemo(
    () => [
      {
        key: 'id',
        title: t('account.field.id'),
        width: 70,
        sortable: true,
        fixedColumn: true,
      },
      {
        key: 'userIdText',
        title: t('account.field.user_id_text'),
        width: 150,
        sortable: true,
      },
      {
        key: 'email',
        title: t('account.field.email'),
        width: 220,
        sortable: true,
      },
      {
        key: 'fullName',
        title: t('account.field.full_name'),
        width: 180,
        sortable: true,
      },
      {
        key: 'phoneNumber',
        title: t('account.field.phone_number'),
        width: 150,
        sortable: true,
      },
      {
        key: 'status',
        title: t('account.field.status'),
        width: 120,
        sortable: true,
        type: 'tag',
        options: _enum.authAccountStatusOptions,
        color: defaultAuthAccountStatusStyle,
      },
      {
        key: 'gender',
        title: t('account.field.gender'),
        width: 120,
        sortable: true,
        type: 'tag',
        options: _enum.genderOptions,
        color: defaultGenderStyle,
      },
      {
        key: 'roleIds',
        title: t('account.field.roles'),
        width: 180,
        type: 'tags',
        options: _enum.roleIdOptions,
      },
      {
        key: 'productAssignments',
        title: t('account.field.product_assignments'),
        width: 320,
        render: (assignments = []) => (
          <Space size={[4, 4]} wrap>
            {assignments.map((assignment) => {
              const productLabel =
                productLabelMap.get(assignment.productId) ||
                productLabelMap.get(String(assignment.productId)) ||
                `#${assignment.productId}`
              const roleLabel =
                getEnumLabelByValue(_enum.productAssignmentRoleOptions, assignment.roleInProduct) ||
                assignment.roleInProduct

              return (
                <Tag
                  key={`${assignment.productId}-${assignment.roleInProduct}`}
                  color={defaultProductAssignmentRoleStyle(assignment.roleInProduct)}
                >
                  {productLabel} - {roleLabel}
                </Tag>
              )
            })}
          </Space>
        ),
      },
      {
        key: 'actions',
        title: '',
        width: 70,
        render: (_, row) => (
          <ActionMenu
            actions={[
              {
                title: t('button.edit'),
                onClick: () => onEdit(row),
              },
            ]}
          />
        ),
      },
    ],
    [
      t,
      _enum.authAccountStatusOptions,
      _enum.genderOptions,
      _enum.productAssignmentRoleOptions,
      _enum.roleIdOptions,
      onEdit,
      productLabelMap,
    ]
  )

  return (
    <>
      <Flex justify="end" align="center" gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
        <ConfirmationButton
          confirmationTitle={t('account.confirm.delete_selected_title')}
          confirmationDescription={t('account.confirm.delete_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonColor="error"
          confirmButtonText={t('button.delete')}
          danger
          disabled={!hasSelectedAccounts || actionLoading}
          onConfirm={onDeleteSelected}
        >
          {t('account.button.delete_selected')}
        </ConfirmationButton>

        <ConfirmationButton
          confirmationTitle={t('account.confirm.activate_selected_title')}
          confirmationDescription={t('account.confirm.activate_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonText={t('account.button.activate_selected')}
          disabled={!hasSelectedAccounts || actionLoading}
          onConfirm={onActivateSelected}
        >
          {t('account.button.activate_selected')}
        </ConfirmationButton>

        <ConfirmationButton
          confirmationTitle={t('account.confirm.deactivate_selected_title')}
          confirmationDescription={t('account.confirm.deactivate_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonColor="warning"
          confirmButtonText={t('account.button.deactivate_selected')}
          disabled={!hasSelectedAccounts || actionLoading}
          onConfirm={onDeactivateSelected}
        >
          {t('account.button.deactivate_selected')}
        </ConfirmationButton>

        <ConfirmationButton
          confirmationTitle={t('account.confirm.unlock_selected_title')}
          confirmationDescription={t('account.confirm.unlock_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonText={t('account.button.unlock_selected')}
          disabled={!hasSelectedAccounts || actionLoading}
          onConfirm={onUnlockSelected}
        >
          {t('account.button.unlock_selected')}
        </ConfirmationButton>

        <Button onClick={onImport} disabled={actionLoading}>
          {t('account.button.batch_import')}
        </Button>

        <Button type="primary" onClick={onCreate} disabled={actionLoading}>
          {t('button.create')}
        </Button>
      </Flex>

      <GenericTable
        data={accounts}
        fields={fields}
        sort={sort}
        setSort={setSort}
        rowKey="id"
        canSelectRows
        selectedRows={selectedIds}
        setSelectedRows={setSelectedIds}
        loading={loading}
      />
    </>
  )
}

export default AccountManagementTableSection
