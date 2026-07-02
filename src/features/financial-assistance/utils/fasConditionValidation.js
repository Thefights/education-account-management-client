import { EnumConfig } from '@/shared/config/enumConfig'
import { getTranslation } from '@/shared/hooks/useTranslation'
import { getConditionFormValue } from './fasFormUtil'

const { FasConditionField, FasConditionOperator } = EnumConfig

const t = getTranslation

const fieldLabels = {
  [FasConditionField.StudentAge]: () => t('financial_assistance.admin.condition.field.student_age'),
  [FasConditionField.StudentNationality]: () =>
    t('financial_assistance.admin.condition.field.student_nationality'),
  [FasConditionField.GuardianNationality]: () =>
    t('financial_assistance.field.guardian_nationality'),
  [FasConditionField.GrossHouseholdIncome]: () =>
    t('financial_assistance.field.gross_household_income'),
  [FasConditionField.PerCapitaIncome]: () => t('financial_assistance.field.per_capita_income'),
}

const getFieldLabel = (field) => fieldLabels[field]?.() || field

const isNationalityField = (field) =>
  field === FasConditionField.StudentNationality || field === FasConditionField.GuardianNationality

export const getConditionValidationErrors = (condition) => {
  const normalized = getConditionFormValue(condition)
  const errors = {}
  if (isNationalityField(normalized.field)) {
    if (
      ![FasConditionOperator.Equal, FasConditionOperator.NotEqual].includes(normalized.operator)
    ) {
      errors.operator = t('financial_assistance.admin.message.nationality_operator_invalid')
    }
    if (!normalized.nationality) {
      errors.value = t('financial_assistance.admin.message.nationality_required')
    }
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
    errors.value = t('financial_assistance.admin.message.condition_value_required', {
      field: getFieldLabel(normalized.field),
    })
  } else if (isAge && (value < 16 || value > 30)) {
    errors.value = t('financial_assistance.admin.message.student_age_range')
  } else if (isIncome && value < 0) {
    errors.value = t('financial_assistance.admin.message.income_non_negative')
  }
  if (normalized.operator === FasConditionOperator.Between) {
    if (!hasUpper || !Number.isFinite(upper)) {
      errors.valueTo = t('financial_assistance.admin.message.between_upper_required')
    } else if (upper < value) {
      errors.valueTo = t('financial_assistance.admin.message.between_upper_gte_lower')
    } else if (isAge && (upper < 16 || upper > 30)) {
      errors.valueTo = t('financial_assistance.admin.message.student_age_range')
    } else if (isIncome && upper < 0) {
      errors.valueTo = t('financial_assistance.admin.message.income_non_negative')
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
      errors.push(
        t('financial_assistance.admin.message.conflicting_equal_conditions', {
          field: getFieldLabel(normalized.field),
        })
      )
    }
    equalityByField.set(normalized.field, value)
  })
  return [...new Set(errors)]
}

export const getScenarioErrors = (scenario) => {
  const errors = (scenario.conditions || []).flatMap(getConditionErrors)
  return [...new Set([...errors, ...getScenarioConflictErrors(scenario)])]
}
