const fieldValues = { Age: 1, Balance: 2, SchoolingStatus: 3 }
const operatorValues = {
  Equals: 1,
  NotEquals: 2,
  GreaterThan: 3,
  GreaterThanOrEqual: 4,
  LessThan: 5,
  LessThanOrEqual: 6,
}

export const normalizeTopupRuleCondition = (condition) => ({
  ...condition,
  field: typeof condition.field === 'number' ? condition.field : fieldValues[condition.field],
  operator:
    typeof condition.operator === 'number'
      ? condition.operator
      : operatorValues[condition.operator],
})
