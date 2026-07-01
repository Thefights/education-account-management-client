import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  formatMoney,
  formatTierRange,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import SearchBar from '@/shared/components/generals/SearchBar'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import { DeleteOutlined, EditOutlined, EyeOutlined, RedoOutlined, StopOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Modal,
  Select,
  Space,
  Typography,
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_APPLICATION_STATUS = EnumConfig.FasApplicationStatus

const MyFasManagementPage = () => {
  const navigate = useNavigate()
  const { fasApplicationStatusOptions } = useEnum()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detail, setDetail] = useState(null)

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      sort: `${sort.key === 'submittedAt' ? 'createdAt' : sort.key} ${sort.direction}`,
      page,
      pageSize,
    }),
    [search, status, sort, page, pageSize]
  )
  const applications = useFetch(ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS, params, [params])
  const pageData = applications.data || { collection: [], totalCount: 0, totalPage: 0 }
  const loadDetail = useAxiosSubmit({ method: 'GET' })
  const withdraw = useAxiosSubmit({ method: 'POST' })
  const removeDraft = useAxiosSubmit({ method: 'DELETE' })
  const reapply = useAxiosSubmit({ method: 'POST' })

  const openDetail = async (row) => {
    const response = await loadDetail.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(row.id),
    })
    if (response) setDetail(response.data)
  }
  const mutate = async (request, successMessage) => {
    if (!request) return
    message.success(successMessage)
    setDetail(null)
    await applications.fetch()
  }

  const fields = [
    { key: 'applicationNumber', title: 'Application number', sortable: true },
    { key: 'schemeName', title: 'Scheme name', sortable: true },
    { key: 'status', title: 'Status', sortable: true, render: (value) => <FasStatusTag status={value} /> },
    { key: 'submittedAt', title: 'Submitted date', sortable: true },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, row) => {
        const actions = [
          { title: 'View', icon: <EyeOutlined />, onClick: () => openDetail(row) },
        ]
        if (row.status === FAS_APPLICATION_STATUS.Draft) {
          actions.push(
            {
              title: 'Update',
              icon: <EditOutlined />,
              onClick: () =>
                navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
                  state: { draftApplicationId: row.id },
                }),
            },
            {
              title: 'Delete draft',
              icon: <DeleteOutlined />,
              onClick: async () =>
                mutate(
                  await removeDraft.submit({
                    overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DELETE_DRAFT(row.id),
                  }),
                  'Draft deleted.'
                ),
            }
          )
        }
        if (row.status === FAS_APPLICATION_STATUS.Pending) {
          actions.push({
            title: 'Withdraw',
            icon: <StopOutlined />,
            onClick: async () =>
              mutate(
                await withdraw.submit({
                  overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_WITHDRAW(row.id),
                }),
                'Application withdrawn.'
              ),
          })
        }
        if (
          row.status === FAS_APPLICATION_STATUS.Rejected ||
          row.status === FAS_APPLICATION_STATUS.Expired
        ) {
          actions.push({
            title: 'Apply again',
            icon: <RedoOutlined />,
            onClick: async () => {
              const response = await reapply.submit({
                overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_REAPPLY_DRAFT(row.id),
              })
              const draftId = response?.data?.id
              if (draftId) {
                navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
                  state: { draftApplicationId: draftId },
                })
              }
            },
          })
        }
        return <ActionMenu actions={actions} />
      },
    },
  ]

  const approvedTier =
    detail?.approvedTier ||
    detail?.scheme?.tiers?.find((tier) => tier.id === detail?.approvedTierId)

  return (
    <Card>
      <Flex vertical gap={16}>
        <Typography.Title level={4} style={{ margin: 0 }}>My FAS Applications</Typography.Title>
        <Flex gap={12} wrap="wrap">
          <div style={{ flex: 1, minWidth: 300 }}>
            <Typography.Text>Search by application number or scheme name</Typography.Text>
            <SearchBar
              value={search}
              setValue={(value) => {
                setSearch(value)
                setPage(1)
              }}
            />
          </div>
          <div style={{ width: 220 }}>
            <Typography.Text>Status</Typography.Text>
            <Select
              value={status}
              style={{ width: '100%' }}
              options={[{ value: 'all', label: 'All statuses' }, ...fasApplicationStatusOptions]}
              onChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            />
          </div>
        </Flex>
        <GenericTable
          data={pageData.collection}
          fields={fields}
          rowKey="id"
          sort={sort}
          setSort={setSort}
          loading={applications.loading}
        />
        <GenericTablePagination
          totalCount={pageData.totalCount}
          totalPage={pageData.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={applications.loading}
        />
      </Flex>
      {detail && (
        <Modal
          open
          width={800}
          title={`FAS Application ${detail.applicationNumber || ''}`}
          footer={<Button onClick={() => setDetail(null)}>Close</Button>}
          onCancel={() => setDetail(null)}
          destroyOnHidden
        >
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Scheme">{detail.schemeName || detail.scheme?.schemeName}</Descriptions.Item>
            <Descriptions.Item label="Status"><FasStatusTag status={detail.status} /></Descriptions.Item>
            <Descriptions.Item label="Gross household income">{formatMoney(detail.grossHouseholdIncomeSnapshot)}</Descriptions.Item>
            <Descriptions.Item label="Per-capita income">{formatMoney(detail.perCapitaIncomeSnapshot)}</Descriptions.Item>
            <Descriptions.Item label="Guardian nationality">{detail.guardianNationalitySnapshot}</Descriptions.Item>
            <Descriptions.Item label="Submitted at">{detail.createdAt || '-'}</Descriptions.Item>
          </Descriptions>
          <Divider orientation="left">Tier</Divider>
          {approvedTier ? (
            <Typography.Paragraph>
              <strong>{approvedTier.tierName}:</strong> {formatTierRange(approvedTier)}
            </Typography.Paragraph>
          ) : (
            <Typography.Text type="secondary">No approved tier.</Typography.Text>
          )}
          <Divider orientation="left">Documents</Divider>
          <Space direction="vertical">
            {(detail.documents || []).map((document) => (
              <Typography.Text key={document.id || document.fileKey}>
                {document.documentNameSnapshot}: {document.fileName}
              </Typography.Text>
            ))}
            {!(detail.documents || []).length && <Typography.Text type="secondary">No documents.</Typography.Text>}
          </Space>
          {detail.externalRejectionReason && (
            <>
              <Divider orientation="left">Rejection reason</Divider>
              <Typography.Paragraph>{detail.externalRejectionReason || '-'}</Typography.Paragraph>
            </>
          )}
        </Modal>
      )}
    </Card>
  )
}

export default MyFasManagementPage
