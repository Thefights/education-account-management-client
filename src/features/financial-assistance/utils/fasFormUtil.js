import { EnumConfig } from '@/shared/config/enumConfig'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'

const {
  FasConditionField,
  FasConditionOperator,
  FasLogicalOperator,
  FasSchemeStatus,
  FasSubsidyType,
  FasTierIncomeBasis,
} = EnumConfig

export const createEmptyCondition = () => ({
  field: FasConditionField.StudentAge,
  operator: FasConditionOperator.Equal,
  valueNumber: '',
  valueNumberTo: '',
  nationality: null,
})

export const createEmptyScenario = () => ({
  logicalOperator: FasLogicalOperator.And,
  conditions: [createEmptyCondition()],
  groups: [],
})

export const createEmptyConditionRoot = () => ({
  logicalOperator: FasLogicalOperator.Or,
  conditions: [],
  groups: [createEmptyScenario()],
})

export const getConditionFormValue = (condition = {}) => {
  const field = condition.field || FasConditionField.StudentAge
  return {
    field,
    operator: condition.operator || FasConditionOperator.Equal,
    valueNumber: condition.valueNumber ?? '',
    valueNumberTo: condition.valueNumberTo ?? '',
    nationality: condition.nationality ?? '',
  }
}

export const getConditionGroupFormValue = (group, isRoot = true) => {
  if (!group) return createEmptyConditionRoot()
  const formValue = {
    logicalOperator: group.logicalOperator || FasLogicalOperator.Or,
    conditions: (group.conditions || []).map(getConditionFormValue),
    groups: (group.groups || []).map((child) => getConditionGroupFormValue(child, false)),
  }

  if (isRoot && !formValue.groups.length && formValue.conditions.length) {
    return {
      logicalOperator: FasLogicalOperator.Or,
      conditions: [],
      groups: [{ ...formValue, logicalOperator: FasLogicalOperator.And, groups: [] }],
    }
  }

  if (isRoot && !formValue.groups.length) formValue.groups = [createEmptyScenario()]
  return formValue
}

export const serializeCondition = (condition, displayOrder) => {
  const formValue = getConditionFormValue(condition)
  const isNationality =
    formValue.field === FasConditionField.StudentNationality ||
    formValue.field === FasConditionField.GuardianNationality
  return {
    field: formValue.field,
    operator: formValue.operator,
    valueNumber: isNationality ? null : Number(formValue.valueNumber),
    valueNumberTo:
      !isNationality && formValue.operator === FasConditionOperator.Between
        ? Number(formValue.valueNumberTo)
        : null,
    nationality: isNationality ? formValue.nationality : null,
    displayOrder,
  }
}

export const serializeConditionGroup = (group, displayOrder = 0, isRoot = true) => {
  const formValue = getConditionGroupFormValue(group, isRoot)
  return {
    logicalOperator: formValue.logicalOperator,
    displayOrder,
    conditions: (formValue.conditions || []).map((condition, index) =>
      serializeCondition(condition, index)
    ),
    groups: (formValue.groups || []).map((child, index) =>
      serializeConditionGroup(child, index, false)
    ),
  }
}

const getTierFormValue = (tier = {}, index = 0) => ({
  id: tier.id ?? `tier-${index}`,
  tierName: tier.tierName ?? tier.name ?? `Tier ${index + 1}`,
  tierIncomeBasis: tier.tierIncomeBasis || FasTierIncomeBasis.PerCapitaIncome,
  subsidyType: tier.subsidyType || FasSubsidyType.Percent,
  minPerCapitaIncome: tier.minPerCapitaIncome ?? '',
  maxPerCapitaIncome: tier.maxPerCapitaIncome ?? '',
  minGrossHouseholdIncome: tier.minGrossHouseholdIncome ?? '',
  maxGrossHouseholdIncome: tier.maxGrossHouseholdIncome ?? '',
  subsidyValue: tier.subsidyValue ?? '',
  courseFeeSubsidyValue: tier.courseFeeSubsidyValue ?? '',
  miscFeeSubsidyValue: tier.miscFeeSubsidyValue ?? '',
  isPerComponent: Boolean(tier.isPerComponent),
  displayOrder: tier.displayOrder ?? index + 1,
})

export const createEmptyTier = (index = 0) => ({
  id: `tier-${Date.now()}-${index}`,
  tierName: `Tier ${index + 1}`,
  tierIncomeBasis: FasTierIncomeBasis.PerCapitaIncome,
  subsidyType: FasSubsidyType.Percent,
  minPerCapitaIncome: index === 0 ? 0 : '',
  maxPerCapitaIncome: '',
  minGrossHouseholdIncome: '',
  maxGrossHouseholdIncome: '',
  subsidyValue: '',
  courseFeeSubsidyValue: '',
  miscFeeSubsidyValue: '',
  isPerComponent: false,
  displayOrder: index + 1,
})

const usesPerCapitaRange = (tier) =>
  tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaIncome ||
  tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome

const usesGrossRange = (tier) =>
  tier.tierIncomeBasis === FasTierIncomeBasis.GrossHouseholdIncome ||
  tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome

export const getDerivedTiers = (tiers) => {
  let nextPerCapitaStart
  let nextGrossStart

  return tiers.map((tier) => {
    const derived = { ...tier }

    if (usesPerCapitaRange(tier)) {
      derived.minPerCapitaIncome =
        nextPerCapitaStart === undefined ? (tier.minPerCapitaIncome ?? 0) : nextPerCapitaStart
      nextPerCapitaStart = tier.maxPerCapitaIncome ?? ''
    } else {
      derived.minPerCapitaIncome = ''
      derived.maxPerCapitaIncome = ''
    }

    if (usesGrossRange(tier)) {
      derived.minGrossHouseholdIncome =
        nextGrossStart === undefined ? (tier.minGrossHouseholdIncome ?? 0) : nextGrossStart
      nextGrossStart = tier.maxGrossHouseholdIncome ?? ''
    } else {
      derived.minGrossHouseholdIncome = ''
      derived.maxGrossHouseholdIncome = ''
    }

    return derived
  })
}

export const createEmptyScheme = () => ({
  id: null,
  schemeName: '',
  description: '',
  durationInMonths: 12,
  status: FasSchemeStatus.Draft,
  rootConditionGroup: createEmptyConditionRoot(),
  tiers: [createEmptyTier(0)],
  requiredDocuments: [],
  schemeCourses: [],
  additionalQuestions: [],
})

export const getSchemeFormValue = (scheme) => ({
  ...createEmptyScheme(),
  ...scheme,
  id: scheme?.id,
  rootConditionGroup: getConditionGroupFormValue(scheme?.rootConditionGroup),
  tiers: (scheme?.tiers || []).map(getTierFormValue),
  requiredDocuments: (scheme?.requiredDocuments || []).map((document, index) => ({
    id: document.id ?? `doc-${index}`,
    documentName: document.documentName ?? '',
    templateFileKey: document.templateFileKey ?? '',
    templateFileName: document.templateFileName ?? document.templateFileKey ?? '',
    templateFile: null,
    displayOrder: document.displayOrder ?? index + 1,
  })),
  schemeCourses: (scheme?.schemeCourses || []).map((course) => ({
    courseId: course.courseId ?? course.id ?? course,
  })),
  additionalQuestions: (scheme?.additionalQuestions || []).map((question, index) => ({
    id: question.id ?? `question-${index}`,
    questionText: question.questionText ?? '',
    isRequired: Boolean(question.isRequired),
  })),
})

const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export const buildSchemePayload = (scheme) => ({
  schemeName: scheme.schemeName,
  description: scheme.description || '',
  durationInMonths: Number(scheme.durationInMonths || 0),
  rootConditionGroup: serializeConditionGroup(scheme.rootConditionGroup),
  tiers: (scheme.tiers || []).map((tier, index) => ({
    tierName: tier.tierName || `Tier ${index + 1}`,
    tierIncomeBasis: tier.tierIncomeBasis,
    subsidyType: tier.subsidyType,
    isPerComponent: Boolean(tier.isPerComponent),
    minPerCapitaIncome: nullableNumber(tier.minPerCapitaIncome),
    maxPerCapitaIncome: nullableNumber(tier.maxPerCapitaIncome),
    minGrossHouseholdIncome: nullableNumber(tier.minGrossHouseholdIncome),
    maxGrossHouseholdIncome: nullableNumber(tier.maxGrossHouseholdIncome),
    subsidyValue: nullableNumber(tier.subsidyValue),
    courseFeeSubsidyValue: nullableNumber(tier.courseFeeSubsidyValue),
    miscFeeSubsidyValue: nullableNumber(tier.miscFeeSubsidyValue),
    displayOrder: index + 1,
  })),
  requiredDocuments: (scheme.requiredDocuments || [])
    .filter((document) => document.documentName?.trim())
    .map((document, index) => ({
      documentName: document.documentName.trim(),
      templateFileKey: document.templateFileKey || null,
      templateFile: document.templateFile || null,
      displayOrder: index + 1,
    })),
  schemeCourses: (scheme.schemeCourses || []).map((course) => ({
    courseId: Number(course.courseId ?? course),
  })),
  additionalQuestions: (scheme.additionalQuestions || [])
    .filter((question) => question.questionText?.trim())
    .map((question) => ({
      questionText: question.questionText.trim(),
      isRequired: Boolean(question.isRequired),
    })),
})

export const buildApplicationPayload = ({
  schemeId,
  guardianNationality,
  grossHouseholdIncome,
  householdMemberCount,
  documents,
  additionalAnswers,
}) => ({
  fasSchemeId: Number(schemeId),
  guardianNationality,
  grossHouseholdIncome: Number(grossHouseholdIncome || 0),
  householdMemberCount: Number(householdMemberCount || 0),
  documents: (documents || []).map((document) => ({
    requiredDocumentId: Number(document.requiredDocumentId),
    file: document.file || null,
    fileKey: document.fileKey || '',
    fileName: document.fileName || '',
  })),
  additionalAnswers: (additionalAnswers || []).map((answer) => ({
    fasSchemeAdditionalQuestionId: Number(answer.fasSchemeAdditionalQuestionId),
    answerText: answer.answerText || '',
  })),
})

export const formatMoney = (value) =>
  value == null || value === '' ? '-' : formatCurrencyBasedOnCurrentLanguage(value)

export const formatSubsidy = (value, type) => {
  if (value == null || value === '') return '-'
  return type === FasSubsidyType.Percent
    ? `${value}%`
    : formatCurrencyBasedOnCurrentLanguage(value)
}

export const formatTierRange = (tier) => {
  const parts = []
  if (
    tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaIncome ||
    tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome
  ) {
    parts.push(`PCI [${tier.minPerCapitaIncome || 0}, ${tier.maxPerCapitaIncome || '∞'})`)
  }
  if (
    tier.tierIncomeBasis === FasTierIncomeBasis.GrossHouseholdIncome ||
    tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome
  ) {
    parts.push(
      `Gross [${tier.minGrossHouseholdIncome || 0}, ${tier.maxGrossHouseholdIncome || '∞'})`
    )
  }
  return parts.join(' OR ')
}

const formatFriendlyIncomeRange = (min, max) => {
  const minimum = Number(min || 0)
  if (max == null || max === '') {
    return `${formatCurrencyBasedOnCurrentLanguage(minimum)} and above`
  }
  const maximum = formatCurrencyBasedOnCurrentLanguage(max)
  if (minimum === 0) return `Below ${maximum}`
  return `${formatCurrencyBasedOnCurrentLanguage(minimum)} – below ${maximum}`
}

export const formatFriendlyTierRanges = (tier) => {
  const ranges = []
  if (usesPerCapitaRange(tier)) {
    ranges.push(
      `Per capita: ${formatFriendlyIncomeRange(tier.minPerCapitaIncome, tier.maxPerCapitaIncome)}`
    )
  }
  if (usesGrossRange(tier)) {
    ranges.push(
      `Gross household: ${formatFriendlyIncomeRange(
        tier.minGrossHouseholdIncome,
        tier.maxGrossHouseholdIncome
      )}`
    )
  }
  return ranges
}

export const validateTierConfiguration = (tiers) => {
  const errors = []
  const ranges = { pci: [], gross: [] }

  tiers.forEach((tier, index) => {
    const label = tier.tierName || `Tier ${index + 1}`
    const checkRange = (min, max, rangeLabel) => {
      if (min === '' || min == null) errors.push(`${label}: ${rangeLabel} minimum is required.`)
      if (Number(min) < 0 || Number(max) < 0)
        errors.push(`${label}: ${rangeLabel} cannot be negative.`)
      if (max !== '' && max != null && Number(min) >= Number(max)) {
        errors.push(`${label}: ${rangeLabel} maximum must be greater than minimum.`)
      }
    }
    if (tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaIncome) {
      checkRange(tier.minPerCapitaIncome, tier.maxPerCapitaIncome, 'PCI')
      if (tier.minGrossHouseholdIncome !== '' || tier.maxGrossHouseholdIncome !== '')
        errors.push(`${label}: gross range must be empty.`)
      ranges.pci.push({
        min: Number(tier.minPerCapitaIncome),
        max:
          tier.maxPerCapitaIncome === '' || tier.maxPerCapitaIncome == null
            ? null
            : Number(tier.maxPerCapitaIncome),
        label,
      })
    }
    if (tier.tierIncomeBasis === FasTierIncomeBasis.GrossHouseholdIncome) {
      checkRange(tier.minGrossHouseholdIncome, tier.maxGrossHouseholdIncome, 'gross')
      if (tier.minPerCapitaIncome !== '' || tier.maxPerCapitaIncome !== '')
        errors.push(`${label}: PCI range must be empty.`)
      ranges.gross.push({
        min: Number(tier.minGrossHouseholdIncome),
        max:
          tier.maxGrossHouseholdIncome === '' || tier.maxGrossHouseholdIncome == null
            ? null
            : Number(tier.maxGrossHouseholdIncome),
        label,
      })
    }
    if (tier.tierIncomeBasis === FasTierIncomeBasis.PerCapitaOrGrossHouseholdIncome) {
      checkRange(tier.minPerCapitaIncome, tier.maxPerCapitaIncome, 'PCI')
      checkRange(tier.minGrossHouseholdIncome, tier.maxGrossHouseholdIncome, 'gross')
      ranges.pci.push({
        min: Number(tier.minPerCapitaIncome),
        max:
          tier.maxPerCapitaIncome === '' || tier.maxPerCapitaIncome == null
            ? null
            : Number(tier.maxPerCapitaIncome),
        label,
      })
      ranges.gross.push({
        min: Number(tier.minGrossHouseholdIncome),
        max:
          tier.maxGrossHouseholdIncome === '' || tier.maxGrossHouseholdIncome == null
            ? null
            : Number(tier.maxGrossHouseholdIncome),
        label,
      })
    }

    const values = tier.isPerComponent
      ? [tier.courseFeeSubsidyValue, tier.miscFeeSubsidyValue]
      : [tier.subsidyValue]
    values.forEach((value) => {
      if (value === '' || value == null || Number(value) <= 0)
        errors.push(`${label}: subsidy must be greater than 0.`)
      if (tier.subsidyType === FasSubsidyType.Percent && Number(value) > 100)
        errors.push(`${label}: percent subsidy cannot exceed 100.`)
    })
    if (tier.isPerComponent && tier.subsidyValue !== '' && tier.subsidyValue != null) {
      errors.push(`${label}: subsidy must be empty when per-component subsidy is enabled.`)
    }
    if (
      !tier.isPerComponent &&
      ((tier.courseFeeSubsidyValue !== '' && tier.courseFeeSubsidyValue != null) ||
        (tier.miscFeeSubsidyValue !== '' && tier.miscFeeSubsidyValue != null))
    ) {
      errors.push(
        `${label}: component subsidies must be empty when per-component subsidy is disabled.`
      )
    }
  })

  const validateRanges = (items, label) => {
    if (!items.length) return
    const sorted = [...items].sort((a, b) => a.min - b.min)
    for (let index = 0; index < sorted.length; index += 1) {
      if (index > 0 && sorted[index - 1].max != null && sorted[index].min < sorted[index - 1].max) {
        errors.push(`${label} ranges cannot overlap.`)
      }
      if (sorted[index].max == null && index !== sorted.length - 1) {
        errors.push(`Open-ended ${label} range must be final.`)
      }
    }
  }

  validateRanges(ranges.pci, 'PCI')
  validateRanges(ranges.gross, 'gross income')
  return [...new Set(errors)]
}
