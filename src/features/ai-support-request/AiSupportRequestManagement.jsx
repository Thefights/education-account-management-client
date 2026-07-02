/**
 * System Admin queue for reviewing and resolving pending AI Support Requests.
 */
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import GenericTable from '@/shared/components/tables/GenericTable'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { maxLen } from '@/shared/utils/validateUtil'
import { Alert, Button, Card, Descriptions, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'

const AiSupportRequestManagement = () => {
  const { t } = useTranslation()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryParams = useMemo(
    () => ({ sort: 'createdAt asc', page, pageSize }),
    [page, pageSize]
  )
  const pendingRequests = useFetch(
    ApiUrls.AI_SUPPORT_REQUESTS.PENDING,
    queryParams,
    [queryParams]
  )
  const respondRequest = useAxiosSubmit({ method: 'POST' })

  const responseFields = useMemo(
    () => [
      {
        key: 'requestContext',
        type: 'custom',
        required: false,
        render: () => (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('ai_support_request.field.account_holder')}>
                {selectedRequest?.accountHolderName}
              </Descriptions.Item>
              <Descriptions.Item label={t('ai_support_request.field.title')}>
                {selectedRequest?.title}
              </Descriptions.Item>
              <Descriptions.Item label={t('ai_support_request.field.question')}>
                <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedRequest?.questionMessage}
                </Typography.Paragraph>
              </Descriptions.Item>
            </Descriptions>
            <Alert type="warning" showIcon message={t('ai_support_request.text.response_final')} />
          </Space>
        ),
      },
      {
        key: 'adminResponse',
        title: t('ai_support_request.field.admin_response'),
        placeholder: t('ai_support_request.placeholder.admin_response'),
        multiple: 5,
        validate: [maxLen(2000)],
      },
    ],
    [selectedRequest, t]
  )
  const tableFields = useMemo(
    () => [
      { key: 'id', title: t('ai_support_request.field.id'), width: 80 },
      {
        key: 'accountHolderName',
        title: t('ai_support_request.field.account_holder'),
        width: 180,
      },
      { key: 'title', title: t('ai_support_request.field.title'), width: 180 },
      {
        key: 'questionMessage',
        title: t('ai_support_request.field.question'),
        render: (value) => <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{value}</Typography.Text>,
      },
      {
        key: 'createdAt',
        title: t('ai_support_request.field.created_at'),
        width: 170,
        render: formatDatetimeStringBasedOnCurrentLanguage,
      },
      {
        key: 'status',
        title: t('ai_support_request.field.status'),
        width: 110,
        render: () => <Tag color="warning">{t('ai_support_request.status.pending')}</Tag>,
      },
      {
        key: 'action',
        title: '',
        width: 130,
        render: (_, request) => (
          <Button type="primary" onClick={() => setSelectedRequest(request)}>
            {t('ai_support_request.action.submit_response')}
          </Button>
        ),
      },
    ],
    [t]
  )

  const handleRespond = async ({ values, closeDialog }) => {
    const response = await respondRequest.submit({
      overrideUrl: ApiUrls.AI_SUPPORT_REQUESTS.RESPOND(selectedRequest.id),
      overrideData: { adminResponse: values.adminResponse.trim() },
    })
    if (!response) {
      await pendingRequests.fetch()
      return
    }

    closeDialog()
    await pendingRequests.fetch()
  }

  return (
    <Card>
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('ai_support_request.title.plural')}
        </Typography.Title>
        <GenericTable
          data={pendingRequests.data?.collection}
          fields={tableFields}
          rowKey="id"
          loading={pendingRequests.loading}
        />
        <GenericTablePagination
          totalCount={pendingRequests.data?.totalCount}
          totalPage={pendingRequests.data?.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={pendingRequests.loading}
        />
      </Space>

      <GenericFormDialog
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={t('ai_support_request.title.respond')}
        submitLabel={t('ai_support_request.action.submit_response')}
        initialValues={{ adminResponse: '' }}
        fields={responseFields}
        destroyOnHidden
        onSubmit={handleRespond}
      />
    </Card>
  )
}

export default AiSupportRequestManagement
