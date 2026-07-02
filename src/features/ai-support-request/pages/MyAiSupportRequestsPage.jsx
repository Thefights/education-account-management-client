/**
 * Account Holder page for one active AI Support Request and readonly resolved history.
 */
import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ActiveAiSupportRequestSection from '../components/ActiveAiSupportRequestSection'
import AiSupportRequestDetailModal from '../components/AiSupportRequestDetailModal'
import AiSupportRequestFilterSection from '../components/AiSupportRequestFilterSection'
import AiSupportRequestFormSection from '../components/AiSupportRequestFormSection'
import AiSupportRequestHistorySection from '../components/AiSupportRequestHistorySection'

const emptyDraft = { title: '', questionMessage: '' }
const defaultHistoryFilters = {
  search: '',
  createdFrom: '',
  createdTo: '',
  resolvedFrom: '',
  resolvedTo: '',
  sort: 'resolvedAt desc',
}

const MyAiSupportRequestsPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const prefilledDraft = location.state?.aiSupportRequestDraft
  const draft = useMemo(
    () => ({ ...emptyDraft, ...(prefilledDraft || {}) }),
    [prefilledDraft]
  )
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [historyFilters, setHistoryFilters] = useState(defaultHistoryFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const pendingParams = useMemo(
    () => ({ statuses: [1], sort: 'createdAt desc', page: 1, pageSize: 1 }),
    []
  )
  const historyParams = useMemo(
    () => ({ statuses: [2], ...historyFilters, page, pageSize }),
    [historyFilters, page, pageSize]
  )
  const pendingRequests = useFetch(
    ApiUrls.AI_SUPPORT_REQUESTS.INDEX,
    pendingParams,
    [pendingParams]
  )
  const requestHistory = useFetch(
    ApiUrls.AI_SUPPORT_REQUESTS.INDEX,
    historyParams,
    [historyParams]
  )
  const createRequest = useAxiosSubmit({
    url: ApiUrls.AI_SUPPORT_REQUESTS.CREATE,
    method: 'POST',
  })

  const activeRequest = pendingRequests.data?.collection?.[0]
  const hasPrefilledDraft = Boolean(prefilledDraft?.questionMessage)
  const canCreate = !pendingRequests.loading && !pendingRequests.error && !activeRequest

  useEffect(() => {
    if (!hasPrefilledDraft || !activeRequest) return

    navigate(location.pathname, { replace: true, state: null })
  }, [activeRequest, hasPrefilledDraft, location.pathname, navigate])

  const handleCloseCreate = () => {
    setOpenCreate(false)
    if (hasPrefilledDraft) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }

  const handleCreate = async ({ values, closeDialog }) => {
    const response = await createRequest.submit({
      overrideData: {
        title: values.title.trim(),
        questionMessage: values.questionMessage.trim(),
      },
    })

    if (!response) {
      await pendingRequests.fetch()
      return
    }

    closeDialog()
    await Promise.all([pendingRequests.fetch(), requestHistory.fetch()])
  }

  const handleHistoryFilter = (values) => {
    setHistoryFilters(values)
    setPage(1)
  }

  const handleHistoryReset = () => {
    setHistoryFilters(defaultHistoryFilters)
    setPage(1)
  }

  return (
    <Space
      orientation="vertical"
      size={20}
      style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}
    >
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('ai_support_request.title.my_requests')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>
          {t('ai_support_request.text.page_description')}
        </Typography.Paragraph>
      </div>

      <ActiveAiSupportRequestSection
        request={activeRequest}
        loading={pendingRequests.loading}
        error={pendingRequests.error}
        onRetry={pendingRequests.fetch}
        onCreate={() => setOpenCreate(true)}
      />

      <AiSupportRequestHistorySection
        requests={requestHistory.data}
        loading={requestHistory.loading}
        error={requestHistory.error}
        onRetry={requestHistory.fetch}
        onView={setSelectedRequest}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        filterSection={
          <AiSupportRequestFilterSection
            mode="resolved"
            filters={historyFilters}
            defaultFilters={defaultHistoryFilters}
            loading={requestHistory.loading}
            onFilter={handleHistoryFilter}
            onReset={handleHistoryReset}
          />
        }
      />

      <AiSupportRequestFormSection
        key={hasPrefilledDraft ? location.key : 'manual-create'}
        open={(openCreate || hasPrefilledDraft) && canCreate}
        initialValues={hasPrefilledDraft ? draft : emptyDraft}
        onClose={handleCloseCreate}
        onSubmit={handleCreate}
      />

      <AiSupportRequestDetailModal
        request={selectedRequest}
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
      />
    </Space>
  )
}

export default MyAiSupportRequestsPage
