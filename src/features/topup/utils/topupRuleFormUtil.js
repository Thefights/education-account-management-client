import { EnumConfig } from '@/shared/config/enumConfig'

const fieldValues = { 1: 'Age', 2: 'Balance', 3: 'SchoolingStatus' }
const operatorValues = {
  1: 'Equals',
  2: 'NotEquals',
  3: 'GreaterThan',
  4: 'GreaterThanOrEqual',
  5: 'LessThan',
  6: 'LessThanOrEqual',
  7: 'Between',
}
const logicalOperatorValues = { 1: 'And', 2: 'Or' }
const textField = EnumConfig.TopupConditionField.SchoolingStatus
const ageField = EnumConfig.TopupConditionField.Age
const betweenOperator = EnumConfig.TopupConditionOperator.Between

export const TOPUP_ELIGIBLE_AGE_MIN = 16
export const TOPUP_ELIGIBLE_AGE_MAX = 30

const isWholeNumber = (value) => Number.isInteger(Number(value))
const isAgeInRange = (value) =>
  Number(value) >= TOPUP_ELIGIBLE_AGE_MIN && Number(value) <= TOPUP_ELIGIBLE_AGE_MAX

export const createEmptyTopupCondition = () => ({
  field: EnumConfig.TopupConditionField.Age,
  operator: EnumConfig.TopupConditionOperator.Equals,
  valueText: null,
  valueNumber: null,
  valueNumberTo: null,
  displayOrder: 0,
})

export const createEmptyTopupConditionGroup = () => ({
  logicalOperator: EnumConfig.TopupLogicalOperator.And,
  displayOrder: 0,
  conditions: [createEmptyTopupCondition()],
  groups: [],
})

const normalizeTopupCondition = (condition = {}) => ({
  ...condition,
  field:
    typeof condition.field === 'number'
      ? fieldValues[condition.field] || EnumConfig.TopupConditionField.Age
      : condition.field || EnumConfig.TopupConditionField.Age,
  operator:
    typeof condition.operator === 'number'
      ? operatorValues[condition.operator] || EnumConfig.TopupConditionOperator.Equals
      : condition.operator || EnumConfig.TopupConditionOperator.Equals,
})

export const normalizeTopupConditionGroup = (group) => {
  if (!group) return createEmptyTopupConditionGroup()
  return {
    ...group,
    logicalOperator:
      typeof group.logicalOperator === 'number'
        ? logicalOperatorValues[group.logicalOperator] || EnumConfig.TopupLogicalOperator.And
        : group.logicalOperator || EnumConfig.TopupLogicalOperator.And,
    conditions: (group.conditions || []).map(normalizeTopupCondition),
    groups: (group.groups || []).map(normalizeTopupConditionGroup),
  }
}

export const serializeTopupConditionGroup = (group, displayOrder = 0) => {
  const conditions = group.conditions || []
  return {
    logicalOperator: group.logicalOperator,
    displayOrder,
    conditions: conditions.map((condition, index) => ({
      field: condition.field,
      operator: condition.operator,
      valueText: condition.field === textField ? condition.valueText : null,
      valueNumber: condition.field === textField ? null : condition.valueNumber,
      valueNumberTo:
        condition.field !== textField && condition.operator === betweenOperator
          ? condition.valueNumberTo
          : null,
      displayOrder: index,
    })),
    groups: (group.groups || []).map((child, index) =>
      serializeTopupConditionGroup(child, conditions.length + index)
    ),
  }
}

export const getTopupConditionValidationErrors = (condition = {}) => {
  const errors = {}

  if (condition.field === textField) {
    const isValidTextOperator = [
      EnumConfig.TopupConditionOperator.Equals,
      EnumConfig.TopupConditionOperator.NotEquals,
    ].includes(condition.operator)
    if (!isValidTextOperator) errors.operator = 'invalid_operator'
    if (!condition.valueText) errors.valueText = 'required'
    return errors
  }

  if (condition.valueNumber == null || Number(condition.valueNumber) < 0) {
    errors.valueNumber = 'required'
  }

  if (condition.field === ageField && condition.valueNumber != null) {
    if (!isWholeNumber(condition.valueNumber)) errors.valueNumber = 'whole_age'
    else if (!isAgeInRange(condition.valueNumber)) errors.valueNumber = 'age_range'
  }

  if (condition.operator === betweenOperator) {
    if (condition.valueNumberTo == null || Number(condition.valueNumberTo) < 0) {
      errors.valueNumberTo = 'required'
    } else if (Number(condition.valueNumberTo) < Number(condition.valueNumber)) {
      errors.valueNumberTo = 'invalid_range'
    } else if (condition.field === ageField) {
      if (!isWholeNumber(condition.valueNumberTo)) errors.valueNumberTo = 'whole_age'
      else if (!isAgeInRange(condition.valueNumberTo)) errors.valueNumberTo = 'age_range'
    }
  }

  return errors
}

const hasConditionErrors = (condition) =>
  Object.keys(getTopupConditionValidationErrors(condition)).length > 0

const getConditionSignature = (condition = {}) =>
  [
    condition.field,
    condition.operator,
    condition.valueText || '',
    condition.valueNumber ?? '',
    condition.valueNumberTo ?? '',
  ].join('|')

const collectGroupWarnings = (group, t) => {
  const warnings = []
  const conditionSignatures = new Map()

  ;(group.conditions || []).forEach((condition, index) => {
    const signature = getConditionSignature(condition)
    if (conditionSignatures.has(signature)) {
      warnings.push(t('topup_form.warning_duplicate_condition', { number: index + 1 }))
    } else {
      conditionSignatures.set(signature, index)
    }

    if (
      condition.field === ageField &&
      ((condition.operator === EnumConfig.TopupConditionOperator.GreaterThanOrEqual &&
        Number(condition.valueNumber) === TOPUP_ELIGIBLE_AGE_MIN) ||
        (condition.operator === EnumConfig.TopupConditionOperator.LessThanOrEqual &&
          Number(condition.valueNumber) === TOPUP_ELIGIBLE_AGE_MAX) ||
        (condition.operator === betweenOperator &&
          Number(condition.valueNumber) === TOPUP_ELIGIBLE_AGE_MIN &&
          Number(condition.valueNumberTo) === TOPUP_ELIGIBLE_AGE_MAX))
    ) {
      warnings.push(t('topup_form.warning_broad_age_rule', { number: index + 1 }))
    }
  })

  ;(group.groups || []).forEach((child) => {
    warnings.push(...collectGroupWarnings(child, t))
  })

  return [...new Set(warnings)]
}

export const getTopupConditionGroupWarnings = (group, t) =>
  group ? collectGroupWarnings(group, t) : []

export const isTopupConditionGroupValid = (group, depth = 1) => {
  if (depth > 2 || !group || !(group.conditions?.length || group.groups?.length)) return false
  const conditionsValid = (group.conditions || []).every((condition) => !hasConditionErrors(condition))
  return (
    conditionsValid &&
    (group.groups || []).every((child) => isTopupConditionGroupValid(child, depth + 1))
  )
}
