import {
  createEmptyCondition,
  createEmptyScenario,
  getConditionFormValue,
  getConditionGroupFormValue,
} from '@/features/financial-assistance/utils/fasFormUtil'
import {
  getConditionValidationErrors,
  getScenarioConflictErrors,
  getScenarioErrors,
} from '@/features/financial-assistance/utils/fasConditionValidation'
import { EnumConfig } from '@/shared/config/enumConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  formatCurrencyBasedOnCurrentLanguage,
  getCurrencySymbolBasedOnCurrentLanguage,
} from '@/shared/utils/formatCurrencyUtil'
import { ApartmentOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Col,
  Flex,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Tree,
  Typography,
  theme,
} from 'antd'
import { useMemo } from 'react'

const AGE_MIN = 16
const AGE_MAX = 30
const FIELDS = EnumConfig.FasConditionField
const OPERATORS = EnumConfig.FasConditionOperator
const LOGICAL_OPERATORS = EnumConfig.FasLogicalOperator
const FIELD_CONTROL_STYLE = { width: '100%', height: 40 }

const getNationalityOptions = (t) => [
  {
    value: EnumConfig.NationalityCategory.SingaporeCitizen,
    label: t('financial_assistance.enum.nationality.singapore_citizen'),
  },
  { value: EnumConfig.NationalityCategory.Other, label: t('financial_assistance.enum.nationality.foreigner') },
]

const getFieldOptions = (t) => [
  { value: FIELDS.StudentAge, label: t('financial_assistance.admin.condition.field.student_age') },
  {
    value: FIELDS.StudentNationality,
    label: t('financial_assistance.admin.condition.field.student_nationality'),
  },
  {
    value: FIELDS.GuardianNationality,
    label: t('financial_assistance.field.guardian_nationality'),
  },
  {
    value: FIELDS.GrossHouseholdIncome,
    label: t('financial_assistance.field.gross_household_income'),
  },
  { value: FIELDS.PerCapitaIncome, label: t('financial_assistance.field.per_capita_income') },
]

const getOperatorOptions = (t, isText = false) => {
  const options = [
    { value: OPERATORS.Equal, label: t('financial_assistance.admin.condition.operator.equal') },
    { value: OPERATORS.NotEqual, label: t('financial_assistance.admin.condition.operator.not_equal') },
    {
      value: OPERATORS.GreaterThan,
      label: t('financial_assistance.admin.condition.operator.greater_than'),
    },
    {
      value: OPERATORS.GreaterThanOrEqual,
      label: t('financial_assistance.admin.condition.operator.greater_than_or_equal'),
    },
    { value: OPERATORS.LessThan, label: t('financial_assistance.admin.condition.operator.less_than') },
    {
      value: OPERATORS.LessThanOrEqual,
      label: t('financial_assistance.admin.condition.operator.less_than_or_equal'),
    },
    { value: OPERATORS.Between, label: t('financial_assistance.admin.condition.operator.between') },
  ]
  return isText ? options.slice(0, 2) : options
}

const isNationalityField = (field) =>
  field === FIELDS.StudentNationality || field === FIELDS.GuardianNationality
const isAgeField = (field) => field === FIELDS.StudentAge
const isIncomeField = (field) =>
  field === FIELDS.GrossHouseholdIncome || field === FIELDS.PerCapitaIncome

const getOptionLabel = (options, value, fallback) =>
  options.find((option) => option.value === value)?.label || value || fallback

const getConditionValueText = (condition, t) => {
  const normalized = getConditionFormValue(condition)
  if (isNationalityField(normalized.field)) {
    return (
      getOptionLabel(getNationalityOptions(t), normalized.nationality, '') ||
      t('financial_assistance.admin.message.value_missing')
    )
  }
  if (normalized.valueNumber === '' || normalized.valueNumber == null) {
    return t('financial_assistance.admin.message.value_missing')
  }
  const formatValue = (value) => {
    if (isAgeField(normalized.field)) {
      return t('financial_assistance.admin.text.years_count', {
        count: Number(value).toLocaleString(),
      })
    }
    if (isIncomeField(normalized.field)) return formatCurrencyBasedOnCurrentLanguage(value)
    return Number(value).toLocaleString()
  }
  if (normalized.operator !== OPERATORS.Between) return formatValue(normalized.valueNumber)
  return `${formatValue(normalized.valueNumber)} ${t('financial_assistance.admin.text.and')} ${
    normalized.valueNumberTo === '' || normalized.valueNumberTo == null
      ? t('financial_assistance.admin.message.value_missing')
      : formatValue(normalized.valueNumberTo)
  }`
}

const FasConditionSentence = ({ condition }) => {
  const { t } = useTranslation()
  const normalized = getConditionFormValue(condition)
  return (
    <Typography.Text>
      <Typography.Text strong>{getOptionLabel(getFieldOptions(t), normalized.field, '-')}</Typography.Text>{' '}
      {getOptionLabel(getOperatorOptions(t, isNationalityField(normalized.field)), normalized.operator, '-')}{' '}
      <Typography.Text strong>{getConditionValueText(normalized, t)}</Typography.Text>
    </Typography.Text>
  )
}

const buildScenarioTreeNode = (scenario, index, t) => ({
  key: `scenario-${index}`,
  icon: <ApartmentOutlined />,
  title: (
    <Space size={8} wrap>
      <Typography.Text strong>
        {t('financial_assistance.admin.text.scenario_number', { number: index + 1 })}
      </Typography.Text>
      <Tag color="blue">AND</Tag>
      <Typography.Text type="secondary">
        {t('financial_assistance.admin.condition.all_conditions_below_match')}
      </Typography.Text>
    </Space>
  ),
  children: (scenario.conditions || []).map((condition, conditionIndex) => ({
    key: `scenario-${index}-condition-${condition.id ?? conditionIndex}`,
    title: <FasConditionSentence condition={condition} />,
  })),
})

const SectionShell = ({ title, subtitle, accentColor, onDelete, children, token }) => {
  const { t } = useTranslation()

  return (
  <div
    style={{
      border: `1px solid ${token.colorBorder}`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: token.borderRadiusLG,
      background: token.colorBgContainer,
      overflow: 'hidden',
    }}
  >
    <Flex
      align="center"
      justify="space-between"
      gap={12}
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
      }}
    >
      <Flex vertical gap={2}>
        <Typography.Text strong>{title}</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {subtitle}
        </Typography.Text>
      </Flex>
      {onDelete ? (
        <Button danger type="text" onClick={onDelete}>
          {t('financial_assistance.admin.action.remove_group')}
        </Button>
      ) : null}
    </Flex>
    <div style={{ padding: 16 }}>{children}</div>
  </div>
  )
}

const ConditionRow = ({ condition, index, onChange, onDelete, token, showValidationErrors }) => {
  const { t } = useTranslation()
  const normalized = getConditionFormValue(condition)
  const isText = isNationalityField(normalized.field)
  const isBetween = !isText && normalized.operator === OPERATORS.Between
  const validationErrors = showValidationErrors ? getConditionValidationErrors(normalized) : {}
  const operatorError = validationErrors.operator
  const valueError = validationErrors.value
  const valueToError = validationErrors.valueTo
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()

  return (
    <div
      style={{
        position: 'relative',
        padding: 12,
        paddingRight: 48,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
      }}
    >
      <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
        <Tag>{index + 1}</Tag>
        <Typography.Text type="secondary">{t('financial_assistance.admin.condition.rule')}</Typography.Text>
      </Flex>
      {onDelete ? (
        <Tooltip title={t('financial_assistance.admin.action.delete_condition')}>
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={onDelete}
            style={{ position: 'absolute', top: 10, right: 8 }}
          />
        </Tooltip>
      ) : null}
      <Row gutter={[8, 8]} align="top">
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Select
            aria-label="Field"
            placeholder={t('financial_assistance.admin.placeholder.select_field')}
            value={normalized.field}
            options={getFieldOptions(t)}
            style={FIELD_CONTROL_STYLE}
            onChange={(field) =>
              onChange({
                ...normalized,
                field,
                operator: OPERATORS.Equal,
                valueNumber: null,
                valueNumberTo: null,
                nationality: isNationalityField(field)
                  ? EnumConfig.NationalityCategory.SingaporeCitizen
                  : null,
              })
            }
          />
        </Col>
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Select
            aria-label="Operator"
            placeholder={t('financial_assistance.admin.placeholder.select_operator')}
            value={normalized.operator}
            options={getOperatorOptions(t, isText)}
            status={operatorError ? 'error' : undefined}
            style={FIELD_CONTROL_STYLE}
            onChange={(operator) =>
              onChange({
                ...normalized,
                operator,
                valueNumberTo: operator === OPERATORS.Between ? normalized.valueNumberTo : null,
              })
            }
          />
        </Col>
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Flex vertical gap={4}>
            {isText ? (
              <Select
                aria-label="Value"
                status={valueError ? 'error' : undefined}
                value={normalized.nationality}
                placeholder={t('financial_assistance.admin.placeholder.select_value')}
                options={getNationalityOptions(t)}
                style={FIELD_CONTROL_STYLE}
                onChange={(nationality) => onChange({ ...normalized, nationality })}
              />
            ) : (
              <InputNumber
                aria-label="Value"
                status={valueError ? 'error' : undefined}
                value={normalized.valueNumber}
                placeholder={
                  isAgeField(normalized.field)
                    ? t('financial_assistance.admin.placeholder.age_example', { value: AGE_MIN })
                    : t('financial_assistance.admin.placeholder.amount_example')
                }
                min={isAgeField(normalized.field) ? AGE_MIN : 0}
                max={isAgeField(normalized.field) ? AGE_MAX : undefined}
                precision={isAgeField(normalized.field) ? 0 : 2}
                prefix={isIncomeField(normalized.field) ? currencySymbol : undefined}
                suffix={
                  isAgeField(normalized.field)
                    ? t('financial_assistance.admin.text.years')
                    : undefined
                }
                style={FIELD_CONTROL_STYLE}
                onChange={(valueNumber) => onChange({ ...normalized, valueNumber })}
              />
            )}
            {valueError && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {valueError}
              </Typography.Text>
            )}
          </Flex>
        </Col>
        {isBetween && (
          <Col xs={24} md={12} xl={6}>
            <Flex vertical gap={4}>
              <InputNumber
                aria-label="To value"
                status={valueToError ? 'error' : undefined}
                value={normalized.valueNumberTo}
                placeholder={
                  isAgeField(normalized.field)
                    ? t('financial_assistance.admin.placeholder.age_example', { value: AGE_MAX })
                    : t('financial_assistance.admin.placeholder.amount_to_example')
                }
                min={isAgeField(normalized.field) ? AGE_MIN : 0}
                max={isAgeField(normalized.field) ? AGE_MAX : undefined}
                precision={isAgeField(normalized.field) ? 0 : 2}
                prefix={isIncomeField(normalized.field) ? currencySymbol : undefined}
                suffix={
                  isAgeField(normalized.field)
                    ? t('financial_assistance.admin.text.years')
                    : undefined
                }
                style={FIELD_CONTROL_STYLE}
                onChange={(valueNumberTo) => onChange({ ...normalized, valueNumberTo })}
              />
              {valueToError && (
                <Typography.Text type="danger" style={{ fontSize: 12 }}>
                  {valueToError}
                </Typography.Text>
              )}
            </Flex>
          </Col>
        )}
      </Row>
    </div>
  )
}

const GroupEditor = ({
  group,
  onChange,
  onDelete,
  groupNumber,
  token,
  errors = [],
  showValidationErrors = false,
  canDelete = true,
}) => {
  const { t } = useTranslation()
  const conditions = group.conditions || []
  const updateCondition = (index, nextCondition) =>
    onChange({
      ...group,
      logicalOperator: LOGICAL_OPERATORS.And,
      groups: [],
      conditions: conditions.map((condition, itemIndex) =>
        itemIndex === index ? nextCondition : condition
      ),
    })

  return (
    <SectionShell
      title={t('financial_assistance.admin.text.eligibility_group_number', { number: groupNumber })}
      subtitle={t('financial_assistance.admin.condition.scenario_subtitle')}
      accentColor={token.colorInfo}
      onDelete={canDelete ? onDelete : null}
      token={token}
    >
      <Flex vertical gap={12}>
        {conditions.map((condition, index) => (
          <Flex key={condition.id ?? `condition-${index}`} vertical gap={12}>
            {index > 0 && (
              <Flex align="center" gap={12} role="separator">
                <div style={{ flex: 1, borderTop: `1px solid ${token.colorBorderSecondary}` }} />
                <Typography.Text
                  style={{
                    color: token.colorWarningText,
                    fontSize: 12,
                    fontWeight: token.fontWeightStrong,
                  }}
                >
                  AND
                </Typography.Text>
                <div style={{ flex: 1, borderTop: `1px solid ${token.colorBorderSecondary}` }} />
              </Flex>
            )}
            <ConditionRow
              condition={condition}
              index={index}
              token={token}
              showValidationErrors={showValidationErrors}
              onChange={(nextCondition) => updateCondition(index, nextCondition)}
              onDelete={
                conditions.length > 1
                  ? () =>
                      onChange({
                        ...group,
                        logicalOperator: LOGICAL_OPERATORS.And,
                        groups: [],
                        conditions: conditions.filter((_, itemIndex) => itemIndex !== index),
                      })
                  : null
              }
            />
          </Flex>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          style={{ height: 40 }}
          onClick={() =>
            onChange({
              ...group,
              logicalOperator: LOGICAL_OPERATORS.And,
              groups: [],
              conditions: [...conditions, createEmptyCondition()],
            })
          }
        >
          {t('financial_assistance.admin.action.add_rule')}
        </Button>
        {showValidationErrors && !!errors.length && (
          <Alert
            type="error"
            showIcon
            message={t('financial_assistance.admin.message.scenario_invalid_conditions')}
            description={
              <Flex vertical gap={2}>
                {errors.map((error) => (
                  <Typography.Text key={error} type="danger">
                    {error}
                  </Typography.Text>
                ))}
              </Flex>
            }
          />
        )}
      </Flex>
    </SectionShell>
  )
}

const FasConditionEditor = ({ value, onChange, showValidationErrors = false }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const group = getConditionGroupFormValue(value)
  const scenarios = useMemo(
    () => (group.groups?.length ? group.groups : [createEmptyScenario()]),
    [group.groups]
  )
  const scenarioErrors = scenarios.map((scenario) => getScenarioErrors(scenario))
  const scenarioConflictErrors = scenarios.map((scenario) => getScenarioConflictErrors(scenario))
  const hasErrors = scenarioErrors.some((errors) => errors.length)
  const hasCondition = scenarios.some((scenario) => (scenario.conditions || []).length)
  const emitScenarioRoot = (groups) =>
    onChange?.({
      ...group,
      logicalOperator: LOGICAL_OPERATORS.Or,
      conditions: [],
      groups,
    })
  const updateScenario = (index, nextScenario) =>
    emitScenarioRoot(
      scenarios.map((scenario, itemIndex) =>
        itemIndex === index
          ? { ...nextScenario, logicalOperator: LOGICAL_OPERATORS.And, groups: [] }
          : scenario
      )
    )

  return (
    <Flex vertical gap={12}>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        {t('financial_assistance.admin.condition.any_one_group_description')}
      </Typography.Paragraph>
      {scenarios.map((scenario, index) => (
        <Flex key={scenario.id ?? `scenario-${index}`} vertical gap={12}>
          {index > 0 && (
            <Flex align="center" gap={12} role="separator">
              <div style={{ flex: 1, borderTop: `1px solid ${token.colorBorderSecondary}` }} />
              <Tag
                color="cyan"
                style={{
                  margin: 0,
                  borderRadius: token.borderRadius,
                  fontWeight: token.fontWeightStrong,
                  paddingInline: 16,
                }}
              >
                {t('financial_assistance.admin.condition.or_group_separator')}
              </Tag>
              <div style={{ flex: 1, borderTop: `1px solid ${token.colorBorderSecondary}` }} />
            </Flex>
          )}
          <GroupEditor
            group={scenario}
            groupNumber={index + 1}
            token={token}
            canDelete={scenarios.length > 1}
            errors={scenarioConflictErrors[index] || []}
            showValidationErrors={showValidationErrors}
            onChange={(nextScenario) => updateScenario(index, nextScenario)}
            onDelete={() =>
              emitScenarioRoot(scenarios.filter((_, itemIndex) => itemIndex !== index))
            }
          />
        </Flex>
      ))}
      <Button
        block
        icon={<PlusOutlined />}
        style={{ height: 40 }}
        onClick={() => emitScenarioRoot([...scenarios, createEmptyScenario()])}
      >
        {t('financial_assistance.admin.action.add_another_group')}
      </Button>
      {hasCondition && !hasErrors && (
        <div
          style={{
            padding: 16,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
          }}
        >
          <Typography.Text strong>{t('financial_assistance.admin.condition.readable_preview')}</Typography.Text>
          <Tree
            showIcon
            showLine
            selectable={false}
            defaultExpandAll
            treeData={scenarios.map((scenario, index) => buildScenarioTreeNode(scenario, index, t))}
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillAlter,
            }}
          />
        </div>
      )}
      {showValidationErrors && hasErrors && (
        <Typography.Text type="danger">
          {t('financial_assistance.admin.message.fix_eligibility_conditions')}
        </Typography.Text>
      )}
    </Flex>
  )
}

export default FasConditionEditor
