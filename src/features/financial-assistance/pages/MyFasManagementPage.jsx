import { FasApplicationFilterSection } from '@/features/financial-assistance/components/FasFilterSections'
import { MyFasApplicationTableSection } from '@/features/financial-assistance/components/FasTableSections'
import { FAS_APPLICATION_STATUS, MOCK_ACCOUNT_HOLDER } from '@/features/financial-assistance/data/fasSeedData'
import {
  normalizeApiApplicationDetail,
  normalizeApiApplicationPage,
  normalizeFasSnapshotProfile,
  toApiApplicationStatus,
} from '@/features/financial-assistance/api/accountHolderFasApi'
import {
  fasMockStore,
  useFasMockStore,
} from '@/features/financial-assistance/data/fasMockStore'
import { useFasMockTable } from '@/features/financial-assistance/hooks/useFasMockTable'
import '@/features/financial-assistance/styles/financialAssistance.css'
import {
  describeTierSubsidy,
  formatFasDate,
  getApplicationDisplayStatus,
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
import { routeUrls } from '@/shared/config/routeUrls'
import { Button, Card, Flex, Modal, Select, Tabs, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MyFasManagementPage = () => {
  const { schemes, applications } = useFasMockStore()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFasApplicationFilters)
  const [activeStatus, setActiveStatus] = useState(myFasApplicationStatusOptions[0].value)
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'desc' })
  const [sortChoice, setSortChoice] = useState('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewId, setViewId] = useState(null)
  const [apiViewApplication, setApiViewApplication] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const schemeById = useMemo(
    () => Object.fromEntries(schemes.map((scheme) => [String(scheme.id), scheme])),
    [schemes]
  )
  const apiStatus = activeStatus === 'expired' ? FAS_APPLICATION_STATUS.Approved : activeStatus
  const apiQueryParams = useMemo(
    () => ({
      page,
      pageSize,
      sort: `${sort.key === 'submittedAt' ? 'createdAt' : sort.key} ${sort.direction}`,
      status: toApiApplicationStatus(apiStatus),
      search: filters.search || undefined,
    }),
    [apiStatus, filters.search, page, pageSize, sort.direction, sort.key]
  )
  const apiApplicationsQuery = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    apiQueryParams,
    [apiQueryParams]
  )
  const apiAllApplicationsQuery = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    { page: 1, pageSize: 100, sort: 'createdAt desc' },
    []
  )
  const apiApplicationPage = useMemo(
    () => normalizeApiApplicationPage(apiApplicationsQuery.data),
    [apiApplicationsQuery.data]
  )
  const apiAllApplicationPage = useMemo(
    () => normalizeApiApplicationPage(apiAllApplicationsQuery.data),
    [apiAllApplicationsQuery.data]
  )
  const usingApiApplications = Boolean(apiApplicationsQuery.data) && !apiApplicationsQuery.error
  const usingApiAllApplications = Boolean(apiAllApplicationsQuery.data) && !apiAllApplicationsQuery.error

  const accountApplications = useMemo(
    () =>
      applications.filter(
        (application) => application.accountNumber === MOCK_ACCOUNT_HOLDER.accountNumber
      ),
    [applications]
  )

  const applicationRows = useMemo(
    () =>
      accountApplications
        .map((application) => {
          const scheme = schemeById[application.schemeId]
          if (!scheme) return null

          return {
            ...application,
            schemeName: scheme.name,
            displayStatus: getApplicationDisplayStatus(application),
            statusDate: application.submittedAt || '',
            endDateDisplay: application.endDate || '',
          }
        })
        .filter(Boolean),
    [accountApplications, schemeById]
  )

  const statusSourceRows = usingApiAllApplications ? apiAllApplicationPage.collection : applicationRows
  const statusCounts = useMemo(
    () =>
      statusSourceRows.reduce((acc, application) => {
        acc[application.displayStatus] = (acc[application.displayStatus] || 0) + 1
        return acc
      }, {}),
    [statusSourceRows]
  )

  const apiVisibleRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return apiApplicationPage.collection.filter((application) => {
      const matchesQuery =
        !query ||
        application.id.toLowerCase().includes(query) ||
        application.schemeName.toLowerCase().includes(query)
      const matchesStatus = application.displayStatus === activeStatus
      return matchesQuery && matchesStatus
    })
  }, [activeStatus, apiApplicationPage.collection, filters.search])

  const tableData = useFasMockTable({
    rows: applicationRows,
    filters,
    sort,
    page,
    pageSize,
    filterRow: (application, currentFilters) => {
      const query = currentFilters.search.trim().toLowerCase()
      const statusDate = application.submittedAt || ''
      const matchesQuery =
        !query ||
        application.id.toLowerCase().includes(query) ||
        application.schemeName.toLowerCase().includes(query)
      const matchesStatus = application.displayStatus === activeStatus
      const matchesDateFrom = !currentFilters.dateFrom || statusDate >= currentFilters.dateFrom
      const matchesDateTo = !currentFilters.dateTo || statusDate <= currentFilters.dateTo

      return matchesQuery && matchesStatus && matchesDateFrom && matchesDateTo
    },
  })

  const apiTableData = {
    collection: apiVisibleRows,
    totalCount:
      filters.search || activeStatus === 'expired'
        ? apiVisibleRows.length
        : apiApplicationPage.totalCount,
    totalPage:
      filters.search || activeStatus === 'expired'
        ? Math.max(1, Math.ceil(apiVisibleRows.length / pageSize))
        : apiApplicationPage.totalPage,
  }
  const resolvedTableData = usingApiApplications ? apiTableData : tableData
  const viewApplication =
    apiViewApplication || accountApplications.find((application) => application.id === viewId)
  const viewScheme = viewApplication?.scheme || schemeById[String(viewApplication?.schemeId)]

  const withdraw = (application) => {
    Modal.confirm({
      title: `Withdraw ${schemeById[application.schemeId]?.name}?`,
      content: 'The pending application will be removed and the scheme will reappear in Apply.',
      okText: 'Withdraw',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (application.apiId) {
          await axiosConfig.post(ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_WITHDRAW(application.apiId))
          message.success('Application withdrawn')
          navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY))
          return
        }

        fasMockStore.withdrawApplication(application.id)
        message.success('Application withdrawn')
        navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY))
      },
    })
  }

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
    if (application.apiId) {
      const detail = await loadApiApplicationDetail(application)
      navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
        state: {
          schemeId: detail?.schemeId,
          snapshot: normalizeFasSnapshotProfile(detail?.profileSnapshot, undefined),
        },
      })
      return
    }

    const schemeId = application.schemeId
    navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
      state: { schemeId },
    })
  }

  const viewApplicationDetail = async (application) => {
    if (application.apiId) {
      const detail = await loadApiApplicationDetail(application)
      if (detail) setApiViewApplication(detail)
      return
    }

    setViewId(application.id)
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
            activeKey={activeStatus}
            onChange={(status) => {
              setActiveStatus(status)
              setPage(1)
            }}
            items={myFasApplicationStatusOptions.map((status) => ({
              key: status.value,
              label: `${status.label} (${statusCounts[status.value] || 0})`,
            }))}
          />
          <FasApplicationFilterSection
            filters={filters}
            loading={false}
            searchTitle="Search by FAS or app no."
            dateTitle="Submitted date"
            showStatus={false}
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
            loading={apiApplicationsQuery.loading}
            sort={sort}
            setSort={setSort}
            activeStatus={activeStatus}
            onWithdraw={withdraw}
            onView={viewApplicationDetail}
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
          setViewId(null)
          setApiViewApplication(null)
        }}
        onApplyAgain={(application) => {
          setViewId(null)
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
