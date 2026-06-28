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
const betweenOperator = EnumConfig.TopupConditionOperator.Between

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
  field: typeof condition.field === 'number'
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

export const isTopupConditionGroupValid = (group, depth = 1) => {
  if (depth > 2 || !group || !(group.conditions?.length || group.groups?.length)) return false
  const conditionsValid = (group.conditions || []).every((condition) => {
    if (condition.field === textField) {
      return [
        EnumConfig.TopupConditionOperator.Equals,
        EnumConfig.TopupConditionOperator.NotEquals,
      ].includes(condition.operator) && Boolean(condition.valueText)
    }
    if (condition.valueNumber == null || Number(condition.valueNumber) < 0) return false
    if (
      condition.field === EnumConfig.TopupConditionField.Age &&
      !Number.isInteger(Number(condition.valueNumber))
    )
      return false
    if (condition.operator !== betweenOperator) return true
    if (condition.valueNumberTo == null || condition.valueNumberTo < condition.valueNumber)
      return false
    return (
      condition.field !== EnumConfig.TopupConditionField.Age ||
      Number.isInteger(Number(condition.valueNumberTo))
    )
  })
  return (
    conditionsValid &&
    (group.groups || []).every((child) => isTopupConditionGroupValid(child, depth + 1))
  )
}
