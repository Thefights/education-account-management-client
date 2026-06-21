import MaskedNric from '@/shared/components/generals/MaskedNric'
import GenericTable from '@/shared/components/tables/GenericTable'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Button, Tag } from 'antd'
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
  onView,
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
      {
        key: 'nric',
        title: t('education_account.nric_full'),
        width: 130,
        sortable: true,
        render: (value) => <MaskedNric value={value} />,
      },
      { key: 'name', title: t('education_account.name'), width: 180, sortable: true },
      { key: 'dateOfBirth', title: t('education_account.dob'), width: 130, sortable: true },
      {
        key: 'status',
        title: t('education_account.status'),
        width: 120,
        sortable: true,
        render: (value) => <Tag color={statusColors[value]}>{value}</Tag>,
      },
      { key: 'balance', title: t('education_account.balance'), width: 130, sortable: true },
      {
        key: 'createdDate',
        title: t('education_account.created'),
        width: 170,
        sortable: true,
        render: formatDateBasedOnCurrentLanguage,
      },
      {
        key: 'action',
        title: '',
        width: 80,
        render: (_, row) => (
          <Button type="link" onClick={() => onView(row)}>
            {t('education_account.view')}
          </Button>
        ),
      },
    ],
    [onView, t]
  )

  return (
    <GenericTable
      data={accounts}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: setSelectedIds,
      }}
    />
  )
}

export default EServiceAccountsTableSection
