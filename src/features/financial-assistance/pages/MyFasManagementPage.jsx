import { FasApplicationFilterSection } from '@/features/financial-assistance/components/FasFilterSections'
import { MyFasApplicationTableSection } from '@/features/financial-assistance/components/FasTableSections'
import { FAS_APPLICATION_STATUS } from '@/features/financial-assistance/data/fasSeedData'
import {
  normalizeApiApplicationDetail,
  normalizeApiApplicationPage,
} from '@/features/financial-assistance/api/accountHolderFasApi'
import '@/features/financial-assistance/styles/financialAssistance.css'
import {
  describeTierSubsidy,
  formatFasDate,
  isApprovedApplicationExpired,
} from '@/features/financial-assistance/utils/fasRules'
import {
  defaultFasApplicationFilters,
  myFasApplicationStatusOptions,
} from '@/features/financial-assistance/utils/fasTableConfig'
import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import useConfirm from '@/shared/hooks/useConfirm'
import { routeUrls } from '@/shared/config/routeUrls'
import { Button, Card, Flex, Modal, Select, Tabs, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const getApiErrorMessage = (error, t) => {
  const payload = error?.response?.data
  if (!payload) return t('financial_assistance.message.reapply_failed')
  if (payload.message && payload.message !== 'Validation failed') return payload.message
  if (typeof payload.error === 'string') return payload.error
  if (payload.error && typeof payload.error === 'object') {
    return Object.values(payload.error).filter(Boolean).join(', ')
  }
  return payload.message || t('financial_assistance.message.reapply_failed')
}

const getResponseData = (response) => response?.data

const FAS_APPLICATION_ACTIVITY_TAB = {
  Inactive: 'inactive',
  Active: 'active',
}

const inactiveApplicationStatuses = new Set([
  FAS_APPLICATION_STATUS.Draft,
  FAS_APPLICATION_STATUS.Pending,
  FAS_APPLICATION_STATUS.Expired,
  FAS_APPLICATION_STATUS.Rejected,
  FAS_APPLICATION_STATUS.Withdrawn,
])

const activeApplicationStatuses = new Set([FAS_APPLICATION_STATUS.Approved])

const applicationActivityTabOptions = [
  {
    value: FAS_APPLICATION_ACTIVITY_TAB.Inactive,
    label: 'Inactive',
    statuses: inactiveApplicationStatuses,
  },
  {
    value: FAS_APPLICATION_ACTIVITY_TAB.Active,
    label: 'Active',
    statuses: activeApplicationStatuses,
  },
]

const isApplicationInActivityTab = (application, tab) => {
  const tabConfig = applicationActivityTabOptions.find((item) => item.value === tab)
  return tabConfig?.statuses.has(application.displayStatus) ?? false
}

const MyFasManagementPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const confirm = useConfirm()
  const [filters, setFilters] = useState(defaultFasApplicationFilters)
  const [activeTab, setActiveTab] = useState(FAS_APPLICATION_ACTIVITY_TAB.Inactive)
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'desc' })
  const [sortChoice, setSortChoice] = useState('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [apiViewApplication, setApiViewApplication] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const reapplyDraftSubmit = useAxiosSubmit({
    method: 'POST',
    onError: async (error) => {
      message.error(getApiErrorMessage(error, t))
    },
  })
  const withdrawSubmit = useAxiosSubmit({
    method: 'POST',
  })
  const deleteDraftSubmit = useAxiosSubmit({
    method: 'DELETE',
  })

  const apiQueryParams = useMemo(
    () => ({
      Page: 1,
      PageSize: 100,
      Sort: `${sort.key === 'submittedAt' ? 'createdAt' : sort.key} ${sort.direction}`,
      Search: filters.search || undefined,
    }),
    [filters.search, sort.direction, sort.key]
  )
  const apiApplicationsQuery = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    apiQueryParams,
    [apiQueryParams]
  )
  const apiApplicationPage = useMemo(
    () => normalizeApiApplicationPage(apiApplicationsQuery.data),
    [apiApplicationsQuery.data]
  )
  const statusSourceRows = apiApplicationPage.collection
  const activityCounts = useMemo(
    () =>
      applicationActivityTabOptions.reduce((acc, tab) => {
        acc[tab.value] = statusSourceRows.filter((application) =>
          tab.statuses.has(application.displayStatus)
        ).length
        return acc
      }, {}),
    [statusSourceRows]
  )

  const apiVisibleRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    const selectedStatus =
      activeTab === FAS_APPLICATION_ACTIVITY_TAB.Inactive ? filters.status || 'all' : 'all'

    return apiApplicationPage.collection.filter((application) => {
      const matchesQuery =
        !query ||
        application.id.toLowerCase().includes(query) ||
        application.schemeName.toLowerCase().includes(query)
      const matchesTab = isApplicationInActivityTab(application, activeTab)
      const matchesStatus =
        selectedStatus === 'all' || application.displayStatus === selectedStatus
      return matchesQuery && matchesTab && matchesStatus
    })
  }, [activeTab, apiApplicationPage.collection, filters.search, filters.status])

  const apiTableData = {
    collection: apiVisibleRows.slice((page - 1) * pageSize, page * pageSize),
    totalCount: apiVisibleRows.length,
    totalPage: Math.max(1, Math.ceil(apiVisibleRows.length / pageSize)),
  }
  const resolvedTableData = apiTableData
  const viewApplication = apiViewApplication
  const viewScheme = viewApplication?.scheme

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  const loadApiApplicationDetail = async (application) => {
    if (!application?.apiId) return null

    setDetailLoading(true)
    try {
      const response = await axiosConfig.get(
        ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(application.apiId)
      )
      return normalizeApiApplicationDetail(response.data, application)
    } finally {
      setDetailLoading(false)
    }
  }

  const applyAgain = async (application) => {
    if (!application?.apiId) {
      message.error(t('financial_assistance.message.application_id_missing'))
      return
    }

    const response = await reapplyDraftSubmit.submit({
      overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_REAPPLY_DRAFT(application.apiId),
    })
    const draftId = getResponseData(response)?.id
    if (draftId) {
      navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
        state: { draftApplicationId: draftId },
      })
    }
  }

  const editDraft = (application) => {
    if (!application?.apiId) {
      message.error(t('financial_assistance.message.application_id_missing'))
      return
    }

    navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
      state: { draftApplicationId: application.apiId },
    })
  }

  const deleteDraft = async (application) => {
    const apiId = application?.apiId
    if (apiId == null) {
      message.error('Unable to delete this draft because its API id is missing.')
      return
    }

    const isConfirmed = await confirm({
      title: `Delete ${application.schemeName || application.id}?`,
      description: 'This removes the draft application. You can still apply for this scheme again.',
      confirmText: 'Delete',
      confirmColor: 'error',
    })

    if (!isConfirmed) return

    try {
      const response = await deleteDraftSubmit.submit({
        overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DELETE_DRAFT(apiId),
      })
      if (response) {
        message.success('Draft application deleted successfully.')
        setPage(1)
        apiApplicationsQuery.fetch()
      }
    } catch {
      // Errors handled globally by axios interceptor
    }
  }

  const withdraw = async (application) => {
    const apiId = application?.apiId
    if (apiId == null) {
      message.error('Unable to withdraw this application because its API id is missing.')
      return
    }

    const isConfirmed = await confirm({
      title: `Withdraw ${application.schemeName || application.id}?`,
      description: 'The pending application will be withdrawn and the scheme will reappear in Apply if it is still available.',
      confirmText: 'Withdraw',
      confirmColor: 'error',
    })

    if (isConfirmed) {
      try {
        await withdrawSubmit.submit({
          overrideUrl: ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_WITHDRAW(apiId),
        })
        setPage(1)
        apiApplicationsQuery.fetch()
      } catch {
        // Errors handled globally by axios interceptor
      }
    }
  }

  const viewApplicationDetail = async (application) => {
    const detail = await loadApiApplicationDetail(application)
    if (detail) setApiViewApplication(detail)
  }

  const updateSortChoice = (value) => {
    setSortChoice(value)
    setSort(
      value === 'name'
        ? { key: 'schemeName', direction: 'asc' }
        : { key: 'submittedAt', direction: value === 'oldest' ? 'asc' : 'desc' }
    )
    setPage(1)
  }

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1600, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ margin: 0, letterSpacing: '-0.02em' }}>
        My FAS Management
      </Typography.Title>

      <Card styles={{ body: { padding: 'clamp(16px, 2vw, 24px)' } }}>
        <Flex vertical gap={16}>
          <Tabs
            activeKey={activeTab}
            onChange={(tab) => {
              setActiveTab(tab)
              setFilters((currentFilters) => ({ ...currentFilters, status: 'all' }))
              setPage(1)
            }}
            items={applicationActivityTabOptions.map((tab) => ({
              key: tab.value,
              label: `${tab.label} (${activityCounts[tab.value] || 0})`,
            }))}
          />
          <FasApplicationFilterSection
            key={activeTab}
            filters={filters}
            loading={apiApplicationsQuery.loading}
            searchTitle="Search by FAS or app no."
            dateTitle="Submitted date"
            showStatus={activeTab === FAS_APPLICATION_ACTIVITY_TAB.Inactive}
            statusMode="single"
            statusOptions={myFasApplicationStatusOptions}
            showDateRange={false}
            onFilter={handleFilter}
            onReset={() => handleFilter(defaultFasApplicationFilters)}
          />
          <Flex justify="end">
            <Select
              value={sortChoice}
              placeholder="Select sort order"
              style={{ width: 180 }}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'name', label: 'Name A-Z' },
              ]}
              onChange={updateSortChoice}
            />
          </Flex>
          <MyFasApplicationTableSection
            applications={resolvedTableData.collection}
            loading={
              apiApplicationsQuery.loading ||
              reapplyDraftSubmit.loading ||
              withdrawSubmit.loading ||
              deleteDraftSubmit.loading
            }
            sort={sort}
            setSort={setSort}
            onWithdraw={withdraw}
            onView={viewApplicationDetail}
            onEditDraft={editDraft}
            onDeleteDraft={deleteDraft}
            onApplyAgain={applyAgain}
          />
          <GenericTablePagination
            totalCount={resolvedTableData.totalCount}
            totalPage={resolvedTableData.totalPage}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            loading={false}
          />
        </Flex>
      </Card>

      <ApprovedFasModal
        application={viewApplication}
        scheme={viewScheme}
        open={!!viewApplication && !!viewScheme}
        loading={detailLoading}
        onClose={() => {
          setApiViewApplication(null)
        }}
        onApplyAgain={(application) => {
          setApiViewApplication(null)
          applyAgain(application)
        }}
      />
    </Flex>
  )
}

const ApprovedFasModal = ({ application, scheme, open, loading, onClose, onApplyAgain }) => {
  if (!application || !scheme) return null

  const tier = scheme.tiers.find((item) => item.id === application.tierId)
  const expired = isApprovedApplicationExpired(application)
  const validFrom = application.validFrom || application.submittedAt || application.approvedAt

  return (
    <Modal title={scheme.name} open={open} footer={null} onCancel={onClose} width={560} confirmLoading={loading}>
      <div className="fas-kv">
        <div className="fas-kv-row">
          <span>Application No.</span>
          <strong>{application.id}</strong>
        </div>
        <div className="fas-kv-row">
          <span>Tier</span>
          <strong>{tier?.name || '-'}</strong>
        </div>
        <div className="fas-kv-row">
          <span>Valid from</span>
          <strong>{formatFasDate(validFrom)}</strong>
        </div>
        <div className="fas-kv-row">
          <span>Duration</span>
          <strong>{scheme.validityMonths || 12} months</strong>
        </div>
        <div className="fas-kv-row">
          <span>Valid until</span>
          <strong style={{ color: expired ? 'var(--fas-red)' : undefined }}>
            {formatFasDate(application.endDate)}
            {expired ? ' · Expired' : ''}
          </strong>
        </div>
        <div className="fas-kv-row">
          <span>Validity status</span>
          <strong style={{ color: expired ? 'var(--fas-red)' : 'var(--fas-green)' }}>
            {expired ? 'Invalid' : 'Valid'}
          </strong>
        </div>
      </div>

      <div className="fas-section-label" style={{ marginBottom: 7 }}>
        Tier subsidy
      </div>
      <div className="fas-kv">
        <div className="fas-kv-row">
          <span>Subsidy</span>
          <strong>{tier ? describeTierSubsidy(scheme, tier) : '-'}</strong>
        </div>
      </div>

      <div className="fas-section-label" style={{ marginBottom: 7 }}>
        Applied to courses
      </div>
      {application.courses?.length ? (
        <ul className="fas-course-list">
          {application.courses.map((course) => (
            <li key={course}>{course}</li>
          ))}
        </ul>
      ) : (
        <div className="fas-muted" style={{ fontSize: 12.5 }}>
          Not applied to any course yet.
        </div>
      )}

      <Flex justify="end" gap={8} style={{ marginTop: 16 }}>
        {expired && (
          <Button type="primary" onClick={() => onApplyAgain?.(application)}>
            Apply again
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </Flex>
    </Modal>
  )
}

export default MyFasManagementPage
