import GenericTable from '@/shared/components/tables/GenericTable'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { Space, Tag, Tooltip, Typography } from 'antd'
import { useMemo } from 'react'

const actionColors = {
  Activate: 'success',
  Deactivate: 'error',
  Delete: 'error',
  Publish: 'processing',
  Close: 'default',
}

const ManagementActionLogManagementTableSection = ({ logs, loading, sort, setSort, onDetail }) => {
  const { t } = useTranslation()

  const fields = useMemo(
    () => [
      {
        key: 'occurredAt',
        title: t('management_action_log.field.occurred_at'),
        width: 180,
        sortable: true,
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
      {
        key: 'actorFullName',
        title: t('management_action_log.field.actor'),
        width: 220,
        render: (value, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{renderEmptyFallback(value || row.actorEmail)}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {row.actorUserRole || renderEmptyFallback(row.actorUserId)}
            </Typography.Text>
          </Space>
        ),
      },
      {
        key: 'entityType',
        title: t('management_action_log.field.entity_type'),
        width: 170,
        sortable: true,
      },
      {
        key: 'entityId',
        title: t('management_action_log.field.entity_id'),
        width: 120,
        sortable: true,
      },
      {
        key: 'action',
        title: t('management_action_log.field.action'),
        width: 140,
        sortable: true,
        render: (value) =>
          value ? (
            <Tag color={actionColors[value] || 'default'}>{value}</Tag>
          ) : (
            renderEmptyFallback(null)
          ),
      },
      {
        key: 'previousStatus',
        title: t('management_action_log.field.status_change'),
        width: 180,
        render: (_, row) =>
          row.previousStatus && row.newStatus
            ? `${row.previousStatus} -> ${row.newStatus}`
            : 'N/A',
      },
      {
        key: 'reason',
        title: t('management_action_log.field.reason'),
        width: 280,
        render: (value) => (
          <Tooltip title={value}>
            <Typography.Text ellipsis style={{ maxWidth: 260 }}>
              {renderEmptyFallback(value)}
            </Typography.Text>
          </Tooltip>
        ),
      },
      {
        key: 'ipAddress',
        title: t('management_action_log.field.ip_address'),
        width: 150,
        sortable: true,
      },
    ],
    [t]
  )

  return (
    <GenericTable
      data={logs}
      fields={fields}
      sort={sort}
      setSort={setSort}
      rowKey="id"
      loading={loading}
      onRowClick={onDetail}
    />
  )
}

export default ManagementActionLogManagementTableSection
