import {
  FAS_APPLICATION_STATUS,
  FAS_FIELD_LABELS,
} from '@/features/financial-assistance/data/fasSeedData'

export const formatFasDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export const getPci = (income, members) => {
  const normalizedIncome = Number(income)
  const normalizedMembers = Number(members)

  if (!Number.isFinite(normalizedIncome) || !Number.isFinite(normalizedMembers)) return null
  if (normalizedIncome <= 0 || normalizedMembers <= 0) return null

  return Math.round(normalizedIncome / normalizedMembers)
}

export const isApprovedApplicationExpired = (application) => {
  if (application?.status !== FAS_APPLICATION_STATUS.Approved || !application?.endDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(`${application.endDate}T00:00:00`)
  return endDate < today
}

const equalityFields = new Set(['nationality', 'parentNationality', 'studentAge'])

const conditionOperatorText = (field) => (equalityFields.has(field) ? '=' : '≤')

const formatConditionValue = (value) => {
  if (value === '' || value == null) return 'not set'

  const numberValue = Number(value)
  if (Number.isFinite(numberValue) && String(value).trim() !== '') {
    return numberValue.toLocaleString()
  }

  return value
}

export const describeCondition = (condition) => {
  const label = FAS_FIELD_LABELS[condition.field] || condition.field
  return `${label} ${conditionOperatorText(condition.field)} ${formatConditionValue(condition.value)}`
}

export const formatTierConditionText = (tier) => {
  if (!tier) return '-'

  if (tier.conditionText) {
    return tier.conditionText
      .replace(/PCI is at most\s*/i, 'PCI ≤ ')
      .replace(/PCI is from\s*/i, 'PCI ')
      .replace(/\s+to\s+/i, '-')
  }

  if (tier.maxPci !== '' && tier.maxPci != null) {
    return `PCI ≤ ${Number(tier.maxPci || 0).toLocaleString()}`
  }

  return '-'
}

export const buildEligibilityPreviewParts = (conditions = [], connectors = []) => {
  if (!conditions.length) return []

  const groups = [[conditions[0]]]

  conditions.slice(1).forEach((condition, index) => {
    const connector = connectors[index] || 'AND'
    if (connector === 'OR') {
      groups.push([condition])
      return
    }

    groups[groups.length - 1].push(condition)
  })

  return groups.map((group) => {
    const text = group.map(describeCondition).join(' and ')
    return group.length > 1 ? `( ${text} )` : text
  })
}

export const buildEligibilityPreview = (conditions = [], connectors = []) => {
  const parts = buildEligibilityPreviewParts(conditions, connectors)
  if (!parts.length) return '-'
  return parts.join(' or ')
}

const evaluateCondition = (condition, profile) => {
  if (!condition?.field) return false

  if (condition.field === 'nationality') {
    if (condition.value === 'Any') return true
    return String(profile?.nationality || '').toLowerCase() === String(condition.value || '').toLowerCase()
  }

  if (condition.field === 'parentNationality') {
    if (condition.value === 'Any') return true
    return (
      String(profile?.parentNationality || '').toLowerCase() ===
      String(condition.value || '').toLowerCase()
    )
  }

  if (condition.field === 'studentAge') {
    return Number(profile?.age) === Number(condition.value)
  }

  const limit = Number(condition.value)
  if (!Number.isFinite(limit)) return false

  if (condition.field === 'income') {
    return Number(profile?.income) <= limit
  }

  if (condition.field === 'pci') {
    return Number(profile?.pci) <= limit
  }

  return false
}

export const evaluateSchemeEligibility = (scheme, profile) => {
  const conditions = scheme?.conditions || []
  const connectors = scheme?.connectors || []
  if (!conditions.length) return false

  let currentGroupPass = evaluateCondition(conditions[0], profile)
  let finalPass = false

  conditions.slice(1).forEach((condition, index) => {
    const connector = connectors[index] || 'AND'
    const conditionPass = evaluateCondition(condition, profile)

    if (connector === 'OR') {
      finalPass = finalPass || currentGroupPass
      currentGroupPass = conditionPass
      return
    }

    currentGroupPass = currentGroupPass && conditionPass
  })

  return finalPass || currentGroupPass
}

export const isCitizenOnlyScheme = (scheme) => {
  const conditions = scheme?.conditions || []
  return conditions.length > 0 && conditions.every((condition) => condition.field === 'nationality')
}

export const getSuggestedTier = (scheme, application) => {
  if (!scheme || !application) return null

  const tiers = scheme.tiers || []
  if (!tiers.length) return null

  const pci = Number(application.data?.pci)
  if (!Number.isFinite(pci)) return null

  const tiersWithPciLimits = tiers.filter((tier) => {
    if (tier.maxPci === '' || tier.maxPci == null) return false
    return Number.isFinite(Number(tier.maxPci))
  })

  if (!tiersWithPciLimits.length) return tiers[0]

  return tiersWithPciLimits.find((tier) => Number(tier.maxPci) >= pci) || null
}

export const describeTierSubsidy = (scheme, tier) => {
  if (!scheme || !tier) return '-'

  if (tier.perComponent) {
    return `Course ${Number(tier.courseValue || 0)}% | Misc ${Number(tier.miscValue || 0)}%`
  }

  if (scheme.subsidyType === 'fixed') {
    return `S$${Number(tier.value || 0).toLocaleString()} fixed`
  }

  return `${Number(tier.value || 0)}% of (Course + Misc)`
}

export const calculateSampleFunding = (scheme, tier) => {
  const course = 100
  const misc = 20
  const total = (course + misc) * 1.09
  let funded

  if (tier?.perComponent) {
    if (scheme?.subsidyType === 'fixed') {
      funded = Number(tier.courseValue || 0) + Number(tier.miscValue || 0)
    } else {
      funded =
        (course * Number(tier.courseValue || 0)) / 100 +
        (misc * Number(tier.miscValue || 0)) / 100
      funded *= 1.09
    }
  } else if (scheme?.subsidyType === 'fixed') {
    funded = Number(tier?.value || 0)
  } else {
    funded = ((course + misc) * Number(tier?.value || 0) * 1.09) / 100
  }

  const cappedFunded = Math.min(funded, total)

  return {
    total,
    funded: cappedFunded,
    net: total - cappedFunded,
  }
}

export const getApplicationDisplayStatus = (application) => {
  if (isApprovedApplicationExpired(application)) return 'expired'
  return application?.status
}

export const statusLabel = (value) => {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
