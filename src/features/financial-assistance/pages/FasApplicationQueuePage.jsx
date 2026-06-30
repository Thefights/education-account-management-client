import { FasApplicationFilterSection } from '@/features/financial-assistance/components/FasFilterSections'
import { FasAdminApplicationTableSection } from '@/features/financial-assistance/components/FasTableSections'
import { FAS_APPLICATION_STATUS } from '@/features/financial-assistance/data/fasSeedData'
import '@/features/financial-assistance/styles/financialAssistance.css'
import { statusLabel } from '@/features/financial-assistance/utils/fasRules'
import {
  defaultFasApplicationFilters,
} from '@/features/financial-assistance/utils/fasTableConfig'
import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import { Button, Card, Flex, Input, Modal, Radio, Select, Spin, Tag, Typography, message } from 'antd'
import { useMemo, useState } from 'react'

const FAS_APPLICATION_STATUS_ID = EnumConfig.FasApplicationStatusId

const apiStatusToUi = {
  [FAS_APPLICATION_STATUS_ID.Pending]: FAS_APPLICATION_STATUS.Pending,
  [FAS_APPLICATION_STATUS_ID.Approved]: FAS_APPLICATION_STATUS.Approved,
  [FAS_APPLICATION_STATUS_ID.Rejected]: FAS_APPLICATION_STATUS.Rejected,
  [FAS_APPLICATION_STATUS_ID.Withdrawn]: FAS_APPLICATION_STATUS.Withdrawn,
  [FAS_APPLICATION_STATUS_ID.Draft]: FAS_APPLICATION_STATUS.Draft,
  [FAS_APPLICATION_STATUS_ID.Expired]: FAS_APPLICATION_STATUS.Expired,
  Pending: FAS_APPLICATION_STATUS.Pending,
  Approved: FAS_APPLICATION_STATUS.Approved,
  Rejected: FAS_APPLICATION_STATUS.Rejected,
  Withdrawn: FAS_APPLICATION_STATUS.Withdrawn,
  Draft: FAS_APPLICATION_STATUS.Draft,
  Expired: FAS_APPLICATION_STATUS.Expired,
  pending: FAS_APPLICATION_STATUS.Pending,
  approved: FAS_APPLICATION_STATUS.Approved,
  rejected: FAS_APPLICATION_STATUS.Rejected,
  withdrawn: FAS_APPLICATION_STATUS.Withdrawn,
  draft: FAS_APPLICATION_STATUS.Draft,
  expired: FAS_APPLICATION_STATUS.Expired,
}

const uiStatusToApi = {
  [FAS_APPLICATION_STATUS.Pending]: FAS_APPLICATION_STATUS_ID.Pending,
  [FAS_APPLICATION_STATUS.Approved]: FAS_APPLICATION_STATUS_ID.Approved,
  [FAS_APPLICATION_STATUS.Rejected]: FAS_APPLICATION_STATUS_ID.Rejected,
  [FAS_APPLICATION_STATUS.Withdrawn]: FAS_APPLICATION_STATUS_ID.Withdrawn,
  [FAS_APPLICATION_STATUS.Draft]: FAS_APPLICATION_STATUS_ID.Draft,
  [FAS_APPLICATION_STATUS.Expired]: FAS_APPLICATION_STATUS_ID.Expired,
}

const normalizeApplicationStatus = (status) =>
  apiStatusToUi[status] ??
  apiStatusToUi[String(status || '').toLowerCase()] ??
  FAS_APPLICATION_STATUS.Pending

const toDateOnly = (value) => (value ? String(value).slice(0, 10) : '')

const normalizePaginationCollection = (payload) => {
  const collection = Array.isArray(payload?.collection) ? payload.collection : []
  const pageSize = payload?.pageSize || 10
  const totalCount = payload?.totalCount ?? collection.length

  return {
    collection,
    totalCount,
    totalPage: payload?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize,
  }
}

const normalizeApplicationRow = (application) => {
  const status = normalizeApplicationStatus(application.status)
  return {
    id: application.applicationNumber || String(application.id),
    apiId: application.id,
    applicantName: application.accountName || '-',
    accountNumber: application.accountNumber || '-',
    schemeName: application.schemeName || '-',
    status,
    displayStatus: status,
    submittedAt: toDateOnly(application.submittedAt),
  }
}

const normalizeApplicationPage = (payload) => {
  const page = normalizePaginationCollection(payload)
  return {
    ...page,
    collection: page.collection.map(normalizeApplicationRow),
  }
}

const getBackendSort = (sort) => {
  if (!sort?.key) return 'createdAt asc'

  const sortFieldByTableKey = {
    id: 'applicationNumber',
    schemeName: 'schemeName',
    submittedAt: 'createdAt',
    displayStatus: 'status',
  }

  return `${sortFieldByTableKey[sort.key] || 'createdAt'} ${sort.direction}`
}

const formatCurrency = (value) =>
  value == null || value === ''
    ? '-'
    : `SS$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const formatSubsidy = (tier) => {
  const hasComponentValues = tier.courseValue != null || tier.miscValue != null
  if (hasComponentValues) {
    return `Course ${tier.courseValue ?? '-'}${tier.courseValue != null ? '%' : ''} · Misc ${
      tier.miscValue ?? '-'
    }${tier.miscValue != null ? '%' : ''}`
  }

  if (tier.value != null) return `${tier.value}%`
  return '-'
}

const formatTierCondition = (tier) => {
  const parts = []
  if (tier.maxPci != null) parts.push(`PCI ≤ ${Number(tier.maxPci).toLocaleString()}`)
  if (tier.maxGross != null) parts.push(`Gross ≤ ${Number(tier.maxGross).toLocaleString()}`)
  return parts.length ? parts.join(' and ') : '-'
}

const escapePdfText = (value) =>
  String(value || '-')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const createDocumentPreviewPdfUrl = ({ document, application }) => {
  const lines = [
    'Supporting document preview',
    `Application: ${application?.id || '-'}`,
    `Student: ${application?.applicantName || '-'} (${application?.accountNumber || '-'})`,
    `Scheme: ${application?.scheme?.name || '-'}`,
    `Document: ${document.name}`,
    `Uploaded file: ${document.fileName || '-'}`,
    `Storage key: ${document.fileKey || '-'}`,
    '',
    'This preview is generated from the stored document metadata.',
  ]

  const content = [
    'BT',
    '/F1 18 Tf',
    '72 744 Td',
    `(${escapePdfText(document.name)}) Tj`,
    '/F1 11 Tf',
    ...lines.map((line, index) => `${index === 0 ? '0 -34 Td' : '0 -18 Td'} (${escapePdfText(line)}) Tj`),
    'ET',
  ].join('\n')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object) => {
    offsets.push(pdf.length)
    pdf += `${object}\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }))
}

const normalizeApplicationDetail = (detail, summary = {}) => {
  const status = normalizeApplicationStatus(detail.status ?? summary.status)
  const studentProfile = detail.studentProfile || {}
  const scheme = detail.scheme || {}
  const systemSuggestedTier = detail.systemSuggestedTier
    ? {
        id: String(detail.systemSuggestedTier.id),
        apiId: detail.systemSuggestedTier.id,
        name: detail.systemSuggestedTier.tierName || '-',
        reason: detail.systemSuggestedTier.reason || '',
      }
    : null
  const approvedTier = detail.approvedTier
    ? {
        id: String(detail.approvedTier.id),
        apiId: detail.approvedTier.id,
        name: detail.approvedTier.tierName || '-',
      }
    : null

  const tiers = (scheme.tiers || []).map((tier) => ({
    id: String(tier.id),
    apiId: tier.id,
    name: tier.tierName || '-',
    maxPci: tier.maxPerCapitaIncome,
    maxGross: tier.maxGrossHouseholdIncome,
    value: tier.subsidyValue,
    courseValue: tier.courseFeeSubsidyValue,
    miscValue: tier.miscFeeSubsidyValue,
  }))

  const documents = (scheme.requiredDocuments || []).map((document) => ({
    id: String(document.requiredDocumentId),
    apiId: document.requiredDocumentId,
    applicationDocumentId: document.applicationDocumentId,
    name: document.documentName || '-',
    fileName: document.fileName,
    fileKey: document.fileKey,
  }))

  return {
    ...summary,
    id: detail.applicationNumber || summary.id || String(detail.id),
    apiId: detail.id ?? summary.apiId,
    status,
    displayStatus: status,
    data: {
      age: studentProfile.age,
      nationality: studentProfile.studentNationality,
      guardianNationality: studentProfile.guardianNationality,
      parentNationality: studentProfile.guardianNationality,
      income: studentProfile.grossHouseholdIncome,
      members: studentProfile.householdMembers,
      pci: studentProfile.perCapitaIncome,
    },
    systemSuggestedTier,
    approvedTier,
    tierOverrideHistories: (detail.tierOverrideHistories || []).map((history) => ({
      id: history.id,
      oldTierName: history.oldTierName,
      newTierName: history.newTierName,
      recommendationReason: history.recommendationReason,
      reason: history.reason,
      modifiedByName: history.modifiedByName,
      modifiedAt: history.modifiedAt,
    })),
    additionalAnswers: (detail.additionalAnswers || []).map((answer) => ({
      id: answer.id,
      questionText: answer.questionText || '',
      answerText: answer.answerText || '',
      isRequired: Boolean(answer.isRequired),
    })),
    scheme: {
      id: String(scheme.id || ''),
      apiId: scheme.id,
      name: scheme.schemeName || summary.schemeName || '-',
      tiers,
      documents,
    },
  }
}

const FasApplicationQueuePage = () => {
  const [filters, setFilters] = useState(defaultFasApplicationFilters)
  const [sort, setSort] = useState({ key: 'submittedAt', direction: 'asc' })
  const [sortChoice, setSortChoice] = useState('oldest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [reviewApplication, setReviewApplication] = useState(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      search: filters.search ? filters.search.trim() : undefined,
      status:
        filters.status && filters.status !== 'all'
          ? uiStatusToApi[filters.status]
          : undefined,
      sort: getBackendSort(sort),
    }),
    [filters.search, filters.status, page, pageSize, sort]
  )

  const applicationsQuery = useFetch(
    ApiUrls.FAS_APPLICATION_MANAGEMENT.INDEX,
    queryParams,
    [queryParams]
  )
  const detailSubmit = useAxiosSubmit({ method: 'GET' })
  const approveSubmit = useAxiosSubmit({ method: 'POST' })
  const rejectSubmit = useAxiosSubmit({ method: 'POST' })

  const applicationPage = useMemo(
    () => normalizeApplicationPage(applicationsQuery.data),
    [applicationsQuery.data]
  )

  const tableData = applicationPage

  const refreshApplications = async () => {
    await applicationsQuery.fetch()
  }

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  const updateSortChoice = (value) => {
    setSortChoice(value)
    setSort({ key: 'submittedAt', direction: value === 'newest' ? 'desc' : 'asc' })
    setPage(1)
  }

  const openReview = async (application) => {
    if (!application?.apiId) {
      message.error('Unable to load this application because its API id is missing.')
      return
    }

    const response = await detailSubmit.submit({
      overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.DETAIL(application.apiId),
    })
    if (response) {
      setReviewApplication(normalizeApplicationDetail(response.data || response, application))
    }
  }

  const closeReview = () => {
    setReviewApplication(null)
  }

  return (
    <div className="fas-management-shell">
      <Card>
        <Flex vertical gap={16}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            FAS Applications
          </Typography.Title>
          <FasApplicationFilterSection
            filters={filters}
            loading={applicationsQuery.loading}
            searchTitle="Search account, name, FAS, or app no."
            dateTitle="Submitted date"
            statusMode="single"
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
                { value: 'oldest', label: 'Oldest first' },
                { value: 'newest', label: 'Newest first' },
              ]}
              onChange={updateSortChoice}
            />
          </Flex>
          <FasAdminApplicationTableSection
            applications={tableData.collection}
            loading={
              applicationsQuery.loading ||
              detailSubmit.loading ||
              approveSubmit.loading ||
              rejectSubmit.loading
            }
            sort={sort}
            setSort={setSort}
            onReview={openReview}
          />
          <GenericTablePagination
            totalCount={tableData.totalCount}
            totalPage={tableData.totalPage}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            loading={applicationsQuery.loading}
          />

          <div className="fas-note">
            <strong>Review rule:</strong> Pending applications are decided one at a time. The tier is
            selected by the system from the scheme rules and student data.
          </div>
        </Flex>
      </Card>

      <ApplicationReviewModal
        key={reviewApplication?.apiId || 'empty-review'}
        application={reviewApplication}
        open={!!reviewApplication}
        loading={approveSubmit.loading || rejectSubmit.loading}
        onClose={closeReview}
        onApproved={async (application, approval) => {
          const response = await approveSubmit.submit({
            overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.APPROVE(application.apiId),
            overrideData: approval,
          })
          if (response) {
            message.success(`Approved ${application.id}`)
            closeReview()
            await refreshApplications()
          }
        }}
        onRejected={async (application, reason) => {
          const response = await rejectSubmit.submit({
            overrideUrl: ApiUrls.FAS_APPLICATION_MANAGEMENT.REJECT(application.apiId),
            overrideData: { RejectionReason: reason },
          })
          if (response) {
            message.success(`Rejected ${application.id}`)
            closeReview()
            await refreshApplications()
          }
        }}
      />
    </div>
  )
}

const ApplicationReviewModal = ({ application, open, loading, onClose, onApproved, onRejected }) => {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [selectedTierId, setSelectedTierId] = useState(
    application?.approvedTier?.id ||
      application?.systemSuggestedTier?.id ||
      null
  )
  const [overrideReason, setOverrideReason] = useState('')

  const close = () => {
    setRejectOpen(false)
    setReason('')
    setOverrideReason('')
    onClose()
  }

  const reject = async () => {
    if (!reason.trim()) {
      message.error('Enter a rejection reason')
      return
    }

    await onRejected?.(application, reason.trim())
  }

  if (!application) return null

  const scheme = application.scheme
  const isPending = application.status === FAS_APPLICATION_STATUS.Pending
  const title = `${isPending ? 'Review' : 'View'} · ${application.id}`
  const isOverride =
    Boolean(selectedTierId && application.systemSuggestedTier?.id) &&
    selectedTierId !== application.systemSuggestedTier.id
  const canApprove = Boolean(application.systemSuggestedTier && selectedTierId)

  const approve = async () => {
    if (!canApprove) return
    if (isOverride && overrideReason.trim().length < 10) {
      message.error('Enter an override reason with at least 10 characters')
      return
    }

    await onApproved?.(application, {
      approvedTierId: Number(selectedTierId),
      reason: isOverride ? overrideReason.trim() : undefined,
    })
  }

  return (
    <Modal title={title} open={open} onCancel={close} footer={null} width={680}>
      <Spin spinning={loading}>
        <Flex vertical gap={14}>
          {!isPending && (
            <div className="fas-kv">
              <div className="fas-kv-row">
                <span>Student</span>
                <strong>
                  {application.applicantName} · {application.accountNumber}
                </strong>
              </div>
              <div className="fas-kv-row">
                <span>Scheme</span>
                <strong>{scheme.name}</strong>
              </div>
              <div className="fas-kv-row">
                <span>Result</span>
                <strong>{statusLabel(application.status)}</strong>
              </div>
            </div>
          )}

          <StudentDataBlock application={application} />

          <div>
            <div className="fas-section-label" style={{ marginBottom: 7 }}>
              Tier selection
            </div>
            <TierTable
              scheme={scheme}
              selectedTierId={selectedTierId}
              systemTierId={application.systemSuggestedTier?.id}
              approvedTierId={application.approvedTier?.id}
              selectable={isPending && Boolean(application.systemSuggestedTier)}
              onSelectTier={setSelectedTierId}
            />
            {application.systemSuggestedTier ? (
              <div className="fas-suggest">
                System recommended <strong>{application.systemSuggestedTier.name}</strong>
                {application.systemSuggestedTier.reason
                  ? ` · ${application.systemSuggestedTier.reason}`
                  : ''}
              </div>
            ) : (
              <div className="fas-suggest fas-suggest-danger">
                No eligible tier was recommended. Approve is disabled.
              </div>
            )}
            {application.approvedTier && (
              <div className="fas-suggest">
                Approved tier <strong>{application.approvedTier.name}</strong>
              </div>
            )}
            {isPending && isOverride && (
              <div style={{ marginTop: 10 }}>
                <label className="fas-field-label">Override reason</label>
                <Input.TextArea
                  value={overrideReason}
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder="Reason for approving a different tier"
                  onChange={(event) => setOverrideReason(event.target.value)}
                />
              </div>
            )}
          </div>

          <TierOverrideHistory histories={application.tierOverrideHistories} />
          <AdditionalAnswers answers={application.additionalAnswers} />
          <RequiredDocuments documents={scheme.documents} application={application} />

          {isPending && (
            <>
              <Flex gap={8}>
                <Button
                  type="primary"
                  disabled={!canApprove}
                  loading={loading}
                  style={{ flex: 1 }}
                  onClick={approve}
                >
                  {selectedTierId
                    ? `Approve · ${
                        scheme.tiers.find((tier) => tier.id === selectedTierId)?.name ||
                        application.systemSuggestedTier?.name ||
                        'Selected tier'
                      }`
                    : 'Approve'}
                </Button>
                <Button danger style={{ flex: 1 }} onClick={() => setRejectOpen(true)}>
                  Reject
                </Button>
              </Flex>

              {rejectOpen && (
                <div>
                  <Input.TextArea
                    value={reason}
                    rows={3}
                    placeholder="Reason, e.g. Income documents incomplete"
                    onChange={(event) => setReason(event.target.value)}
                  />
                  <Flex gap={8} style={{ marginTop: 8 }}>
                    <Button danger type="primary" loading={loading} onClick={reject}>
                      Confirm reject
                    </Button>
                    <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
                  </Flex>
                </div>
              )}
            </>
          )}
        </Flex>
      </Spin>
    </Modal>
  )
}

const StudentDataBlock = ({ application }) => (
  <div className="fas-kv">
    <div className="fas-kv-row">
      <span>Student age</span>
      <strong>{application.data?.age || '-'}</strong>
    </div>
    <div className="fas-kv-row">
      <span>Student nationality</span>
      <strong>{application.data?.nationality || '-'}</strong>
    </div>
    <div className="fas-kv-row">
      <span>Guardian nationality</span>
      <strong>
        {application.data?.guardianNationality || application.data?.parentNationality || '-'}
      </strong>
    </div>
    <div className="fas-kv-row">
      <span>Gross household income</span>
      <strong>{formatCurrency(application.data?.income)}</strong>
    </div>
    <div className="fas-kv-row">
      <span>Members</span>
      <strong>{application.data?.members || '-'}</strong>
    </div>
    <div className="fas-kv-row">
      <span>Per-capita income (PCI)</span>
      <strong>{formatCurrency(application.data?.pci)}</strong>
    </div>
  </div>
)

const TierTable = ({
  scheme,
  selectedTierId,
  systemTierId,
  approvedTierId,
  selectable,
  onSelectTier,
}) => (
  <table className="fas-tier-table">
    <thead>
      <tr>
        <th>Tier</th>
        <th>Condition</th>
        <th>Subsidy</th>
      </tr>
    </thead>
    <tbody>
      {scheme.tiers.length ? (
        scheme.tiers.map((tier) => {
          const isSelected = tier.id === selectedTierId
          const isSystemTier = tier.id === systemTierId
          const isApprovedTier = tier.id === approvedTierId

          return (
            <tr
              key={tier.id}
              className={`${isSystemTier ? 'is-system-tier' : ''} ${
                isSelected ? 'is-selected' : ''
              }`.trim()}
              onClick={() => {
                if (selectable) onSelectTier?.(tier.id)
              }}
              style={{ cursor: selectable ? 'pointer' : 'default' }}
            >
              <td>
                {selectable ? (
                  <Radio checked={isSelected} onChange={() => onSelectTier?.(tier.id)}>
                    {tier.name}
                  </Radio>
                ) : (
                  tier.name
                )}
                {isSystemTier ? ' · recommended' : ''}
                {isApprovedTier ? ' · approved' : ''}
              </td>
              <td>{formatTierCondition(tier)}</td>
              <td>{formatSubsidy(tier)}</td>
            </tr>
          )
        })
      ) : (
        <tr>
          <td colSpan={3}>No tiers available</td>
        </tr>
      )}
    </tbody>
  </table>
)

const TierOverrideHistory = ({ histories = [] }) => {
  if (!histories.length) return null

  return (
    <div>
      <div className="fas-section-label" style={{ marginBottom: 7 }}>
        Tier override history
      </div>
      <div className="fas-kv">
        {histories.map((history) => (
          <div className="fas-kv-row" key={history.id}>
            <span>
              {history.oldTierName || 'Recommended tier'} {'->'} {history.newTierName || 'Approved tier'}
            </span>
            <strong>
              {history.reason}
              {history.modifiedByName ? ` · ${history.modifiedByName}` : ''}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const AdditionalAnswers = ({ answers = [] }) => (
  <div>
    <div className="fas-section-label" style={{ marginBottom: 7 }}>
      Additional question answers
    </div>
    {answers.length ? (
      <div className="fas-kv">
        {answers.map((answer) => (
          <div className="fas-kv-row" key={answer.id || answer.questionText}>
            <span>
              {answer.questionText}
              {answer.isRequired ? (
                <Tag color="blue" style={{ marginLeft: 6 }}>
                  Required
                </Tag>
              ) : null}
            </span>
            <strong>{answer.answerText || '-'}</strong>
          </div>
        ))}
      </div>
    ) : (
      <span className="fas-muted">No additional answers submitted.</span>
    )}
  </div>
)

const RequiredDocuments = ({ documents = [], application }) => {
  const [documentPreview, setDocumentPreview] = useState(null)

  const closePreview = () => {
    if (documentPreview?.generated) {
      URL.revokeObjectURL(documentPreview.url)
    }
    setDocumentPreview(null)
  }

  const openDocument = (document) => {
    if (!document.fileName && !document.fileKey) {
      message.warning('Document is missing')
      return
    }

    const title = `${document.name} · ${document.fileName || 'Document'}`
    const directUrl =
      document.fileKey && /^(https?:|blob:|data:|\/)/i.test(document.fileKey)
        ? document.fileKey
        : null

    setDocumentPreview({
      title,
      url: directUrl || createDocumentPreviewPdfUrl({ document, application }),
      generated: !directUrl,
    })
  }

  return (
    <>
      <div>
        <div className="fas-section-label" style={{ marginBottom: 7 }}>
          Supporting documents to verify
        </div>
        <Flex gap={6} wrap="wrap">
          {documents.length ? (
            documents.map((document) => {
              const attached = Boolean(document.fileName || document.fileKey)
              return (
                <Tag
                  color={attached ? 'blue' : 'default'}
                  key={document.id}
                  style={{ cursor: attached ? 'pointer' : 'default' }}
                  onClick={() => openDocument(document)}
                >
                  {document.name} · {attached ? document.fileName || 'View PDF' : 'Missing'}
                </Tag>
              )
            })
          ) : (
            <span className="fas-muted">No documents required</span>
          )}
        </Flex>
      </div>

      <Modal
        title={documentPreview?.title || 'Document preview'}
        open={!!documentPreview}
        onCancel={closePreview}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {documentPreview?.url ? (
          <iframe
            title={documentPreview.title}
            src={documentPreview.url}
            style={{ width: '100%', height: '72vh', border: 0, borderRadius: 8 }}
          />
        ) : (
          <span className="fas-muted">No document available.</span>
        )}
      </Modal>
    </>
  )
}

export default FasApplicationQueuePage
