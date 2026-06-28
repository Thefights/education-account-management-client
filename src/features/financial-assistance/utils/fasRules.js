import {
  FAS_APPLICATION_STATUS,
  FAS_CONDITION_FIELD,
  FAS_CONDITION_OPERATOR,
  FAS_FIELD_KEY_BY_VALUE,
  FAS_FIELD_LABELS,
  FAS_LOGICAL_OPERATOR,
  createFasConditionGroupFromFlat,
  isFasTextField,
  normalizeFasCondition,
  normalizeFasConditionField,
  normalizeFasConditionGroup,
} from '@/features/financial-assistance/data/fasSeedData'

export const formatFasDate = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(String(value) + 'T00:00:00'))
}

export const getPci = (income, members) => {
  const normalizedIncome = Number(income)
  const normalizedMembers = Number(members)

  if (!Number.isFinite(normalizedIncome) || !Number.isFinite(normalizedMembers)) return null
  if (normalizedIncome < 0 || normalizedMembers <= 0) return null

  return Math.round(normalizedIncome / normalizedMembers)
}

export const isApprovedApplicationExpired = (application) => {
  if (application?.status !== FAS_APPLICATION_STATUS.Approved || !application?.endDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(String(application.endDate) + 'T00:00:00')
  return endDate < today
}

const formatConditionValue = (value) => {
  if (value === '' || value == null) return 'not set'

  const numberValue = Number(value)
  if (Number.isFinite(numberValue) && String(value).trim() !== '') {
    return numberValue.toLocaleString()
  }

  return value
}

const operatorText = (operator) => {
  if (operator === FAS_CONDITION_OPERATOR.NotEquals) return '!='
  if (operator === FAS_CONDITION_OPERATOR.GreaterThan) return '>'
  if (operator === FAS_CONDITION_OPERATOR.GreaterThanOrEqual) return '≥'
  if (operator === FAS_CONDITION_OPERATOR.LessThan) return '<'
  if (operator === FAS_CONDITION_OPERATOR.LessThanOrEqual) return '≤'
  if (operator === FAS_CONDITION_OPERATOR.Between) return 'between'
  return '='
}

const resolveConditionGroup = (value, connectors = []) => {
  if (!value) return null
  if (value.rootConditionGroup) return normalizeFasConditionGroup(value.rootConditionGroup)
  if (Array.isArray(value)) return createFasConditionGroupFromFlat(value, connectors)
  if (value.conditions || value.groups) return normalizeFasConditionGroup(value)
  return null
}

export const describeCondition = (condition) => {
  const normalized = normalizeFasCondition(condition)
  const label = FAS_FIELD_LABELS[normalized.field] || normalized.field

  if (normalized.operator === FAS_CONDITION_OPERATOR.Between) {
    return (
      label +
      ' ' +
      formatConditionValue(normalized.valueNumber) +
      '-' +
      formatConditionValue(normalized.valueNumberTo)
    )
  }

  const value = isFasTextField(normalized.field) ? normalized.valueText : normalized.valueNumber

  return label + ' ' + operatorText(normalized.operator) + ' ' + formatConditionValue(value)
}

const describeGroup = (group) => {
  const normalizedGroup = normalizeFasConditionGroup(group)
  const joiner = normalizedGroup.logicalOperator === FAS_LOGICAL_OPERATOR.Any ? ' or ' : ' and '
  const parts = [
    ...(normalizedGroup.conditions || []).map(describeCondition),
    ...(normalizedGroup.groups || []).map((child) => '( ' + describeGroup(child) + ' )'),
  ].filter(Boolean)

  return parts.join(joiner)
}

export const buildEligibilityPreviewParts = (value = [], connectors = []) => {
  const group = resolveConditionGroup(value, connectors)
  if (!group || !(group.conditions?.length || group.groups?.length)) return []

  if (
    group.logicalOperator === FAS_LOGICAL_OPERATOR.Any &&
    group.groups?.length &&
    !group.conditions?.length
  ) {
    return group.groups.map(describeGroup)
  }

  return [describeGroup(group)]
}

export const buildEligibilityPreview = (value = [], connectors = []) => {
  const parts = buildEligibilityPreviewParts(value, connectors)
  if (!parts.length) return '-'
  return parts.join(' or ')
}

const profileValueForField = (field, profile) => {
  const normalizedField = normalizeFasConditionField(field)
  if (normalizedField === FAS_CONDITION_FIELD.Nationality) return profile?.nationality
  if (normalizedField === FAS_CONDITION_FIELD.ParentNationality) return profile?.parentNationality
  if (normalizedField === FAS_CONDITION_FIELD.StudentAge) return profile?.age
  if (normalizedField === FAS_CONDITION_FIELD.GrossHouseholdIncome) return profile?.income
  if (normalizedField === FAS_CONDITION_FIELD.PerCapitaIncome) return profile?.pci
  return undefined
}

const evaluateCondition = (condition, profile) => {
  const normalized = normalizeFasCondition(condition)
  const profileValue = profileValueForField(normalized.field, profile)

  if (isFasTextField(normalized.field)) {
    if (normalized.valueText === 'Any')
      return normalized.operator !== FAS_CONDITION_OPERATOR.NotEquals

    const left = String(profileValue || '').toLowerCase()
    const right = String(normalized.valueText || '').toLowerCase()

    return normalized.operator === FAS_CONDITION_OPERATOR.NotEquals
      ? left !== right
      : left === right
  }

  const left = Number(profileValue)
  const right = Number(normalized.valueNumber)
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false

  if (normalized.operator === FAS_CONDITION_OPERATOR.NotEquals) return left !== right
  if (normalized.operator === FAS_CONDITION_OPERATOR.GreaterThan) return left > right
  if (normalized.operator === FAS_CONDITION_OPERATOR.GreaterThanOrEqual) return left >= right
  if (normalized.operator === FAS_CONDITION_OPERATOR.LessThan) return left < right
  if (normalized.operator === FAS_CONDITION_OPERATOR.LessThanOrEqual) return left <= right
  if (normalized.operator === FAS_CONDITION_OPERATOR.Between) {
    const upper = Number(normalized.valueNumberTo)
    return Number.isFinite(upper) && left >= right && left <= upper
  }

  return left === right
}

const evaluateGroup = (group, profile) => {
  const normalizedGroup = normalizeFasConditionGroup(group)
  const results = [
    ...(normalizedGroup.conditions || []).map((condition) => evaluateCondition(condition, profile)),
    ...(normalizedGroup.groups || []).map((child) => evaluateGroup(child, profile)),
  ]

  if (!results.length) return false
  return normalizedGroup.logicalOperator === FAS_LOGICAL_OPERATOR.Any
    ? results.some(Boolean)
    : results.every(Boolean)
}

export const evaluateSchemeEligibility = (scheme, profile) => {
  const group = resolveConditionGroup(
    scheme?.rootConditionGroup || scheme?.conditions,
    scheme?.connectors || []
  )
  if (!group) return false
  return evaluateGroup(group, profile)
}

export const collectConditionFields = (schemeOrGroup) => {
  const group = resolveConditionGroup(
    schemeOrGroup?.rootConditionGroup ? schemeOrGroup : schemeOrGroup
  )
  const fields = new Set()

  const walk = (currentGroup) => {
    if (!currentGroup) return
    const normalizedGroup = normalizeFasConditionGroup(currentGroup)
    ;(normalizedGroup.conditions || []).forEach((condition) => {
      const fieldKey = FAS_FIELD_KEY_BY_VALUE[normalizeFasConditionField(condition.field)]
      if (fieldKey) fields.add(fieldKey)
    })
    ;(normalizedGroup.groups || []).forEach(walk)
  }

  walk(group)
  return fields
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
    return 'PCI ≤ ' + Number(tier.maxPci || 0).toLocaleString()
  }

  return '-'
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
    return (
      'Course ' + Number(tier.courseValue || 0) + '% | Misc ' + Number(tier.miscValue || 0) + '%'
    )
  }

  if (scheme.subsidyType === 'fixed') {
    return 'S$' + Number(tier.value || 0).toLocaleString() + ' fixed'
  }

  return Number(tier.value || 0) + '% of (Course + Misc)'
}

export const getApplicationDisplayStatus = (application) => {
  if (isApprovedApplicationExpired(application)) return 'expired'
  return application?.status
}

export const statusLabel = (value) => {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
