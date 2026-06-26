import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { Button, Typography } from 'antd'
import { FAS_APPLICATION_STATUS, FAS_STATUS } from '../data/fasSeedData'
import { formatFasDate } from '../utils/fasRules'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  fasApplicationStatusOptions,
  fasSchemeStatusOptions,
  getFasStatusColor,
} from '../utils/fasTableConfig'

export const FasAdminSchemeTableSection = ({
  schemes,
  loading,
  sort,
  setSort,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onActivate,
  onDeactivate,
}) => {
  const fields = [
    { key: 'id', title: 'FAS ID', width: 120, sortable: true, fixedColumn: true },
    {
      key: 'name',
      title: 'Scheme name',
      width: 260,
      sortable: true,
      render: (value) => <Typography.Text>{value}</Typography.Text>,
    },
    {
      key: 'status',
      title: 'Status',
      width: 120,
      sortable: true,
      type: 'tag',
      options: fasSchemeStatusOptions,
      color: getFasStatusColor,
    },
    {
      key: 'createdAt',
      title: 'Created at',
      width: 180,
      sortable: true,
      render: formatDatetimeStringBasedOnCurrentLanguage,
    },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => {
        const actions =
          row.status === FAS_STATUS.Draft
            ? [
                { title: 'Edit', onClick: () => onEdit?.(row) },
                { title: 'Duplicate', onClick: () => onDuplicate?.(row) },
                { title: 'Delete', onClick: () => onDelete?.(row) },
              ]
            : [
                { title: 'View', onClick: () => onView?.(row) },
                { title: 'Duplicate', onClick: () => onDuplicate?.(row) },
                row.status === FAS_STATUS.Active
                  ? { title: 'Deactivate', onClick: () => onDeactivate?.(row) }
                  : { title: 'Activate', onClick: () => onActivate?.(row) },
              ]

        return <ActionMenu actions={actions} />
      },
    },
  ]

  return (
    <GenericTable
      data={schemes}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
    />
  )
}

export const FasAdminApplicationTableSection = ({
  applications,
  loading,
  sort,
  setSort,
  onReview,
}) => {
  const fields = [
    { key: 'id', title: 'Application No.', width: 160, sortable: true, fixedColumn: true },
    {
      key: 'applicantName',
      title: 'Account name',
      width: 200,
      sortable: true,
      render: (value) => <Typography.Text>{value}</Typography.Text>,
    },
    { key: 'accountNumber', title: 'Account No.', width: 140, sortable: true },
    { key: 'schemeName', title: 'FAS applied for', width: 240, sortable: true },
    {
      key: 'submittedAt',
      title: 'Submitted',
      width: 140,
      sortable: true,
      render: formatFasDate,
    },
    {
      key: 'displayStatus',
      title: 'Status',
      width: 120,
      type: 'tag',
      options: fasApplicationStatusOptions,
      color: getFasStatusColor,
    },
    {
      key: 'actions',
      title: '',
      width: 95,
      render: (_, row) => (
        <Button
          size="small"
          type={row.status === FAS_APPLICATION_STATUS.Pending ? 'primary' : 'link'}
          onClick={() => onReview?.(row)}
        >
          {row.status === FAS_APPLICATION_STATUS.Pending ? 'Review' : 'View'}
        </Button>
      ),
    },
  ]

  return (
    <GenericTable
      data={applications}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
    />
  )
}

export const MyFasApplicationTableSection = ({
  applications,
  loading,
  sort,
  setSort,
  activeStatus,
  onWithdraw,
  onView,
  onApplyAgain,
}) => {
  const baseFields = [
    { key: 'id', title: 'Application No.', width: 160, sortable: true, fixedColumn: true },
    {
      key: 'schemeName',
      title: 'Scheme',
      width: 260,
      sortable: true,
      render: (value) => <Typography.Text>{value}</Typography.Text>,
    },
  ]

  const actionField = {
    key: 'actions',
    title: '',
    width: 120,
    render: (_, row) => {
      if (row.displayStatus === FAS_APPLICATION_STATUS.Pending) {
        return (
          <Button danger type="link" onClick={() => onWithdraw?.(row)}>
            Withdraw
          </Button>
        )
      }

      if (row.displayStatus === FAS_APPLICATION_STATUS.Rejected || row.displayStatus === 'expired') {
        return (
          <Button type="link" onClick={() => onApplyAgain?.(row)}>
            Apply again
          </Button>
        )
      }

      return (
        <Button type="link" onClick={() => onView?.(row)}>
          View
        </Button>
      )
    },
  }

  const dateField = (key, title, danger = false) => ({
    key,
    title,
    width: 150,
    sortable: true,
    render: (value) => (
      <Typography.Text type={danger ? 'danger' : undefined}>
        {formatFasDate(value)}
        {danger ? ' · Expired' : ''}
      </Typography.Text>
    ),
  })

  const statusFields = {
    [FAS_APPLICATION_STATUS.Pending]: [
      ...baseFields,
      dateField('submittedAt', 'Submitted'),
      actionField,
    ],
    [FAS_APPLICATION_STATUS.Approved]: [
      ...baseFields,
      dateField('submittedAt', 'Submitted'),
      dateField('approvedAt', 'Approved'),
      dateField('endDate', 'Valid until'),
      actionField,
    ],
    expired: [
      ...baseFields,
      dateField('submittedAt', 'Submitted'),
      dateField('approvedAt', 'Approved'),
      dateField('endDate', 'Valid until', true),
      actionField,
    ],
    [FAS_APPLICATION_STATUS.Rejected]: [
      ...baseFields,
      dateField('submittedAt', 'Submitted'),
      { key: 'reason', title: 'Reason', width: 260 },
      actionField,
    ],
  }

  const fields = statusFields[activeStatus] || [
    ...baseFields,
    {
      key: 'displayStatus',
      title: 'Status',
      width: 120,
      type: 'tag',
      options: fasApplicationStatusOptions,
      color: getFasStatusColor,
    },
    actionField,
  ]

  return (
    <GenericTable
      data={applications}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
    />
  )
}
