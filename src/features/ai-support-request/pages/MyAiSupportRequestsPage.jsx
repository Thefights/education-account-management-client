/**
 * Account Holder page for one active AI Support Request and readonly resolved history.
 */
import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Space, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ActiveAiSupportRequestSection from '../components/ActiveAiSupportRequestSection'
import AiSupportRequestFormSection from '../components/AiSupportRequestFormSection'
import AiSupportRequestHistorySection from '../components/AiSupportRequestHistorySection'

const emptyDraft = { title: '', questionMessage: '' }

const MyAiSupportRequestsPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const activeRequestRef = useRef(null)
  const [draft] = useState(() => ({
    ...emptyDraft,
    ...(location.state?.aiSupportRequestDraft || {}),
  }))
  const [openCreate, setOpenCreate] = useState(() => Boolean(location.state?.aiSupportRequestDraft))
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const pendingParams = useMemo(
    () => ({ statuses: [1], sort: 'createdAt desc', page: 1, pageSize: 1 }),
    []
  )
  const historyParams = useMemo(
    () => ({ statuses: [2], sort: 'resolvedAt desc', page, pageSize }),
    [page, pageSize]
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
  const hasPrefilledDraft = Boolean(draft.questionMessage)
  const canCreate = !pendingRequests.loading && !pendingRequests.error && !activeRequest

  useEffect(() => {
    if (!hasPrefilledDraft || pendingRequests.loading || !pendingRequests.data) return

    navigate(location.pathname, { replace: true, state: null })
  }, [hasPrefilledDraft, location.pathname, navigate, pendingRequests.data, pendingRequests.loading])

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

  const scrollToActiveRequest = () => {
    activeRequestRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('ai_support_request.title.my_requests')}
        </Typography.Title>
        {activeRequest ? (
          <Button onClick={scrollToActiveRequest}>
            {t('ai_support_request.action.view_pending')}
          </Button>
        ) : canCreate ? (
          <Button type="primary" onClick={() => setOpenCreate(true)}>
            {t('ai_support_request.action.create')}
          </Button>
        ) : null}
      </Flex>

      <ActiveAiSupportRequestSection ref={activeRequestRef} request={activeRequest} />

      <AiSupportRequestHistorySection
        requests={requestHistory.data}
        loading={requestHistory.loading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      <AiSupportRequestFormSection
        open={openCreate && canCreate}
        initialValues={hasPrefilledDraft ? draft : emptyDraft}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
      />
    </Space>
  )
}

export default MyAiSupportRequestsPage
