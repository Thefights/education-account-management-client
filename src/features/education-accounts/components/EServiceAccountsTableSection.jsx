import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateToDDMMYYYY } from '@/shared/utils/formatDateUtil'
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { useMemo } from 'react'

const statusColors = {
  Active: 'success',
  Extended: 'processing',
  Closed: 'default',
}

const EServiceAccountsTableSection = ({
  accounts,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDetail,
  onChangeStatus,
}) => {
  const { t } = useTranslation()
  const fields = useMemo(
    () => [
      {
        key: 'accountNumber',
        title: t('education_account.account_number'),
        width: 150,
        sortable: true,
        fixedColumn: true,
      },
      { key: 'name', title: t('education_account.name'), width: 180, sortable: true },
      {
        key: 'status',
        title: t('education_account.status'),
        width: 120,
        sortable: true,
        render: (value) => <Tag color={statusColors[value]}>{value}</Tag>,
      },
      {
        key: 'dateOfBirth',
        title: t('education_account.dob'),
        width: 130,
        sortable: true,
        render: formatDateToDDMMYYYY,
      },
      {
        key: 'actions',
        title: '',
        width: 70,
        render: (_, row) => (
          <ActionMenu
            actions={[
              {
                title: t('button.activate'),
                icon: <CheckCircleOutlined />,
                hidden: row.status === EnumConfig.EducationAccountStatus.Active,
                onClick: () => onChangeStatus?.(1, row),
              },
              {
                title: t('button.deactivate'),
                icon: <StopOutlined />,
                hidden: row.status === EnumConfig.EducationAccountStatus.Closed,
                onClick: () => onChangeStatus?.(3, row),
              },
            ]}
          />
        ),
      },
    ],
    [t, onChangeStatus]
  )

  return (
    <GenericTable
      data={accounts}
      fields={fields}
      rowKey="id"
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

export default EServiceAccountsTableSection
