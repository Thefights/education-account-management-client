import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { Button, Flex, Typography } from 'antd'
import { FAS_APPLICATION_STATUS, FAS_STATUS } from '../data/fasSeedData'
import { formatFasDate } from '../utils/fasRules'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  RollbackOutlined,
  StopOutlined,
} from '@ant-design/icons'
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
                { title: 'Update', icon: <EditOutlined />, onClick: () => onEdit?.(row) },
                { title: 'Duplicate', icon: <CopyOutlined />, onClick: () => onDuplicate?.(row) },
              ]
            : [
                { title: 'View', icon: <EyeOutlined />, onClick: () => onView?.(row) },
                { title: 'Duplicate', icon: <CopyOutlined />, onClick: () => onDuplicate?.(row) },
                row.status === FAS_STATUS.Active
                  ? {
                      title: 'Deactivate',
                      icon: <StopOutlined />,
                      onClick: () => onDeactivate?.(row),
                    }
                  : {
                      title: 'Activate',
                      icon: <CheckCircleOutlined />,
                      onClick: () => onActivate?.(row),
                    },
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
      render: (value) => <Typography.Text>{value}</Typography.Text>,
    },
    { key: 'accountNumber', title: 'Account No.', width: 140 },
    { key: 'schemeName', title: 'FAS applied for', width: 240, sortable: true },
    {
      key: 'displayStatus',
      title: 'Status',
      width: 120,
      type: 'tag',
      options: fasApplicationStatusOptions,
      color: getFasStatusColor,
    },
    {
      key: 'submittedAt',
      title: 'Submitted',
      width: 140,
      sortable: true,
      render: formatFasDate,
    },
    {
      key: 'actions',
      title: '',
      width: 95,
      render: (_, row) => (
        <Button
          size="small"
          type={row.status === FAS_APPLICATION_STATUS.Pending ? 'primary' : 'link'}
          icon={row.status === FAS_APPLICATION_STATUS.Pending ? <EditOutlined /> : <EyeOutlined />}
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
  onWithdraw,
  onView,
  onEditDraft,
  onDeleteDraft,
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
    width: 180,
    render: (_, row) => {
      if (row.displayStatus === FAS_APPLICATION_STATUS.Draft) {
        return (
          <Flex gap={6} justify="end" wrap="wrap">
            <Button type="link" onClick={() => onEditDraft?.(row)}>
              <EditOutlined />
              Edit
            </Button>
            <Button danger type="link" onClick={() => onDeleteDraft?.(row)}>
              <DeleteOutlined />
              Delete
            </Button>
          </Flex>
        )
      }

      if (row.displayStatus === FAS_APPLICATION_STATUS.Pending) {
        return (
          <Flex gap={6} justify="end" wrap="wrap">
            <Button type="link" onClick={() => onView?.(row)}>
              <EyeOutlined />
              View
            </Button>
            {onWithdraw ? (
              <Button danger type="link" onClick={() => onWithdraw(row)}>
                <StopOutlined />
                Withdraw
              </Button>
            ) : null}
          </Flex>
        )
      }

      if (
        row.displayStatus === FAS_APPLICATION_STATUS.Rejected ||
        row.displayStatus === FAS_APPLICATION_STATUS.Expired
      ) {
        return (
          <Flex gap={6} justify="end" wrap="wrap">
            <Button type="link" onClick={() => onView?.(row)}>
              <EyeOutlined />
              View
            </Button>
            <Button type="link" onClick={() => onApplyAgain?.(row)}>
              <RollbackOutlined />
              Apply again
            </Button>
          </Flex>
        )
      }

      if (row.displayStatus === FAS_APPLICATION_STATUS.Withdrawn) {
        return (
          <Button type="link" onClick={() => onView?.(row)}>
            <EyeOutlined />
            View
          </Button>
        )
      }

      return (
        <Button type="link" onClick={() => onView?.(row)}>
          <EyeOutlined />
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

  const fields = [
    ...baseFields,
    {
      key: 'displayStatus',
      title: 'Status',
      width: 120,
      type: 'tag',
      options: fasApplicationStatusOptions,
      color: getFasStatusColor,
    },
    dateField('submittedAt', 'Submitted'),
    dateField('approvedAt', 'Approved'),
    {
      key: 'endDate',
      title: 'Valid until',
      width: 150,
      sortable: true,
      render: (value, row) => (
        <Typography.Text
          type={row.displayStatus === FAS_APPLICATION_STATUS.Expired ? 'danger' : undefined}
        >
          {formatFasDate(value)}
          {row.displayStatus === FAS_APPLICATION_STATUS.Expired ? ' · Expired' : ''}
        </Typography.Text>
      ),
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
