import { FAS_APPLICATION_STATUS } from '@/features/financial-assistance/data/fasSeedData'

export const FAS_GUARDIAN_NATIONALITY = {
  SingaporeCitizen: 1,
  Other: 2,
}

const API_STATUS_TO_UI = {
  1: FAS_APPLICATION_STATUS.Pending,
  2: FAS_APPLICATION_STATUS.Approved,
  3: FAS_APPLICATION_STATUS.Rejected,
  4: FAS_APPLICATION_STATUS.Withdrawn,
  pending: FAS_APPLICATION_STATUS.Pending,
  approved: FAS_APPLICATION_STATUS.Approved,
  rejected: FAS_APPLICATION_STATUS.Rejected,
  withdrawn: FAS_APPLICATION_STATUS.Withdrawn,
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

export const normalizeApiScheme = (scheme) => {
  if (!scheme) return null

  const subsidyType = normalizeSubsidyType(scheme.subsidyType)
  const perComponent = Boolean(scheme.isPerComponent)

  return {
    id: String(scheme.id),
    apiId: scheme.id,
    code: scheme.schemeCode,
    name: scheme.schemeName || scheme.name || scheme.schemeCode || String(scheme.id),
    description: scheme.description || 'Financial assistance scheme for eligible students.',
    status: 'active',
    subsidyType,
    validityMonths: scheme.durationInMonths || scheme.validityMonths || 12,
    linkedCourses: [],
    conditionsSummary: scheme.conditionsSummary || [],
    tiers: (scheme.tiers || []).map((tier, index) => {
      const maxPci = tier.maxPerCapitaIncome ?? tier.maxPci ?? ''
      return {
        id: String(tier.id ?? index + 1),
        apiId: tier.id,
        name: tier.tierName || tier.name || `Tier ${index + 1}`,
        conditionText: maxPci !== '' && maxPci != null ? `PCI ≤ ${Number(maxPci).toLocaleString()}` : '',
        maxPci,
        perComponent,
        value: tier.subsidyValue ?? '',
        courseValue: tier.courseFeeSubsidyValue ?? '',
        miscValue: tier.miscFeeSubsidyValue ?? '',
        displayOrder: tier.displayOrder ?? index + 1,
      }
    }),
    documents: (scheme.requiredDocuments || scheme.documents || []).map((document) => ({
      id: String(document.id),
      apiId: document.id,
      name: document.documentName || document.name || 'Required document',
      templateName: document.templateUrl || '',
      templateUrl: document.templateUrl || '',
    })),
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

export const buildAvailableSchemesParams = ({ shown, profile }) => {
  if (!shown) return {}

  return {
    grossHouseholdIncome: Number(profile.income || 0),
    householdMemberCount: Number(profile.members || 0),
    guardianNationality: toGuardianNationalityApi(profile.parentNationality),
  }
}

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

export const buildSubmitFasApplicationFormData = ({ scheme, profile, documents, attachedDocs }) => {
  const formData = new FormData()
  formData.append('FasSchemeId', scheme.apiId ?? scheme.id)
  formData.append('GuardianNationality', toGuardianNationalityApi(profile.parentNationality))
  formData.append('GrossHouseholdIncome', Number(profile.income || 0))
  formData.append('HouseholdMemberCount', Number(profile.members || 0))

  documents.forEach((document, index) => {
    const attachment = attachedDocs[document.id]
    formData.append(`Documents[${index}].RequiredDocumentId`, document.apiId ?? document.id)
    formData.append(`Documents[${index}].FileName`, attachment?.fileName || document.name)
    formData.append(
      `Documents[${index}].FileKey`,
      attachment?.fileKey || attachment?.fileName || document.templateUrl || document.name
    )
  })

  return formData
}

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

export const normalizeApiApplicationSummary = (application) => {
  const status = fromApiApplicationStatus(application.status)
  const normalized = {
    id: application.applicationNumber || String(application.id),
    apiId: application.id,
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

export const normalizeApiApplicationDetail = (detail, summary = {}) => {
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

  const application = {
    ...summary,
    id: detail.applicationNumber || summary.id || String(detail.id),
    apiId: detail.id,
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
    apiId: detail.scheme?.id,
    code: detail.scheme?.schemeCode,
    name: detail.scheme?.schemeName || summary.schemeName || '-',
    description: detail.scheme?.description || '',
    subsidyType: approvedTier?.subsidyValue != null ? 'fixed' : 'percent',
    validityMonths: undefined,
    tiers: approvedTier ? [approvedTier] : [],
  }

  return application
}
