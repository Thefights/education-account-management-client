/**
 * System Admin page for reviewing Pending and Resolved AI Support Requests.
 */
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import EmptyBox from '@/shared/components/placeholders/EmptyBox'
import GenericTable from '@/shared/components/tables/GenericTable'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { maxLen } from '@/shared/utils/validateUtil'
import { FileSearchOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space, Tabs, Typography, theme } from 'antd'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AiSupportRequestDetailModal from './components/AiSupportRequestDetailModal'
import AiSupportRequestDetailPanel from './components/AiSupportRequestDetailPanel'
import AiSupportRequestFilterSection from './components/AiSupportRequestFilterSection'

const requestStatuses = { pending: 1, resolved: 2 }
const countQueryParams = (status) => ({ statuses: [status], page: 1, pageSize: 1 })
const defaultFilters = {
  pending: {
    search: '',
    createdFrom: '',
    createdTo: '',
    sort: 'createdAt asc',
  },
  resolved: {
    search: '',
    createdFrom: '',
    createdTo: '',
    resolvedFrom: '',
    resolvedTo: '',
    sort: 'resolvedAt desc',
  },
}

const AiSupportRequestManagement = () => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'resolved' ? 'resolved' : 'pending'
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [filtersByTab, setFiltersByTab] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filters = filtersByTab[activeTab]
  const queryParams = useMemo(
    () => ({
      statuses: [requestStatuses[activeTab]],
      ...filters,
      page,
      pageSize,
    }),
    [activeTab, filters, page, pageSize]
  )
  const supportRequests = useFetch(
    ApiUrls.AI_SUPPORT_REQUESTS.MANAGEMENT,
    queryParams,
    [queryParams]
  )
  const pendingCountQuery = useFetch(
    ApiUrls.AI_SUPPORT_REQUESTS.MANAGEMENT,
    countQueryParams(requestStatuses.pending)
  )
  const resolvedCountQuery = useFetch(
    ApiUrls.AI_SUPPORT_REQUESTS.MANAGEMENT,
    countQueryParams(requestStatuses.resolved)
  )
  const respondRequest = useAxiosSubmit({ method: 'POST' })
  const requests = supportRequests.data?.collection || []
  const isResolvedTab = activeTab === 'resolved'
  const pendingCount = pendingCountQuery.error
    ? '—'
    : pendingCountQuery.data?.totalCount ?? '…'
  const resolvedCount = resolvedCountQuery.error
    ? '—'
    : resolvedCountQuery.data?.totalCount ?? '…'

  const responseFields = useMemo(
    () => [
      {
        key: 'requestContext',
        type: 'custom',
        required: false,
        render: () => (
          <AiSupportRequestDetailPanel request={selectedRequest} showAccountHolder />
        ),
      },
      {
        key: 'adminResponse',
        title: t('ai_support_request.field.admin_response'),
        placeholder: t('ai_support_request.placeholder.admin_response'),
        multiple: 5,
        validate: [maxLen(2000)],
        props: { maxLength: 2000, showCount: true, style: { resize: 'none' } },
      },
      {
        key: 'responseGuidance',
        type: 'custom',
        required: false,
        render: () => (
          <Alert
            type="warning"
            showIcon
            message={t('ai_support_request.text.response_final')}
            style={{ marginTop: 8 }}
          />
        ),
      },
    ],
    [selectedRequest, t]
  )

  const tableFields = useMemo(
    () => [
      {
        key: 'accountHolderName',
        title: t('ai_support_request.field.account_holder'),
        width: 170,
      },
      {
        key: 'title',
        title: t('ai_support_request.field.title'),
        width: 190,
        render: (value) => <Typography.Text strong>{value}</Typography.Text>,
      },
      ...(!isResolvedTab
        ? [
            {
              key: 'questionMessage',
              title: t('ai_support_request.field.question'),
              render: (value) => (
                <Typography.Paragraph
                  ellipsis={{ rows: 2, tooltip: value }}
                  style={{ margin: 0, maxWidth: 420 }}
                >
                  {value}
                </Typography.Paragraph>
              ),
            },
          ]
        : []),
      ...(!isResolvedTab
        ? [
            {
              key: 'createdAt',
              title: t('ai_support_request.field.created_at'),
              width: 175,
              render: formatDatetimeStringBasedOnCurrentLanguage,
            },
          ]
        : []),
      ...(isResolvedTab
        ? [
            {
              key: 'resolvedAt',
              title: t('ai_support_request.field.resolved_at'),
              width: 175,
              render: (value) => (
                <Typography.Text type="secondary">
                  {formatDatetimeStringBasedOnCurrentLanguage(value)}
                </Typography.Text>
              ),
            },
            {
              key: 'responsedByName',
              title: t('ai_support_request.field.responded_by'),
              width: 160,
            },
          ]
        : []),
    ],
    [isResolvedTab, t]
  )

  const tabItems = useMemo(
    () => [
      {
        key: 'pending',
        label: `${t('ai_support_request.status.pending')} (${pendingCount})`,
      },
      {
        key: 'resolved',
        label: `${t('ai_support_request.status.resolved')} (${resolvedCount})`,
      },
    ],
    [pendingCount, resolvedCount, t]
  )

  const handleTabChange = (tab) => {
    setSelectedRequest(null)
    setPage(1)
    setSearchParams(tab === 'pending' ? {} : { tab })
  }

  const handleFilter = (values) => {
    setFiltersByTab((current) => ({ ...current, [activeTab]: values }))
    setPage(1)
  }

  const handleReset = () => {
    setFiltersByTab((current) => ({ ...current, [activeTab]: defaultFilters[activeTab] }))
    setPage(1)
  }

  const handleRespond = async ({ values, closeDialog }) => {
    const response = await respondRequest.submit({
      overrideUrl: ApiUrls.AI_SUPPORT_REQUESTS.RESPOND(selectedRequest.id),
      overrideData: { adminResponse: values.adminResponse.trim() },
    })
    if (!response) {
      await supportRequests.fetch()
      return
    }

    closeDialog()
    await Promise.all([
      supportRequests.fetch(),
      pendingCountQuery.fetch(),
      resolvedCountQuery.fetch(),
    ])
  }

  const emptyTitle = isResolvedTab
    ? t('ai_support_request.empty.no_resolved_title')
    : t('ai_support_request.empty.no_pending_title')
  const emptyDescription = isResolvedTab
    ? t('ai_support_request.empty.no_resolved_description')
    : t('ai_support_request.empty.no_pending_description')

  return (
    <Card styles={{ body: { padding: 20 } }}>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('ai_support_request.title.plural')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
            {t('ai_support_request.text.admin_description')}
          </Typography.Paragraph>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          tabBarStyle={{ marginBottom: 0 }}
        />

        <AiSupportRequestFilterSection
          key={activeTab}
          mode={activeTab}
          filters={filters}
          defaultFilters={defaultFilters[activeTab]}
          loading={supportRequests.loading}
          onFilter={handleFilter}
          onReset={handleReset}
        />

        {supportRequests.error ? (
          <Alert
            type="error"
            showIcon
            message={t('ai_support_request.error.load_admin')}
            action={
              <Button onClick={supportRequests.fetch}>
                {t('ai_support_request.action.retry')}
              </Button>
            }
          />
        ) : !supportRequests.loading && !requests.length ? (
          <EmptyBox
            minHeight={240}
            icon={<FileSearchOutlined style={{ fontSize: 72, color: token.colorTextDisabled }} />}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <>
            <GenericTable
              data={requests}
              fields={tableFields}
              rowKey="id"
              loading={supportRequests.loading}
              onRowClick={setSelectedRequest}
            />
            <GenericTablePagination
              totalCount={supportRequests.data?.totalCount}
              totalPage={supportRequests.data?.totalPage}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              loading={supportRequests.loading}
            />
          </>
        )}
      </Space>

      <GenericFormDialog
        open={Boolean(selectedRequest) && !isResolvedTab}
        onClose={() => setSelectedRequest(null)}
        title={t('ai_support_request.title.respond')}
        submitLabel={t('ai_support_request.action.submit_response')}
        initialValues={{ adminResponse: '' }}
        fields={responseFields}
        width={880}
        destroyOnHidden
        onSubmit={handleRespond}
      />

      <AiSupportRequestDetailModal
        request={selectedRequest}
        open={Boolean(selectedRequest) && isResolvedTab}
        onClose={() => setSelectedRequest(null)}
        showAccountHolder
      />
    </Card>
  )
}

export default AiSupportRequestManagement
