const fieldValues = { Age: 1, Balance: 2, SchoolingStatus: 3 }
const operatorValues = {
  Equals: 1,
  NotEquals: 2,
  GreaterThan: 3,
  GreaterThanOrEqual: 4,
  LessThan: 5,
  LessThanOrEqual: 6,
  Between: 7,
}
const logicalOperatorValues = { And: 1, Or: 2 }

export const createEmptyTopupCondition = () => ({
  field: 1,
  operator: 1,
  valueText: null,
  valueNumber: null,
  valueNumberTo: null,
  displayOrder: 0,
})

export const createEmptyTopupConditionGroup = () => ({
  logicalOperator: 1,
  displayOrder: 0,
  conditions: [createEmptyTopupCondition()],
  groups: [],
})

const normalizeTopupCondition = (condition = {}) => ({
  ...condition,
  field: typeof condition.field === 'number' ? condition.field : fieldValues[condition.field] || 1,
  operator:
    typeof condition.operator === 'number'
      ? condition.operator
      : operatorValues[condition.operator] || 1,
})

export const normalizeTopupConditionGroup = (group) => {
  if (!group) return createEmptyTopupConditionGroup()
  return {
    ...group,
    logicalOperator:
      typeof group.logicalOperator === 'number'
        ? group.logicalOperator
        : logicalOperatorValues[group.logicalOperator] || 1,
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
      valueText: condition.field === 3 ? condition.valueText : null,
      valueNumber: condition.field === 3 ? null : condition.valueNumber,
      valueNumberTo:
        condition.field !== 3 && condition.operator === 7 ? condition.valueNumberTo : null,
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
    if (condition.field === 3) {
      return [1, 2].includes(condition.operator) && Boolean(condition.valueText)
    }
    if (condition.valueNumber == null || Number(condition.valueNumber) < 0) return false
    if (condition.field === 1 && !Number.isInteger(Number(condition.valueNumber))) return false
    if (condition.operator !== 7) return true
    if (condition.valueNumberTo == null || condition.valueNumberTo < condition.valueNumber)
      return false
    return condition.field !== 1 || Number.isInteger(Number(condition.valueNumberTo))
  })
  return (
    conditionsValid &&
    (group.groups || []).every((child) => isTopupConditionGroupValid(child, depth + 1))
  )
}
