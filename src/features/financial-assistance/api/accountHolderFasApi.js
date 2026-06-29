import { FAS_APPLICATION_STATUS, FAS_STATUS } from '@/features/financial-assistance/data/fasSeedData'
import { EnumConfig } from '@/shared/config/enumConfig'

export const FAS_GUARDIAN_NATIONALITY = EnumConfig.FasGuardianNationalityId

const API_STATUS_TO_UI = {
  [EnumConfig.FasApplicationStatusId.Pending]: FAS_APPLICATION_STATUS.Pending,
  [EnumConfig.FasApplicationStatusId.Approved]: FAS_APPLICATION_STATUS.Approved,
  [EnumConfig.FasApplicationStatusId.Rejected]: FAS_APPLICATION_STATUS.Rejected,
  [EnumConfig.FasApplicationStatusId.Withdrawn]: FAS_APPLICATION_STATUS.Withdrawn,
  [EnumConfig.FasApplicationStatusId.Draft]: FAS_APPLICATION_STATUS.Draft,
  [EnumConfig.FasApplicationStatusId.Expired]: FAS_APPLICATION_STATUS.Expired,
  [EnumConfig.FasApplicationStatus.Pending]: FAS_APPLICATION_STATUS.Pending,
  [EnumConfig.FasApplicationStatus.Approved]: FAS_APPLICATION_STATUS.Approved,
  [EnumConfig.FasApplicationStatus.Rejected]: FAS_APPLICATION_STATUS.Rejected,
  [EnumConfig.FasApplicationStatus.Withdrawn]: FAS_APPLICATION_STATUS.Withdrawn,
  [EnumConfig.FasApplicationStatus.Draft]: FAS_APPLICATION_STATUS.Draft,
  [EnumConfig.FasApplicationStatus.Expired]: FAS_APPLICATION_STATUS.Expired,
}

const UI_STATUS_TO_API = {
  [FAS_APPLICATION_STATUS.Pending]: EnumConfig.FasApplicationStatusId.Pending,
  [FAS_APPLICATION_STATUS.Approved]: EnumConfig.FasApplicationStatusId.Approved,
  [FAS_APPLICATION_STATUS.Rejected]: EnumConfig.FasApplicationStatusId.Rejected,
  [FAS_APPLICATION_STATUS.Withdrawn]: EnumConfig.FasApplicationStatusId.Withdrawn,
}

const API_SCHEME_STATUS_TO_UI = {
  1: FAS_STATUS.Draft,
  2: FAS_STATUS.Active,
  3: FAS_STATUS.Inactive,
  [EnumConfig.FasSchemeStatus.Draft]: FAS_STATUS.Draft,
  [EnumConfig.FasSchemeStatus.Active]: FAS_STATUS.Active,
  [EnumConfig.FasSchemeStatus.Inactive]: FAS_STATUS.Inactive,
  Draft: FAS_STATUS.Draft,
  Active: FAS_STATUS.Active,
  Inactive: FAS_STATUS.Inactive,
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
  API_STATUS_TO_UI[status] ?? API_STATUS_TO_UI[String(status).toLowerCase()] ?? status

export const fromApiSchemeStatus = (status, fallback) =>
  API_SCHEME_STATUS_TO_UI[status] ??
  API_SCHEME_STATUS_TO_UI[String(status).toLowerCase()] ??
  fallback

export const isApiApprovedExpired = (application) => {
  const status = fromApiApplicationStatus(application?.status)
  const endDateValue = application?.validityEndDate || application?.endDate
  if (status !== FAS_APPLICATION_STATUS.Approved || !endDateValue) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(toDateOnly(endDateValue) + 'T00:00:00')
  return endDate < today
}

const normalizeRequiredDocument = (document) => ({
  id: String(document.id),
  apiId: document.id,
  name: document.documentName,
  templateName: document.templateName,
  templateUrl: document.templateUrl,
})

const normalizeApplicationDocument = (document) => ({
  id: String(document.requiredDocumentId),
  apiId: document.requiredDocumentId,
  name: document.documentNameSnapshot,
  templateName: document.templateName,
  templateUrl: document.templateUrl,
  fileName: document.fileName,
  fileKey: document.fileKey,
})

export const normalizeApiScheme = (scheme) => {
  if (!scheme) return null

  const perComponent = Boolean(scheme.isPerComponent)

  return {
    id: String(scheme.id),
    apiId: scheme.id,
    code: scheme.schemeCode,
    name: scheme.schemeName,
    description: scheme.description,
    status: fromApiSchemeStatus(scheme.status, FAS_STATUS.Active),
    subsidyType: scheme.subsidyType,
    validityMonths: scheme.durationInMonths,
    linkedCourses: scheme.linkedCourses || [],
    conditionsSummary: scheme.conditionsSummary || [],
    reapplyFallback: Boolean(scheme.reapplyFallback),
    tiers: (scheme.tiers || []).map((tier, index) => ({
      id: String(tier.id),
      apiId: tier.id,
      name: tier.tierName,
      conditionText:
        tier.maxPerCapitaIncome != null ? `PCI ≤ ${Number(tier.maxPerCapitaIncome).toLocaleString()}` : '',
      maxPci: tier.maxPerCapitaIncome,
      perComponent,
      value: tier.subsidyValue,
      courseValue: tier.courseFeeSubsidyValue,
      miscValue: tier.miscFeeSubsidyValue,
      displayOrder: tier.displayOrder ?? index + 1,
    })),
    documents: (scheme.requiredDocuments || []).map(normalizeRequiredDocument),
  }
}

export const normalizeApiAvailableSchemesResponse = (payload) => {
  if (!payload || !Array.isArray(payload.schemes)) {
    return { calculatedPerCapitaIncome: null, schemes: null }
  }

  return {
    calculatedPerCapitaIncome: payload.calculatedPerCapitaIncome,
    schemes: payload.schemes.map(normalizeApiScheme).filter(Boolean),
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

export const normalizeFasProfileFromApi = (accountHolder, fallback) => {
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
  const collection = Array.isArray(payload?.collection) ? payload.collection : []
  const pageSize = payload?.pageSize || 10
  const totalCount = payload?.totalCount ?? collection.length

  return {
    collection,
    totalCount,
    totalPage: payload?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize: payload?.pageSize,
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
    normalized.displayStatus = FAS_APPLICATION_STATUS.Expired
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
    application.displayStatus = FAS_APPLICATION_STATUS.Expired
  }

  application.scheme = {
    id: schemeId,
    apiId: detail.scheme?.id ?? Number(schemeId),
    code: detail.scheme?.schemeCode,
    name: detail.scheme?.schemeName || summary.schemeName || '-',
    description: detail.scheme?.description || '',
    status: fromApiSchemeStatus(detail.scheme?.status, FAS_STATUS.Active),
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
