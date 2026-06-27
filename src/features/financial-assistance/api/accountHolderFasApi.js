import { FAS_APPLICATION_STATUS } from '@/features/financial-assistance/data/fasSeedData'

export const FAS_GUARDIAN_NATIONALITY = {
  SingaporeCitizen: 1,
  Other: 2,
}

const FAS_DRAFT_STATUS = 'draft'

const API_STATUS_TO_UI = {
  1: FAS_APPLICATION_STATUS.Pending,
  2: FAS_APPLICATION_STATUS.Approved,
  3: FAS_APPLICATION_STATUS.Rejected,
  4: FAS_APPLICATION_STATUS.Withdrawn,
  5: FAS_DRAFT_STATUS,
  pending: FAS_APPLICATION_STATUS.Pending,
  approved: FAS_APPLICATION_STATUS.Approved,
  rejected: FAS_APPLICATION_STATUS.Rejected,
  withdrawn: FAS_APPLICATION_STATUS.Withdrawn,
  draft: FAS_DRAFT_STATUS,
}

const UI_STATUS_TO_API = {
  [FAS_APPLICATION_STATUS.Pending]: 1,
  [FAS_APPLICATION_STATUS.Approved]: 2,
  [FAS_APPLICATION_STATUS.Rejected]: 3,
  [FAS_APPLICATION_STATUS.Withdrawn]: 4,
}

const toDateOnly = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const getPci = (income, members) => {
  const normalizedIncome = Number(income)
  const normalizedMembers = Number(members)
  if (!Number.isFinite(normalizedIncome) || !Number.isFinite(normalizedMembers)) return null
  if (normalizedIncome < 0 || normalizedMembers <= 0) return null
  return Math.round(normalizedIncome / normalizedMembers)
}

const getAgeFromDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return null

  const birthDate = new Date(String(dateOfBirth).slice(0, 10) + 'T00:00:00')
  if (Number.isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDelta = today.getMonth() - birthDate.getMonth()

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

export const toGuardianNationalityApi = (value) =>
  String(value || '').toLowerCase().includes('singapore')
    ? FAS_GUARDIAN_NATIONALITY.SingaporeCitizen
    : FAS_GUARDIAN_NATIONALITY.Other

export const fromNationalityApi = (value) => {
  if (value === FAS_GUARDIAN_NATIONALITY.SingaporeCitizen) return 'Singapore Citizen'
  if (typeof value === 'string' && value.toLowerCase().includes('singapore')) {
    return 'Singapore Citizen'
  }
  return 'Other'
}

export const toApiApplicationStatus = (status) => UI_STATUS_TO_API[status]

export const fromApiApplicationStatus = (status) =>
  API_STATUS_TO_UI[String(status).toLowerCase()] || API_STATUS_TO_UI[status] || status

export const isApiApprovedExpired = (application) => {
  const status = fromApiApplicationStatus(application?.status)
  const endDateValue = application?.validityEndDate || application?.endDate
  if (status !== FAS_APPLICATION_STATUS.Approved || !endDateValue) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(toDateOnly(endDateValue) + 'T00:00:00')
  return endDate < today
}

const normalizeSubsidyType = (value) =>
  String(value || '').toLowerCase().includes('fixed') ? 'fixed' : 'percent'

const normalizeRequiredDocument = (document) => ({
  id: String(document.id),
  apiId: document.id,
  name: document.documentName || 'Required document',
  templateName: document.templateName || document.templateUrl || '',
  templateUrl: document.templateUrl || '',
})

const normalizeApplicationDocument = (document) => ({
  id: String(document.requiredDocumentId),
  apiId: document.requiredDocumentId,
  name: document.documentNameSnapshot || 'Required document',
  templateName: document.templateName || '',
  templateUrl: document.templateUrl || '',
  fileName: document.fileName,
  fileKey: document.fileKey,
})

export const normalizeApiScheme = (scheme) => {
  if (!scheme) return null

  const subsidyType = normalizeSubsidyType(scheme.subsidyType)
  const perComponent = Boolean(scheme.isPerComponent)

  return {
    id: String(scheme.id),
    apiId: scheme.apiId ?? scheme.id,
    code: scheme.schemeCode || scheme.code,
    name: scheme.schemeName || scheme.name || scheme.schemeCode || String(scheme.id),
    description: scheme.description || 'Financial assistance scheme for eligible students.',
    status: 'active',
    subsidyType,
    validityMonths: scheme.durationInMonths || scheme.validityMonths || 12,
    linkedCourses: scheme.linkedCourses || [],
    conditionsSummary: scheme.conditionsSummary || [],
    reapplyFallback: Boolean(scheme.reapplyFallback),
    tiers: (scheme.tiers || []).map((tier, index) => {
      const maxPci = tier.maxPerCapitaIncome ?? tier.maxPci ?? ''
      return {
        id: String(tier.id ?? index + 1),
        apiId: tier.apiId ?? tier.id,
        name: tier.tierName || tier.name || `Tier ${index + 1}`,
        conditionText: maxPci !== '' && maxPci != null ? `PCI ≤ ${Number(maxPci).toLocaleString()}` : '',
        maxPci,
        perComponent,
        value: tier.subsidyValue ?? tier.value ?? '',
        courseValue: tier.courseFeeSubsidyValue ?? tier.courseValue ?? '',
        miscValue: tier.miscFeeSubsidyValue ?? tier.miscValue ?? '',
        displayOrder: tier.displayOrder ?? index + 1,
      }
    }),
    documents: (scheme.requiredDocuments || []).map(normalizeRequiredDocument),
  }
}

export const normalizeApiAvailableSchemesResponse = (payload) => {
  const data = payload?.schemes ? payload : payload?.data?.schemes ? payload.data : payload
  if (!data || !Array.isArray(data.schemes)) {
    return { calculatedPerCapitaIncome: null, schemes: null }
  }

  return {
    calculatedPerCapitaIncome: data.calculatedPerCapitaIncome ?? null,
    schemes: data.schemes.map(normalizeApiScheme).filter(Boolean),
  }
}

export const buildAvailableSchemesParams = ({ shown, profile }) => ({
  Page: 1,
  PageSize: 100,
  Sort: 'schemeName asc',
  ...(shown
    ? {
        GrossHouseholdIncome: Number(profile.income || 0),
        HouseholdMemberCount: Number(profile.members || 0),
        GuardianNationality: toGuardianNationalityApi(profile.parentNationality),
      }
    : {}),
})

export const normalizeFasProfileFromApi = (payload, fallback) => {
  const accountHolder = payload?.data || payload
  if (!accountHolder) return fallback

  const isSingaporeCitizen =
    typeof accountHolder.isSingaporeCitizen === 'boolean'
      ? accountHolder.isSingaporeCitizen
      : typeof accountHolder.isSingaporean === 'boolean'
        ? accountHolder.isSingaporean
        : undefined

  return {
    ...fallback,
    name: accountHolder.name || fallback?.name,
    accountNumber: accountHolder.accountNumber || fallback?.accountNumber,
    age:
      getAgeFromDateOfBirth(accountHolder.dateOfBirth) ??
      accountHolder.age ??
      fallback?.age,
    nationality:
      typeof isSingaporeCitizen === 'boolean'
        ? isSingaporeCitizen
          ? 'Singapore Citizen'
          : 'Other'
        : accountHolder.nationality || fallback?.nationality,
    parentNationality: accountHolder.parentNationality || fallback?.parentNationality,
    income: accountHolder.monthlyHouseholdIncome ?? fallback?.income,
    members: accountHolder.householdMembers ?? fallback?.members,
  }
}

export const normalizeFasSnapshotProfile = (snapshot, fallback) => {
  if (!snapshot) return null

  return {
    ...fallback,
    name: snapshot.name || fallback?.name,
    accountNumber: snapshot.accountNumber || fallback?.accountNumber,
    age: snapshot.age ?? snapshot.studentAgeSnapshot ?? fallback?.age,
    nationality:
      snapshot.nationality || fromNationalityApi(snapshot.studentNationalitySnapshot) || fallback?.nationality,
    parentNationality:
      snapshot.parentNationality ||
      fromNationalityApi(snapshot.guardianNationalitySnapshot) ||
      fallback?.parentNationality,
    income: snapshot.income ?? snapshot.grossHouseholdIncomeSnapshot ?? fallback?.income,
    members: snapshot.members ?? snapshot.householdMemberCountSnapshot ?? fallback?.members,
  }
}

export const buildSubmitFasApplicationPayload = ({ scheme, profile, documents, attachedDocs }) => ({
  FasSchemeId: scheme.apiId,
  GuardianNationality: toGuardianNationalityApi(profile.parentNationality),
  GrossHouseholdIncome: Number(profile.income || 0),
  HouseholdMemberCount: Number(profile.members || 0),
  Documents: documents.map((document) => {
    const attachment = attachedDocs[document.id]
    return {
      RequiredDocumentId: document.apiId,
      FileName: attachment?.fileName || document.name,
      FileKey: attachment?.fileKey || attachment?.fileName || document.templateUrl || document.name,
    }
  }),
})

const normalizePaginationCollection = (payload) => {
  const data = Array.isArray(payload)
    ? payload
    : payload?.collection || payload?.items
      ? payload
      : payload?.data || payload
  const collection = Array.isArray(data?.collection)
    ? data.collection
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : []
  const pageSize = data?.pageSize || 10
  const totalCount = data?.totalCount ?? data?.total ?? collection.length

  return {
    collection,
    totalCount,
    totalPage: data?.totalPage ?? data?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize: data?.pageSize,
  }
}

const getApplicationApiId = (application) =>
  application?.id ?? application?.applicationId ?? application?.fasApplicationId

export const normalizeApiApplicationSummary = (application) => {
  const status = fromApiApplicationStatus(application.status)
  const apiId = getApplicationApiId(application)
  const normalized = {
    id: application.applicationNumber || (apiId != null ? String(apiId) : '-'),
    apiId,
    applicationNumber: application.applicationNumber,
    schemeId: application.schemeId != null ? String(application.schemeId) : undefined,
    schemeName: application.schemeName || '-',
    status,
    displayStatus: status,
    submittedAt: toDateOnly(application.submittedAt || application.createdAt),
    approvedAt: toDateOnly(application.approvedDate || application.approvedAt),
    endDate: toDateOnly(application.validityEndDate),
    reason: application.rejectionReason || 'N/A',
  }

  if (isApiApprovedExpired(normalized)) {
    normalized.displayStatus = 'expired'
  }

  return normalized
}

export const normalizeApiApplicationPage = (payload) => {
  const page = normalizePaginationCollection(payload)
  return {
    ...page,
    collection: page.collection.map(normalizeApiApplicationSummary),
  }
}

const mapApprovedTierToUi = (approvedTier) => {
  if (!approvedTier) return null

  return {
    id: 'approved-tier',
    name: approvedTier.tierName || 'Approved tier',
    maxPci: '',
    perComponent:
      approvedTier.courseFeeSubsidyValue != null || approvedTier.miscFeeSubsidyValue != null,
    value: approvedTier.subsidyValue ?? '',
    courseValue: approvedTier.courseFeeSubsidyValue ?? '',
    miscValue: approvedTier.miscFeeSubsidyValue ?? '',
  }
}

export const normalizeApiApplicationDetail = (payload, summary = {}) => {
  const detail = payload?.data || payload
  if (!detail) return null

  const status = fromApiApplicationStatus(detail.status)
  const approvedTier = mapApprovedTierToUi(detail.approvedTier)
  const schemeId = detail.scheme?.id != null ? String(detail.scheme.id) : summary.schemeId
  const profileSnapshot = {
    age: detail.studentAgeSnapshot,
    nationality: fromNationalityApi(detail.studentNationalitySnapshot),
    parentNationality: fromNationalityApi(detail.guardianNationalitySnapshot),
    income: detail.grossHouseholdIncomeSnapshot,
    members: detail.householdMemberCountSnapshot,
    pci:
      detail.perCapitaIncomeSnapshot ??
      getPci(detail.grossHouseholdIncomeSnapshot, detail.householdMemberCountSnapshot),
  }

  const apiId = getApplicationApiId(detail)
  const application = {
    ...summary,
    id: detail.applicationNumber || summary.id || (apiId != null ? String(apiId) : '-'),
    apiId,
    applicationNumber: detail.applicationNumber,
    schemeId,
    schemeName: detail.scheme?.schemeName || summary.schemeName,
    status,
    displayStatus: status,
    submittedAt: toDateOnly(detail.createdAt),
    approvedAt: toDateOnly(detail.approvedAt),
    validFrom: toDateOnly(detail.validityStartDate),
    endDate: toDateOnly(detail.validityEndDate),
    reason: detail.rejectionReason || summary.reason,
    data: profileSnapshot,
    profileSnapshot,
    approvedTier,
    tierId: approvedTier?.id,
    attachments: detail.documents || [],
  }

  if (isApiApprovedExpired(application)) {
    application.displayStatus = 'expired'
  }

  application.scheme = {
    id: schemeId,
    apiId: detail.scheme?.id ?? Number(schemeId),
    code: detail.scheme?.schemeCode,
    name: detail.scheme?.schemeName || summary.schemeName || '-',
    description: detail.scheme?.description || '',
    status: 'active',
    subsidyType: approvedTier?.subsidyValue != null ? 'fixed' : 'percent',
    validityMonths: summary.scheme?.validityMonths || 12,
    linkedCourses: [],
    conditionsSummary: [],
    reapplyFallback: true,
    tiers: approvedTier ? [approvedTier] : [],
    documents: (detail.documents || [])
      .filter((document) => document.requiredDocumentId != null)
      .map(normalizeApplicationDocument),
  }

  return application
}
