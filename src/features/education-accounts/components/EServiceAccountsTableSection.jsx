import GenericTable from '@/shared/components/tables/GenericTable'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import { Button, Flex, Space, Tag } from 'antd'
import { ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import useTranslation from '@/shared/hooks/useTranslation'

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
  onView,
  onCreate,
  onImport,
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
      { key: 'createdDate', title: t('education_account.created'), width: 140, sortable: true },
      {
        key: 'action',
        title: '',
        width: 80,
        render: (_, row) => <Button type="link" onClick={() => onView(row)}>{t('education_account.view')}</Button>,
      },
    ],
    [onView, t]
  )

  return (
    <>
      <Flex justify="end" style={{ marginBottom: 12 }}>
        <Space>
          <Button icon={<ImportOutlined />} onClick={onImport}>{t('education_account.batch_import')}</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>{t('button.create')}</Button>
        </Space>
      </Flex>
      <GenericTable
        data={accounts}
        fields={fields}
        rowKey="id"
        loading={loading}
        sort={sort}
        setSort={setSort}
      />
    </>
  )
}

export default EServiceAccountsTableSection
