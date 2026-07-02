import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import EmptyBox from '@/shared/components/placeholders/EmptyBox'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { CheckCircleOutlined, FileDoneOutlined, RightOutlined } from '@ant-design/icons'
import { Alert, Button, Card, List, Space, Typography, theme } from 'antd'
import '../styles/aiSupportRequest.css'

const AiSupportRequestHistorySection = ({
  requests,
  loading,
  error,
  onRetry,
  onView,
  page,
  setPage,
  pageSize,
  setPageSize,
  filterSection,
}) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const history = requests?.collection || []
  const handleRecordKeyDown = (event, request) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onView(request)
  }

  return (
    <Card
      title={t('ai_support_request.title.history')}
      extra={
        <Typography.Text type="secondary">
          {t('ai_support_request.text.request_count', { count: requests?.totalCount || 0 })}
        </Typography.Text>
      }
      styles={{ body: { padding: 20 } }}
    >
      <Space orientation="vertical" size={14} style={{ width: '100%' }}>
        {filterSection}
        {error ? (
          <Alert
            type="error"
            showIcon
            message={t('ai_support_request.error.load_history')}
            action={<Button onClick={onRetry}>{t('ai_support_request.action.retry')}</Button>}
          />
        ) : !loading && !history.length ? (
          <EmptyBox
            minHeight={180}
            icon={<FileDoneOutlined style={{ fontSize: 64, color: token.colorTextDisabled }} />}
            title={t('ai_support_request.empty.no_history_title')}
            description={t('ai_support_request.text.no_history')}
          />
        ) : (
          <List
            className="ai-support-history-list"
            loading={loading}
            dataSource={history}
            split
            renderItem={(request) => (
              <List.Item
                className="ai-support-history-item"
                role="button"
                tabIndex={0}
                aria-label={`${t('ai_support_request.action.view_response')}: ${request.title}`}
                onClick={() => onView(request)}
                onKeyDown={(event) => handleRecordKeyDown(event, request)}
                style={{
                  '--history-hover-bg': token.colorPrimaryBg,
                  '--history-focus-color': token.colorPrimary,
                }}
              >
                <div className="ai-support-history-row">
                  <div
                    className="ai-support-history-icon"
                    style={{
                      color: token.colorSuccess,
                      background: token.colorSuccessBg,
                    }}
                  >
                    <CheckCircleOutlined />
                  </div>

                  <div className="ai-support-history-content">
                    <Typography.Text strong className="ai-support-history-title">
                      {request.title}
                    </Typography.Text>
                    <Typography.Paragraph
                      type="secondary"
                      ellipsis={{ rows: 1, tooltip: request.adminResponse }}
                      className="ai-support-history-response"
                    >
                      {request.adminResponse || '-'}
                    </Typography.Paragraph>
                  </div>

                  <div className="ai-support-history-date">
                    <Typography.Text type="secondary" className="ai-support-history-date-label">
                      {t('ai_support_request.field.resolved_at')}
                    </Typography.Text>
                    <Typography.Text>
                      {formatDatetimeStringBasedOnCurrentLanguage(request.resolvedAt)}
                    </Typography.Text>
                  </div>

                  <RightOutlined
                    className="ai-support-history-chevron"
                    style={{ color: token.colorTextTertiary }}
                  />
                </div>
              </List.Item>
            )}
          />
        )}

        {!error && Boolean(requests?.totalCount) && (
          <GenericTablePagination
            totalCount={requests?.totalCount}
            totalPage={requests?.totalPage}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            loading={loading}
          />
        )}
      </Space>
    </Card>
  )
}

export default AiSupportRequestHistorySection
