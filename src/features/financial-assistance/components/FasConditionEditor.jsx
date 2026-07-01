import {
  createEmptyCondition,
  createEmptyScenario,
  getConditionFormValue,
  getConditionGroupFormValue,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { getScenarioErrors } from '@/features/financial-assistance/utils/fasConditionValidation'
import { EnumConfig } from '@/shared/config/enumConfig'
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

const nationalityOptions = [
  { value: EnumConfig.NationalityCategory.SingaporeCitizen, label: 'Singapore Citizen' },
  { value: EnumConfig.NationalityCategory.Other, label: 'Foreigner' },
]

const getFieldOptions = () => [
  { value: FIELDS.StudentAge, label: 'Student age' },
  { value: FIELDS.StudentNationality, label: 'Student nationality' },
  { value: FIELDS.GuardianNationality, label: 'Guardian nationality' },
  { value: FIELDS.GrossHouseholdIncome, label: 'Gross household income' },
  { value: FIELDS.PerCapitaIncome, label: 'Per-capita income' },
]

const getOperatorOptions = (isText = false) => {
  const options = [
    { value: OPERATORS.Equal, label: '= (is)' },
    { value: OPERATORS.NotEqual, label: '≠ (is not)' },
    { value: OPERATORS.GreaterThan, label: '> (greater than)' },
    { value: OPERATORS.GreaterThanOrEqual, label: '≥ (at least)' },
    { value: OPERATORS.LessThan, label: '< (less than)' },
    { value: OPERATORS.LessThanOrEqual, label: '≤ (at most)' },
    { value: OPERATORS.Between, label: '↔ (between)' },
  ]
  return isText ? options.slice(0, 2) : options
}

const isNationalityField = (field) =>
  field === FIELDS.StudentNationality || field === FIELDS.GuardianNationality
const isAgeField = (field) => field === FIELDS.StudentAge
const isIncomeField = (field) =>
  field === FIELDS.GrossHouseholdIncome || field === FIELDS.PerCapitaIncome

const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || '—'

const getConditionValueText = (condition) => {
  const normalized = getConditionFormValue(condition)
  if (isNationalityField(normalized.field)) {
    return getOptionLabel(nationalityOptions, normalized.nationality) || 'Value missing'
  }
  if (normalized.valueNumber === '' || normalized.valueNumber == null) return 'Value missing'
  const formatValue = (value) => {
    if (isAgeField(normalized.field)) return `${Number(value).toLocaleString()} years`
    if (isIncomeField(normalized.field)) return formatCurrencyBasedOnCurrentLanguage(value)
    return Number(value).toLocaleString()
  }
  if (normalized.operator !== OPERATORS.Between) return formatValue(normalized.valueNumber)
  return `${formatValue(normalized.valueNumber)} and ${
    normalized.valueNumberTo === '' || normalized.valueNumberTo == null
      ? 'Value missing'
      : formatValue(normalized.valueNumberTo)
  }`
}

const FasConditionSentence = ({ condition }) => {
  const normalized = getConditionFormValue(condition)
  return (
    <Typography.Text>
      <Typography.Text strong>{getOptionLabel(getFieldOptions(), normalized.field)}</Typography.Text>{' '}
      {getOptionLabel(getOperatorOptions(isNationalityField(normalized.field)), normalized.operator)}{' '}
      <Typography.Text strong>{getConditionValueText(normalized)}</Typography.Text>
    </Typography.Text>
  )
}

const buildScenarioTreeNode = (scenario, index) => ({
  key: `scenario-${index}`,
  icon: <ApartmentOutlined />,
  title: (
    <Space size={8} wrap>
      <Typography.Text strong>Scenario {index + 1}</Typography.Text>
      <Tag color="blue">AND</Tag>
      <Typography.Text type="secondary">All conditions below must match</Typography.Text>
    </Space>
  ),
  children: (scenario.conditions || []).map((condition, conditionIndex) => ({
    key: `scenario-${index}-condition-${condition.id ?? conditionIndex}`,
    title: <FasConditionSentence condition={condition} />,
  })),
})

const SectionShell = ({ title, subtitle, accentColor, onDelete, children, token }) => (
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
        <Tooltip title="Delete group">
          <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete} />
        </Tooltip>
      ) : null}
    </Flex>
    <div style={{ padding: 16 }}>{children}</div>
  </div>
)

const ConditionRow = ({ condition, index, onChange, onDelete, token, showValidationErrors }) => {
  const normalized = getConditionFormValue(condition)
  const isText = isNationalityField(normalized.field)
  const isBetween = !isText && normalized.operator === OPERATORS.Between
  const rowErrors = showValidationErrors ? getScenarioErrors({ conditions: [normalized] }) : []
  const hasError = rowErrors.length > 0
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
        <Typography.Text type="secondary">Rule</Typography.Text>
      </Flex>
      {onDelete ? (
        <Tooltip title="Delete condition">
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
            placeholder="Select field"
            value={normalized.field}
            options={getFieldOptions()}
            style={{ width: '100%', height: 32 }}
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
            placeholder="Select operator"
            value={normalized.operator}
            options={getOperatorOptions(isText)}
            status={hasError ? 'error' : undefined}
            style={{ width: '100%', height: 32 }}
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
                status={hasError ? 'error' : undefined}
                value={normalized.nationality}
                placeholder="Select value"
                options={nationalityOptions}
                style={{ width: '100%', height: 32 }}
                onChange={(nationality) => onChange({ ...normalized, nationality })}
              />
            ) : (
              <InputNumber
                aria-label="Value"
                status={hasError ? 'error' : undefined}
                value={normalized.valueNumber}
                placeholder={isAgeField(normalized.field) ? `e.g. ${AGE_MIN}` : 'e.g. 100.00'}
                min={isAgeField(normalized.field) ? AGE_MIN : 0}
                max={isAgeField(normalized.field) ? AGE_MAX : undefined}
                precision={isAgeField(normalized.field) ? 0 : 2}
                prefix={isIncomeField(normalized.field) ? currencySymbol : undefined}
                suffix={isAgeField(normalized.field) ? 'years' : undefined}
                style={{ width: '100%', height: 32 }}
                onChange={(valueNumber) => onChange({ ...normalized, valueNumber })}
              />
            )}
          </Flex>
        </Col>
        {isBetween && (
          <Col xs={24} md={12} xl={6}>
            <InputNumber
              aria-label="To value"
              status={hasError ? 'error' : undefined}
              value={normalized.valueNumberTo}
              placeholder={isAgeField(normalized.field) ? `e.g. ${AGE_MAX}` : 'e.g. 500.00'}
              min={isAgeField(normalized.field) ? AGE_MIN : 0}
              max={isAgeField(normalized.field) ? AGE_MAX : undefined}
              precision={isAgeField(normalized.field) ? 0 : 2}
              prefix={isIncomeField(normalized.field) ? currencySymbol : undefined}
              suffix={isAgeField(normalized.field) ? 'years' : undefined}
              style={{ width: '100%', height: 32 }}
              onChange={(valueNumberTo) => onChange({ ...normalized, valueNumberTo })}
            />
          </Col>
        )}
      </Row>
      {hasError && (
        <Typography.Text type="danger" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
          {rowErrors[0]}
        </Typography.Text>
      )}
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
      title={`Scenario ${groupNumber}`}
      subtitle="Student is eligible when all rules in this scenario match."
      accentColor={token.colorInfo}
      onDelete={canDelete ? onDelete : null}
      token={token}
    >
      <Flex vertical gap={12}>
        {conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id ?? `condition-${index}`}
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
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() =>
            onChange({
              ...group,
              logicalOperator: LOGICAL_OPERATORS.And,
              groups: [],
              conditions: [...conditions, createEmptyCondition()],
            })
          }
        >
          Add scenario condition
        </Button>
        {!conditions.length && <Typography.Text type="danger">Condition is required.</Typography.Text>}
        {!!errors.length && (
          <Alert
            type="error"
            showIcon
            message="Scenario has invalid conditions"
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
  const { token } = theme.useToken()
  const group = getConditionGroupFormValue(value)
  const scenarios = useMemo(
    () => (group.groups?.length ? group.groups : [createEmptyScenario()]),
    [group.groups]
  )
  const scenarioDiagnostics = scenarios.map((scenario) => getScenarioErrors(scenario))
  const hasErrors = scenarioDiagnostics.some((errors) => errors.length)
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
      {scenarios.map((scenario, index) => (
        <Flex key={scenario.id ?? `scenario-${index}`} vertical gap={12}>
          {index > 0 && (
            <Flex align="center" gap={12} role="separator">
              <div style={{ flex: 1, borderTop: `1px solid ${token.colorBorderSecondary}` }} />
              <Tag color="blue" style={{ margin: 0, fontWeight: token.fontWeightStrong }}>
                OR
              </Tag>
              <div style={{ flex: 1, borderTop: `1px solid ${token.colorBorderSecondary}` }} />
            </Flex>
          )}
          <GroupEditor
            group={scenario}
            groupNumber={index + 1}
            token={token}
            canDelete={scenarios.length > 1}
            errors={scenarioDiagnostics[index] || []}
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
        Add scenario
      </Button>
      {!hasErrors && (
        <div
          style={{
            padding: 16,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
          }}
        >
          <Typography.Text strong>Readable preview</Typography.Text>
          <Tree
            showIcon
            showLine
            selectable={false}
            defaultExpandAll
            treeData={scenarios.map((scenario, index) => buildScenarioTreeNode(scenario, index))}
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
        <Typography.Text type="danger">Fix eligibility conditions before submitting.</Typography.Text>
      )}
    </Flex>
  )
}

export default FasConditionEditor
