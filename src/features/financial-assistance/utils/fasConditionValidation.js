import { EnumConfig } from '@/shared/config/enumConfig'
import { getConditionFormValue } from './fasFormUtil'

const { FasConditionField, FasConditionOperator } = EnumConfig

const fieldLabels = {
  [FasConditionField.StudentAge]: 'Student age',
  [FasConditionField.StudentNationality]: 'Student nationality',
  [FasConditionField.GuardianNationality]: 'Guardian nationality',
  [FasConditionField.GrossHouseholdIncome]: 'Gross household income',
  [FasConditionField.PerCapitaIncome]: 'Per-capita income',
}

const isNationalityField = (field) =>
  field === FasConditionField.StudentNationality || field === FasConditionField.GuardianNationality

export const getConditionValidationErrors = (condition) => {
  const normalized = getConditionFormValue(condition)
  const errors = {}
  if (isNationalityField(normalized.field)) {
    if (
      ![FasConditionOperator.Equal, FasConditionOperator.NotEqual].includes(normalized.operator)
    ) {
      errors.operator = 'Nationality only supports equal or not equal.'
    }
    if (!normalized.nationality) errors.value = 'Nationality value is required.'
    return errors
  }

  const hasValue = normalized.valueNumber !== '' && normalized.valueNumber != null
  const hasUpper = normalized.valueNumberTo !== '' && normalized.valueNumberTo != null
  const value = Number(normalized.valueNumber)
  const upper = Number(normalized.valueNumberTo)
  const isAge = normalized.field === FasConditionField.StudentAge
  const isIncome = [
    FasConditionField.GrossHouseholdIncome,
    FasConditionField.PerCapitaIncome,
  ].includes(normalized.field)
  if (!hasValue || !Number.isFinite(value)) {
    errors.value = `${fieldLabels[normalized.field]} value is required.`
  } else if (isAge && (value < 16 || value > 30)) {
    errors.value = 'Student age must be between 16 and 30.'
  } else if (isIncome && value < 0) {
    errors.value = 'Income cannot be negative.'
  }
  if (normalized.operator === FasConditionOperator.Between) {
    if (!hasUpper || !Number.isFinite(upper)) {
      errors.valueTo = 'Between upper value is required.'
    } else if (upper < value) {
      errors.valueTo = 'Between upper value must be greater than or equal to lower value.'
    } else if (isAge && (upper < 16 || upper > 30)) {
      errors.valueTo = 'Student age must be between 16 and 30.'
    } else if (isIncome && upper < 0) {
      errors.valueTo = 'Income cannot be negative.'
    }
  }
  return errors
}

const getConditionErrors = (condition) => Object.values(getConditionValidationErrors(condition))

export const getScenarioConflictErrors = (scenario) => {
  const errors = []
  const equalityByField = new Map()
  ;(scenario.conditions || []).forEach((condition) => {
    const normalized = getConditionFormValue(condition)
    if (normalized.operator !== FasConditionOperator.Equal) return
    const value = isNationalityField(normalized.field)
      ? normalized.nationality
      : String(normalized.valueNumber)
    const previous = equalityByField.get(normalized.field)
    if (previous != null && previous !== value) {
      errors.push(`${fieldLabels[normalized.field]} has conflicting equal conditions.`)
    }
    equalityByField.set(normalized.field, value)
  })
  return [...new Set(errors)]
}

export const getScenarioErrors = (scenario) => {
  const errors = (scenario.conditions || []).flatMap(getConditionErrors)
  return [...new Set([...errors, ...getScenarioConflictErrors(scenario)])]
}
