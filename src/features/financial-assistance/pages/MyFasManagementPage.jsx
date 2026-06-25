import { FasApplicationFilterSection } from '@/features/financial-assistance/components/FasFilterSections'
import { MyFasApplicationTableSection } from '@/features/financial-assistance/components/FasTableSections'
import { MOCK_ACCOUNT_HOLDER } from '@/features/financial-assistance/data/fasSeedData'
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
  fasApplicationStatusOptions,
} from '@/features/financial-assistance/utils/fasTableConfig'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { routeUrls } from '@/shared/config/routeUrls'
import { Button, Card, Flex, Modal, Select, Tabs, Typography, message } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MyFasManagementPage = () => {
  const { schemes, applications } = useFasMockStore()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFasApplicationFilters)
  const [activeStatus, setActiveStatus] = useState(fasApplicationStatusOptions[0].value)
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'desc' })
  const [sortChoice, setSortChoice] = useState('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewId, setViewId] = useState(null)

  const schemeById = useMemo(
    () => Object.fromEntries(schemes.map((scheme) => [scheme.id, scheme])),
    [schemes]
  )

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

  const statusCounts = useMemo(
    () =>
      applicationRows.reduce((acc, application) => {
        acc[application.displayStatus] = (acc[application.displayStatus] || 0) + 1
        return acc
      }, {}),
    [applicationRows]
  )

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

  const viewApplication = accountApplications.find((application) => application.id === viewId)
  const viewScheme = schemeById[viewApplication?.schemeId]

  const withdraw = (application) => {
    Modal.confirm({
      title: `Withdraw ${schemeById[application.schemeId]?.name}?`,
      content: 'The pending application will be removed and the scheme will reappear in Apply.',
      okText: 'Withdraw',
      okButtonProps: { danger: true },
      onOk: () => {
        fasMockStore.withdrawApplication(application.id)
        message.success('Application withdrawn')
      },
    })
  }

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  const applyAgain = (application) => {
    const schemeId = application.schemeId
    navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY), {
      state: { schemeId },
    })
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
            items={fasApplicationStatusOptions.map((status) => ({
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
            applications={tableData.collection}
            loading={false}
            sort={sort}
            setSort={setSort}
            activeStatus={activeStatus}
            onWithdraw={withdraw}
            onView={(application) => setViewId(application.id)}
            onApplyAgain={applyAgain}
          />
          <GenericTablePagination
            totalCount={tableData.totalCount}
            totalPage={tableData.totalPage}
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
        onClose={() => setViewId(null)}
        onApplyAgain={(application) => {
          setViewId(null)
          applyAgain(application)
        }}
      />
    </Flex>
  )
}

const ApprovedFasModal = ({ application, scheme, open, onClose, onApplyAgain }) => {
  if (!application || !scheme) return null

  const tier = scheme.tiers.find((item) => item.id === application.tierId)
  const expired = isApprovedApplicationExpired(application)
  const validFrom = application.validFrom || application.submittedAt || application.approvedAt

  return (
    <Modal title={scheme.name} open={open} footer={null} onCancel={onClose} width={560}>
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
