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

const validateCondition = (condition) => {
  const normalized = getConditionFormValue(condition)
  const errors = []
  if (isNationalityField(normalized.field)) {
    if (
      ![FasConditionOperator.Equal, FasConditionOperator.NotEqual].includes(normalized.operator)
    ) {
      errors.push('Nationality only supports equal or not equal.')
    }
    if (!normalized.nationality) errors.push('Nationality value is required.')
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
  if (!hasValue || !Number.isFinite(value))
    errors.push(`${fieldLabels[normalized.field]} value is required.`)
  if (isAge && (value < 16 || value > 30)) errors.push('Student age must be between 16 and 30.')
  if (isIncome && value < 0) errors.push('Income cannot be negative.')
  if (normalized.operator === FasConditionOperator.Between) {
    if (!hasUpper || !Number.isFinite(upper)) errors.push('Between upper value is required.')
    if (upper < value)
      errors.push('Between upper value must be greater than or equal to lower value.')
    if (isAge && (upper < 16 || upper > 30)) errors.push('Student age must be between 16 and 30.')
    if (isIncome && upper < 0) errors.push('Income cannot be negative.')
  }
  return errors
}

export const getScenarioErrors = (scenario) => {
  const errors = (scenario.conditions || []).flatMap(validateCondition)
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
