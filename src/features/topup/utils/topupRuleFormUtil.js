import { EnumConfig } from '@/shared/config/enumConfig'
import {
  TOPUP_AGE_MAX,
  TOPUP_AGE_MIN,
  analyzeTopupConditionGroup,
} from './topupConditionAnalyzer'

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

export const TOPUP_ELIGIBLE_AGE_MIN = TOPUP_AGE_MIN
export const TOPUP_ELIGIBLE_AGE_MAX = TOPUP_AGE_MAX

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

export const createEmptyTopupScenarioRoot = () => ({
  logicalOperator: EnumConfig.TopupLogicalOperator.Or,
  displayOrder: 0,
  conditions: [],
  groups: [createEmptyTopupConditionGroup()],
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

const normalizeRawTopupConditionGroup = (group) => {
  if (!group) return createEmptyTopupConditionGroup()
  return {
    ...group,
    logicalOperator:
      typeof group.logicalOperator === 'number'
        ? logicalOperatorValues[group.logicalOperator] || EnumConfig.TopupLogicalOperator.And
        : group.logicalOperator || EnumConfig.TopupLogicalOperator.And,
    conditions: (group.conditions || []).map(normalizeTopupCondition),
    groups: (group.groups || []).map(normalizeRawTopupConditionGroup),
  }
}

const cloneCondition = (condition, displayOrder) => ({
  ...condition,
  displayOrder,
})

const combineScenarioCases = (leftCases, rightCases) => {
  if (!leftCases.length) return rightCases
  if (!rightCases.length) return leftCases
  return leftCases.flatMap((left) => rightCases.map((right) => [...left, ...right]))
}

const buildScenarioCases = (group) => {
  const conditionCases = (group.conditions || []).map((condition) => [[condition]])
  const childCases = (group.groups || []).map(buildScenarioCases)
  const items = [...conditionCases, ...childCases].filter((item) => item.length)

  if (!items.length) return []
  if (group.logicalOperator === EnumConfig.TopupLogicalOperator.Or) return items.flat()
  return items.reduce((cases, item) => combineScenarioCases(cases, item), [[]])
}

const createScenarioGroup = (conditions, displayOrder) => ({
  logicalOperator: EnumConfig.TopupLogicalOperator.And,
  displayOrder,
  conditions: conditions.map((condition, index) => cloneCondition(condition, index)),
  groups: [],
})

export const normalizeTopupConditionGroup = (group) => {
  if (!group) return createEmptyTopupScenarioRoot()
  const normalized = normalizeRawTopupConditionGroup(group)
  const scenarioCases = buildScenarioCases(normalized)
  return {
    logicalOperator: EnumConfig.TopupLogicalOperator.Or,
    displayOrder: 0,
    conditions: [],
    groups: scenarioCases.length
      ? scenarioCases.map((conditions, index) => createScenarioGroup(conditions, index))
      : [createEmptyTopupConditionGroup()],
  }
}

const serializeTopupCondition = (condition, displayOrder) => ({
  field: condition.field,
  operator: condition.operator,
  valueText: condition.field === textField ? condition.valueText : null,
  valueNumber: condition.field === textField ? null : condition.valueNumber,
  valueNumberTo:
    condition.field !== textField && condition.operator === betweenOperator
      ? condition.valueNumberTo
      : null,
  displayOrder,
})

export const serializeTopupConditionGroup = (group, displayOrder = 0) => {
  const scenarios = (group?.groups?.length ? group.groups : [group]).filter(Boolean)
  return {
    logicalOperator: EnumConfig.TopupLogicalOperator.Or,
    displayOrder,
    conditions: [],
    groups: scenarios.map((scenario, index) => ({
      logicalOperator: EnumConfig.TopupLogicalOperator.And,
      displayOrder: index,
      conditions: (scenario.conditions || []).map((condition, conditionIndex) =>
        serializeTopupCondition(condition, conditionIndex)
      ),
      groups: [],
    })),
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

const getFieldLabel = (field, t) => {
  if (field === EnumConfig.TopupConditionField.Age) return t('topup_form.age')
  if (field === EnumConfig.TopupConditionField.Balance) return t('topup_form.balance')
  return t('topup_form.schooling_status')
}

const translateDiagnostic = (diagnostic, scenarioNumber, t) => {
  const params = {
    scenario: scenarioNumber,
    condition: diagnostic.conditionNumber,
    otherCondition: diagnostic.otherConditionNumber,
    field: diagnostic.field ? getFieldLabel(diagnostic.field, t) : undefined,
    conditions: diagnostic.conditionNumbers?.join(', '),
    otherScenario: diagnostic.otherScenarioNumber,
    broaderScenario: diagnostic.broaderScenarioNumber,
  }
  return t(`topup_form.diagnostic_${diagnostic.code}`, params)
}

export const getTopupConditionGroupDiagnostics = (group, t) => {
  const analysis = analyzeTopupConditionGroup(group)
  const scenarioDiagnostics = analysis.scenarioDiagnostics.map((diagnostic, index) => ({
    errors: diagnostic.errors.map((item) => translateDiagnostic(item, index + 1, t)),
    warnings: diagnostic.warnings.map((item) => translateDiagnostic(item, index + 1, t)),
  }))
  const scenarioWarnings = analysis.scenarioWarnings.map((item) =>
    translateDiagnostic(item, item.scenarioNumber, t)
  )
  return {
    scenarioDiagnostics,
    scenarioWarnings,
    warnings: [
      ...scenarioDiagnostics.flatMap((diagnostic) => diagnostic.warnings),
      ...scenarioWarnings,
    ],
    hasErrors: analysis.hasErrors,
  }
}

export const getTopupConditionGroupWarnings = (group, t) =>
  group ? getTopupConditionGroupDiagnostics(group, t).warnings : []

const isTopupConditionGroupStructurallyValid = (group, depth = 1) => {
  if (depth > 2 || !group || !(group.conditions?.length || group.groups?.length)) return false
  const conditionsValid = (group.conditions || []).every((condition) => !hasConditionErrors(condition))
  return (
    conditionsValid &&
    (group.groups || []).every((child) =>
      isTopupConditionGroupStructurallyValid(child, depth + 1)
    )
  )
}

export const isTopupConditionGroupValid = (group) =>
  isTopupConditionGroupStructurallyValid(group) && !analyzeTopupConditionGroup(group).hasErrors
