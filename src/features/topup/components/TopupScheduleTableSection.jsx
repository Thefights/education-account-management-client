import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import {
  formatDateBasedOnCurrentLanguage,
  formatDatetimeStringBasedOnCurrentLanguage,
} from '@/shared/utils/formatDateUtil'
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons'
import { Space, Typography } from 'antd'

const TopupScheduleTableSection = ({
  schedules,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onDetail,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'name',
      title: t('topup.topup_name'),
      width: 250,
      sortable: true,
      fixedColumn: true,
      render: (name, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Link onClick={() => onDetail?.(row)}>{name}</Typography.Link>
          <Typography.Text type="secondary">#{row.id}</Typography.Text>
        </Space>
      ),
    },
    {
      key: 'frequency',
      title: t('topup.schedule_type'),
      width: 140,
      sortable: true,
      options: _enum.scheduleTopupFrequencyOptions,
    },
    {
      key: 'status',
      title: t('topup.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.scheduleTopupStatusOptions,
      color: defaultTopupStatusStyle,
    },
    {
      key: 'topupAmount',
      title: t('topup.amount'),
      width: 130,
      isNumeric: true,
      sortable: true,
      render: formatCurrencyBasedOnCurrentLanguage,
    },
    {
      key: 'nextExecutionAt',
      title: t('topup.next_execution'),
      width: 190,
      sortable: true,
      render: formatDateBasedOnCurrentLanguage,
    },
    {
      key: 'createdAt',
      title: t('topup.created_at'),
      width: 190,
      sortable: true,
      render: formatDatetimeStringBasedOnCurrentLanguage,
    },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => (
        <ActionMenu actions={[
          {
            title: t('button.activate'),
            icon: <CheckCircleOutlined />,
            hidden: row.status === 'Active' || row.status === 'Completed',
            onClick: () => onChangeStatus?.('Active', row),
          },
          {
            title: t('button.deactivate'),
            icon: <StopOutlined />,
            hidden: row.status === 'Inactive' || row.status === 'Completed',
            onClick: () => onChangeStatus?.('Inactive', row),
          },
          { title: t('button.update'), icon: <EditOutlined />, onClick: () => onEdit?.(row) },
          { title: t('button.delete'), icon: <DeleteOutlined />, onClick: () => onDelete?.(row) },
        ]} />
      ),
    },
  ]

  return (
    <GenericTable
      data={schedules}
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

export default TopupScheduleTableSection
