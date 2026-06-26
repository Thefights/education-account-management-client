import {
  FAS_APPLICATION_STATUS,
  FAS_STATUS,
  MOCK_ACCOUNT_HOLDER,
  MOCK_SCHOOL_ADMIN,
  createEmptyScheme,
  createFasConditionGroupFromFlat,
  createInitialFasState,
  normalizeFasConditionGroup,
  rekeyFasConditionGroup,
} from '@/features/financial-assistance/data/fasSeedData'
import { getPci } from '@/features/financial-assistance/utils/fasRules'
import { useSyncExternalStore } from 'react'

const mockStateVersion = 8
const storageKey = 'education-account-management.fasMock.v8'

const clone = (value) => JSON.parse(JSON.stringify(value))

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage

const readState = () => {
  if (!canUseStorage()) return createInitialFasState()

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return createInitialFasState()

    const parsed = JSON.parse(raw)
    if (parsed?.version !== mockStateVersion || !Array.isArray(parsed.schemes)) {
      return createInitialFasState()
    }

    return parsed
  } catch {
    return createInitialFasState()
  }
}

let state = readState()
const subscribers = new Set()

const persist = () => {
  if (!canUseStorage()) return
  window.localStorage.setItem(storageKey, JSON.stringify(state))
}

const emit = () => {
  persist()
  subscribers.forEach((callback) => callback())
}

const updateState = (updater) => {
  state = updater(clone(state))
  emit()
}

const nextSchemeId = (schemes) => {
  const nextNumber =
    schemes.reduce((max, scheme) => {
      const number = Number(String(scheme.id || '').replace('FAS-', ''))
      return Number.isFinite(number) ? Math.max(max, number) : max
    }, 0) + 1

  return `FAS-${String(nextNumber).padStart(3, '0')}`
}

const nextApplicationId = (applications) => {
  const nextNumber =
    applications.reduce((max, application) => {
      const number = Number(String(application.id || '').replace('APP-', '').replace('APP-7', '7'))
      return Number.isFinite(number) ? Math.max(max, number) : max
    }, 7000) + 1

  return `APP-${nextNumber}`
}

const addAuditLog = (draft, action, subject, details = {}) => {
  draft.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    at: new Date().toISOString(),
    action,
    subject,
    ...details,
  })
}

const addMonths = (dateString, months) => {
  const [year, month, day] = String(dateString || '')
    .split('-')
    .map(Number)

  if (!year || !month || !day) return ''

  const totalMonths = month - 1 + Number(months || 12)
  const targetYear = year + Math.floor(totalMonths / 12)
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonthIndex + 1, 0)
  ).getUTCDate()
  const targetDay = Math.min(day, lastDayOfTargetMonth)

  return `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(
    targetDay
  ).padStart(2, '0')}`
}

export const fasMockStore = {
  subscribe(callback) {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  },

  getSnapshot() {
    return state
  },

  reset() {
    state = createInitialFasState()
    emit()
  },

  createDraftScheme() {
    return createEmptyScheme(nextSchemeId(state.schemes))
  },

  saveScheme(scheme, status) {
    const normalizedScheme = {
      ...scheme,
      status,
      rootConditionGroup: normalizeFasConditionGroup(
        scheme.rootConditionGroup ||
          createFasConditionGroupFromFlat(scheme.conditions || [], scheme.connectors || [])
      ),
      tiers: scheme.tiers || [],
      documents: scheme.documents || [],
      linkedCourses: scheme.linkedCourses || [],
      validityMonths: Number(scheme.validityMonths || 0),
    }

    delete normalizedScheme.conditions
    delete normalizedScheme.connectors

    updateState((draft) => {
      const existingIndex = draft.schemes.findIndex((item) => item.id === normalizedScheme.id)
      if (existingIndex >= 0) {
        draft.schemes[existingIndex] = normalizedScheme
      } else {
        draft.schemes.push(normalizedScheme)
      }

      if (status === FAS_STATUS.Active) {
        addAuditLog(draft, 'Publish scheme', normalizedScheme.id)
      }

      return draft
    })
  },

  duplicateScheme(id) {
    const scheme = state.schemes.find((item) => item.id === id)
    if (!scheme) return null

    const copy = {
      ...clone(scheme),
      id: nextSchemeId(state.schemes),
      name: `${scheme.name} (copy)`,
      status: FAS_STATUS.Draft,
    }

    copy.rootConditionGroup = rekeyFasConditionGroup(copy.rootConditionGroup, copy.id)
    copy.tiers = copy.tiers.map((tier, index) => ({
      ...tier,
      id: `${copy.id}-tier-${index + 1}`,
    }))
    copy.documents = copy.documents.map((document, index) => ({
      ...document,
      id: `${copy.id}-doc-${index + 1}`,
    }))

    updateState((draft) => {
      draft.schemes.push(copy)
      return draft
    })

    return copy
  },

  deleteDraftScheme(id) {
    updateState((draft) => {
      draft.schemes = draft.schemes.filter(
        (scheme) => scheme.id !== id || scheme.status !== FAS_STATUS.Draft
      )
      return draft
    })
  },

  changeSchemeStatus(id, status) {
    updateState((draft) => {
      const scheme = draft.schemes.find((item) => item.id === id)
      if (scheme && scheme.status !== FAS_STATUS.Draft) {
        scheme.status = status
        addAuditLog(draft, `${status === FAS_STATUS.Active ? 'Activate' : 'Deactivate'} scheme`, id)
      }
      return draft
    })
  },

  approveApplication(applicationId, tierId, metadata = {}) {
    updateState((draft) => {
      const application = draft.applications.find((item) => item.id === applicationId)
      const scheme = draft.schemes.find((item) => item.id === application?.schemeId)
      if (!application || !scheme) return draft

      const modifiedDate = new Date().toISOString()
      const oldTierId = application.tierId || metadata.recommendedTierId || null
      const oldTier = scheme.tiers.find((tier) => tier.id === oldTierId)
      const newTier = scheme.tiers.find((tier) => tier.id === tierId)
      const isOverride = !!metadata.recommendedTierId && metadata.recommendedTierId !== tierId
      const auditReason =
        metadata.reason?.trim() ||
        (isOverride
          ? 'School admin selected a different tier from the system recommendation.'
          : 'School admin approved the system-recommended tier.')

      application.status = FAS_APPLICATION_STATUS.Approved
      application.tierId = tierId
      application.approvedAt = modifiedDate.slice(0, 10)
      application.validFrom = application.submittedAt || application.approvedAt
      application.endDate = addMonths(application.validFrom, scheme.validityMonths)
      application.reason = undefined
      application.tierReview = {
        oldTierId,
        newTierId: tierId,
        modifiedBy: metadata.modifiedBy || MOCK_SCHOOL_ADMIN.name,
        modifiedDate,
        reason: auditReason,
        overridden: isOverride,
      }

      addAuditLog(
        draft,
        isOverride ? 'Override recommended FAS tier' : 'Approve FAS application',
        applicationId,
        {
          oldTier: oldTier?.name || '-',
          oldTierId,
          newTier: newTier?.name || '-',
          newTierId: tierId,
          modifiedBy: metadata.modifiedBy || MOCK_SCHOOL_ADMIN.name,
          modifiedDate,
          reason: auditReason,
        }
      )
      return draft
    })
  },

  rejectApplication(applicationId, reason) {
    updateState((draft) => {
      const application = draft.applications.find((item) => item.id === applicationId)
      if (!application) return draft

      application.status = FAS_APPLICATION_STATUS.Rejected
      application.reason = reason
      addAuditLog(draft, 'Reject FAS application', applicationId)
      return draft
    })
  },

  withdrawApplication(applicationId) {
    updateState((draft) => {
      draft.applications = draft.applications.filter((item) => item.id !== applicationId)
      return draft
    })
  },

  createAccountHolderApplication({ schemeId, profile, attachedDocumentIds = [], attachedDocuments = [] }) {
    const scheme = state.schemes.find((item) => item.id === schemeId)
    if (!scheme) return null

    const income = Number(profile?.income || 0)
    const members = Number(profile?.members || 0)
    const pci = getPci(income, members)
    const submittedAt = new Date().toISOString().slice(0, 10)
    const application = {
      id: nextApplicationId(state.applications),
      schemeId,
      schoolId: scheme.schoolId,
      accountNumber: MOCK_ACCOUNT_HOLDER.accountNumber,
      applicantName: MOCK_ACCOUNT_HOLDER.name,
      submittedAt,
      status: FAS_APPLICATION_STATUS.Pending,
      validFrom: submittedAt,
      endDate: addMonths(submittedAt, scheme.validityMonths),
      data: {
        age: Number(profile?.age || MOCK_ACCOUNT_HOLDER.age || 0),
        nationality: profile?.nationality || MOCK_ACCOUNT_HOLDER.nationality,
        parentNationality:
          profile?.parentNationality || MOCK_ACCOUNT_HOLDER.parentNationality,
        income,
        members,
        pci: pci || 0,
      },
      attachments: attachedDocuments.length
        ? attachedDocuments
        : attachedDocumentIds.map((documentId) => ({
            documentId,
            fileName: `${documentId}.pdf`,
          })),
      courses: [],
    }

    updateState((draft) => {
      draft.applications.push(application)
      return draft
    })

    return application
  },
}

export const useFasMockStore = () =>
  useSyncExternalStore(fasMockStore.subscribe, fasMockStore.getSnapshot, fasMockStore.getSnapshot)
