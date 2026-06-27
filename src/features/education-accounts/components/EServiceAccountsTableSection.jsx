import GenericTable from '@/shared/components/tables/GenericTable'
import useTranslation from '@/shared/hooks/useTranslation'
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
      { key: 'dateOfBirth', title: t('education_account.dob'), width: 130, sortable: true },
    ],
    [t]
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
