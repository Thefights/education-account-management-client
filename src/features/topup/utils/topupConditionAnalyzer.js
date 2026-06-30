const FIELDS = {
  Age: 'Age',
  Balance: 'Balance',
  SchoolingStatus: 'SchoolingStatus',
}

const OPERATORS = {
  Equals: 'Equals',
  NotEquals: 'NotEquals',
  GreaterThan: 'GreaterThan',
  GreaterThanOrEqual: 'GreaterThanOrEqual',
  LessThan: 'LessThan',
  LessThanOrEqual: 'LessThanOrEqual',
  Between: 'Between',
}

export const TOPUP_AGE_MIN = 16
export const TOPUP_AGE_MAX = 30

const getSignature = (condition = {}) =>
  [
    condition.field,
    condition.operator,
    condition.valueText || '',
    condition.valueNumber ?? '',
    condition.valueNumberTo ?? '',
  ].join('|')

const toCents = (value) => Math.round(Number(value) * 100)

const isAnalyzableCondition = (condition = {}) => {
  if (!Object.values(FIELDS).includes(condition.field)) return false
  if (!Object.values(OPERATORS).includes(condition.operator)) return false

  if (condition.field === FIELDS.SchoolingStatus) {
    return (
      [OPERATORS.Equals, OPERATORS.NotEquals].includes(condition.operator) &&
      Boolean(condition.valueText)
    )
  }

  if (!Number.isFinite(Number(condition.valueNumber)) || Number(condition.valueNumber) < 0) {
    return false
  }
  if (
    condition.field === FIELDS.Age &&
    (!Number.isInteger(Number(condition.valueNumber)) ||
      Number(condition.valueNumber) < TOPUP_AGE_MIN ||
      Number(condition.valueNumber) > TOPUP_AGE_MAX)
  ) {
    return false
  }
  if (condition.operator !== OPERATORS.Between) return true
  if (
    !Number.isFinite(Number(condition.valueNumberTo)) ||
    Number(condition.valueNumberTo) < Number(condition.valueNumber)
  ) {
    return false
  }
  return (
    condition.field !== FIELDS.Age ||
    (Number.isInteger(Number(condition.valueNumberTo)) &&
      Number(condition.valueNumberTo) >= TOPUP_AGE_MIN &&
      Number(condition.valueNumberTo) <= TOPUP_AGE_MAX)
  )
}

const matchesNumber = (value, condition) => {
  const expected = Number(condition.valueNumber)
  switch (condition.operator) {
    case OPERATORS.Equals:
      return value === expected
    case OPERATORS.NotEquals:
      return value !== expected
    case OPERATORS.GreaterThan:
      return value > expected
    case OPERATORS.GreaterThanOrEqual:
      return value >= expected
    case OPERATORS.LessThan:
      return value < expected
    case OPERATORS.LessThanOrEqual:
      return value <= expected
    case OPERATORS.Between:
      return value >= expected && value <= Number(condition.valueNumberTo)
    default:
      return false
  }
}

const createAgeState = (conditions) => {
  const values = new Set()
  for (let age = TOPUP_AGE_MIN; age <= TOPUP_AGE_MAX; age += 1) {
    if (conditions.every((condition) => matchesNumber(age, condition))) values.add(age)
  }
  return { kind: 'finite', values }
}

const createBalanceState = (conditions) => {
  let lower = 0
  let upper = Number.POSITIVE_INFINITY
  const excluded = new Set()

  conditions.forEach((condition) => {
    const value = toCents(condition.valueNumber)
    switch (condition.operator) {
      case OPERATORS.Equals:
        lower = Math.max(lower, value)
        upper = Math.min(upper, value)
        break
      case OPERATORS.NotEquals:
        excluded.add(value)
        break
      case OPERATORS.GreaterThan:
        lower = Math.max(lower, value + 1)
        break
      case OPERATORS.GreaterThanOrEqual:
        lower = Math.max(lower, value)
        break
      case OPERATORS.LessThan:
        upper = Math.min(upper, value - 1)
        break
      case OPERATORS.LessThanOrEqual:
        upper = Math.min(upper, value)
        break
      case OPERATORS.Between:
        lower = Math.max(lower, value)
        upper = Math.min(upper, toCents(condition.valueNumberTo))
        break
      default:
        break
    }
  })

  return { kind: 'interval', lower, upper, excluded }
}

const createTextState = (conditions) => {
  const equals = new Set(
    conditions
      .filter((condition) => condition.operator === OPERATORS.Equals)
      .map((condition) => condition.valueText.trim().toLowerCase())
  )
  const excluded = new Set(
    conditions
      .filter((condition) => condition.operator === OPERATORS.NotEquals)
      .map((condition) => condition.valueText.trim().toLowerCase())
  )
  return {
    kind: 'text',
    required: equals.size === 1 ? [...equals][0] : null,
    conflictingEquals: equals.size > 1,
    excluded,
  }
}

const createFieldState = (field, conditions) => {
  if (field === FIELDS.Age) return createAgeState(conditions)
  if (field === FIELDS.Balance) return createBalanceState(conditions)
  return createTextState(conditions)
}

const countExcludedInRange = (state, lower, upper) => {
  let count = 0
  state.excluded.forEach((value) => {
    if (value >= lower && value <= upper) count += 1
  })
  return count
}

const intervalHasValue = (state, lower = state.lower, upper = state.upper) => {
  const effectiveLower = Math.max(lower, state.lower)
  const effectiveUpper = Math.min(upper, state.upper)
  if (effectiveLower > effectiveUpper) return false
  if (!Number.isFinite(effectiveUpper)) return true
  return effectiveUpper - effectiveLower + 1 > countExcludedInRange(state, effectiveLower, effectiveUpper)
}

const isStateEmpty = (state) => {
  if (state.kind === 'finite') return state.values.size === 0
  if (state.kind === 'interval') return !intervalHasValue(state)
  return state.conflictingEquals || (state.required != null && state.excluded.has(state.required))
}

const isFiniteSubset = (left, right) =>
  [...left.values].every((value) => right.values.has(value))

const isIntervalSubset = (left, right) => {
  if (intervalHasValue(left, left.lower, right.lower - 1)) return false
  if (Number.isFinite(right.upper) && intervalHasValue(left, right.upper + 1, left.upper)) {
    return false
  }
  return ![...right.excluded].some(
    (value) => value >= left.lower && value <= left.upper && !left.excluded.has(value)
  )
}

const isTextSubset = (left, right) => {
  if (left.required != null) {
    if (right.required != null) return left.required === right.required
    return !right.excluded.has(left.required)
  }
  if (right.required != null) return false
  return [...right.excluded].every((value) => left.excluded.has(value))
}

const isStateSubset = (left, right) => {
  if (left.kind === 'finite') return isFiniteSubset(left, right)
  if (left.kind === 'interval') return isIntervalSubset(left, right)
  return isTextSubset(left, right)
}

const isStateEqual = (left, right) =>
  isStateSubset(left, right) && isStateSubset(right, left)

const createUniverseState = (field) => {
  if (field === FIELDS.Age) return createAgeState([])
  if (field === FIELDS.Balance) return createBalanceState([])
  return createTextState([])
}

const isBroadCondition = (condition) =>
  isStateEqual(createFieldState(condition.field, [condition]), createUniverseState(condition.field))

const analyzeScenario = (scenario = {}) => {
  const conditions = scenario.conditions || []
  if (!conditions.length || !conditions.every(isAnalyzableCondition)) {
    return { complete: false, errors: [], warnings: [], states: null }
  }

  const conditionsByField = new Map()
  conditions.forEach((condition, index) => {
    const items = conditionsByField.get(condition.field) || []
    items.push({ condition, index })
    conditionsByField.set(condition.field, items)
  })

  const errors = []
  const warnings = []
  const states = new Map()

  conditionsByField.forEach((items, field) => {
    const fieldConditions = items.map((item) => item.condition)
    const state = createFieldState(field, fieldConditions)
    states.set(field, state)
    if (isStateEmpty(state)) {
      errors.push({
        code: 'scenario_conflict',
        field,
        conditionNumbers: items.map((item) => item.index + 1),
      })
      return
    }

    const duplicateIndexes = new Set()
    const signatures = new Map()
    items.forEach(({ condition, index }) => {
      const signature = getSignature(condition)
      if (signatures.has(signature)) {
        duplicateIndexes.add(index)
        warnings.push({
          code: 'duplicate_condition',
          conditionNumber: index + 1,
          otherConditionNumber: signatures.get(signature) + 1,
        })
      } else {
        signatures.set(signature, index)
      }
    })

    const equivalentIndexes = new Set()
    items.forEach(({ condition, index }, itemIndex) => {
      if (duplicateIndexes.has(index)) return
      const equivalent = items.slice(0, itemIndex).find(
        (candidate) =>
          !duplicateIndexes.has(candidate.index) &&
          isStateEqual(
            createFieldState(field, [condition]),
            createFieldState(field, [candidate.condition])
          )
      )
      if (!equivalent) return
      equivalentIndexes.add(index)
      warnings.push({
        code: 'equivalent_condition',
        conditionNumber: index + 1,
        otherConditionNumber: equivalent.index + 1,
      })
    })

    items.forEach(({ index }) => {
      if (duplicateIndexes.has(index) || equivalentIndexes.has(index)) return
      const withoutCondition = items
        .filter((item) => item.index !== index)
        .map((item) => item.condition)
      if (
        withoutCondition.length &&
        isStateEqual(state, createFieldState(field, withoutCondition))
      ) {
        warnings.push({ code: 'redundant_condition', conditionNumber: index + 1 })
      }
    })
  })

  conditions.forEach((condition, index) => {
    if (isBroadCondition(condition)) {
      warnings.push({ code: 'broad_condition', conditionNumber: index + 1 })
    }
  })

  return { complete: true, errors, warnings, states }
}

const getScenarioState = (analysis, field) =>
  analysis.states.get(field) || createUniverseState(field)

const isScenarioSubset = (left, right) =>
  Object.values(FIELDS).every((field) =>
    isStateSubset(getScenarioState(left, field), getScenarioState(right, field))
  )

export const analyzeTopupConditionGroup = (group) => {
  const scenarios = group?.groups?.length ? group.groups : group ? [group] : []
  const scenarioDiagnostics = scenarios.map(analyzeScenario)
  const scenarioWarnings = []
  const warnedScenarios = new Set()

  scenarioDiagnostics.forEach((analysis, index) => {
    if (!analysis.complete || analysis.errors.length) return
    for (let otherIndex = 0; otherIndex < index; otherIndex += 1) {
      const other = scenarioDiagnostics[otherIndex]
      if (!other.complete || other.errors.length) continue
      const currentSubsetOther = isScenarioSubset(analysis, other)
      const otherSubsetCurrent = isScenarioSubset(other, analysis)
      if (currentSubsetOther && otherSubsetCurrent) {
        scenarioWarnings.push({
          code: 'duplicate_scenario',
          scenarioNumber: index + 1,
          otherScenarioNumber: otherIndex + 1,
        })
        warnedScenarios.add(index)
        break
      }
      if (currentSubsetOther && !warnedScenarios.has(index)) {
        scenarioWarnings.push({
          code: 'subsumed_scenario',
          scenarioNumber: index + 1,
          broaderScenarioNumber: otherIndex + 1,
        })
        warnedScenarios.add(index)
        break
      }
      if (otherSubsetCurrent && !warnedScenarios.has(otherIndex)) {
        scenarioWarnings.push({
          code: 'subsumed_scenario',
          scenarioNumber: otherIndex + 1,
          broaderScenarioNumber: index + 1,
        })
        warnedScenarios.add(otherIndex)
      }
    }
  })

  return {
    scenarioDiagnostics,
    scenarioWarnings,
    hasErrors: scenarioDiagnostics.some((diagnostic) => diagnostic.errors.length > 0),
  }
}

