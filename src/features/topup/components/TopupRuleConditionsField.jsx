import { EnumConfig } from '@/shared/config/enumConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import {
  ApartmentOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons'
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
import {
  TOPUP_ELIGIBLE_AGE_MAX,
  TOPUP_ELIGIBLE_AGE_MIN,
  createEmptyTopupCondition,
  createEmptyTopupConditionGroup,
  createEmptyTopupScenarioRoot,
  getTopupConditionGroupWarnings,
  getTopupConditionValidationErrors,
  isTopupConditionGroupValid,
} from '../utils/topupRuleFormUtil'

const getFieldOptions = (t) => [
  { value: EnumConfig.TopupConditionField.Age, label: t('topup_form.age') },
  { value: EnumConfig.TopupConditionField.Balance, label: t('topup_form.balance') },
  {
    value: EnumConfig.TopupConditionField.SchoolingStatus,
    label: t('topup_form.schooling_status'),
  },
]

const getOperatorOptions = (t, isText = false) => {
  const options = [
    { value: EnumConfig.TopupConditionOperator.Equals, label: `= (${t('topup_form.is')})` },
    { value: EnumConfig.TopupConditionOperator.NotEquals, label: `≠ (${t('topup_form.is_not')})` },
    {
      value: EnumConfig.TopupConditionOperator.GreaterThan,
      label: `> (${t('topup_form.greater_than')})`,
    },
    {
      value: EnumConfig.TopupConditionOperator.GreaterThanOrEqual,
      label: `≥ (${t('topup_form.at_least')})`,
    },
    {
      value: EnumConfig.TopupConditionOperator.LessThan,
      label: `< (${t('topup_form.less_than')})`,
    },
    {
      value: EnumConfig.TopupConditionOperator.LessThanOrEqual,
      label: `≤ (${t('topup_form.at_most')})`,
    },
    { value: EnumConfig.TopupConditionOperator.Between, label: `↔ (${t('topup_form.between')})` },
  ]
  return isText ? options.slice(0, 2) : options
}

const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || '—'

const getConditionValueText = (condition, t) => {
  if (condition.field === EnumConfig.TopupConditionField.SchoolingStatus) {
    return condition.valueText === 'Enrolled'
      ? t('topup_form.enrolled')
      : condition.valueText === 'Not Enrolled'
        ? t('topup_form.not_enrolled')
        : t('topup_form.value_missing')
  }
  if (condition.valueNumber == null) return t('topup_form.value_missing')
  const suffix =
    condition.field === EnumConfig.TopupConditionField.Age ? ` ${t('topup_form.years')}` : ''
  const formatValue = (value) =>
    condition.field === EnumConfig.TopupConditionField.Balance
      ? formatCurrencyBasedOnCurrentLanguage(value)
      : `${Number(value).toLocaleString()}${suffix}`
  const first = formatValue(condition.valueNumber)
  if (condition.operator !== EnumConfig.TopupConditionOperator.Between) return first
  const upperValue =
    condition.valueNumberTo == null
      ? t('topup_form.value_missing')
      : formatValue(condition.valueNumberTo)
  return `${first} ${t('topup_form.and')} ${upperValue}`
}

const getConditionText = (condition, t) => {
  const field = getOptionLabel(getFieldOptions(t), condition.field)
  const operator = getOptionLabel(
    getOperatorOptions(t, condition.field === EnumConfig.TopupConditionField.SchoolingStatus),
    condition.operator
  )
  return `${field} ${operator} ${getConditionValueText(condition, t)}`
}

const combineCaseParts = (leftCases, rightCases) => {
  if (!leftCases.length) return rightCases
  if (!rightCases.length) return leftCases
  return leftCases.flatMap((left) => rightCases.map((right) => [...left, ...right]))
}

const buildEligibilityCases = (group, t) => {
  const conditionCases = (group.conditions || []).map((condition) => [
    [getConditionText(condition, t)],
  ])
  const childCases = (group.groups || []).map((child) => buildEligibilityCases(child, t))
  const items = [...conditionCases, ...childCases].filter((item) => item.length)

  if (!items.length) return []

  if (group.logicalOperator === EnumConfig.TopupLogicalOperator.Or) {
    return items.flat()
  }

  return items.reduce((cases, item) => combineCaseParts(cases, item), [[]])
}

const getEligibilityCaseText = (caseParts, t) => {
  if (!caseParts.length) return '—'
  return caseParts.join(` ${t('topup_form.and')} `)
}

const getConditionValidationErrorMessage = (error, t) => {
  if (error === 'age_range') {
    return t('topup_form.age_range_error', {
      min: TOPUP_ELIGIBLE_AGE_MIN,
      max: TOPUP_ELIGIBLE_AGE_MAX,
    })
  }
  if (error === 'whole_age') return t('topup_form.age_whole_number_error')
  if (error === 'invalid_range') return t('topup_form.invalid_range')
  return t('topup_form.enter_value')
}

export const TopupConditionSentence = ({ condition }) => {
  const { t } = useTranslation()
  return (
    <Typography.Text>
      <Typography.Text strong>
        {getOptionLabel(getFieldOptions(t), condition.field)}
      </Typography.Text>{' '}
      {getOptionLabel(
        getOperatorOptions(t, condition.field === EnumConfig.TopupConditionField.SchoolingStatus),
        condition.operator
      )}{' '}
      <Typography.Text strong>{getConditionValueText(condition, t)}</Typography.Text>
    </Typography.Text>
  )
}

const buildScenarioTreeNode = (scenario, t, index) => ({
  key: `scenario-${index}`,
  icon: <ApartmentOutlined />,
  title: (
    <Space size={8} wrap>
      <Typography.Text strong>
        {t('topup_form.scenario_number', { number: index + 1 })}
      </Typography.Text>
      <Tag color="blue">{t('topup_form.logical_and')}</Tag>
      <Typography.Text type="secondary">{t('topup_form.preview_all_scenario')}</Typography.Text>
    </Space>
  ),
  children: (scenario.conditions || []).map((condition, conditionIndex) => ({
    key: `scenario-${index}-condition-${condition.id ?? conditionIndex}`,
    title: <TopupConditionSentence condition={condition} />,
  })),
})

export const TopupConditionTree = ({ value }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  if (!value) return null
  const scenarios = value.groups?.length ? value.groups : [value]
  const eligibilityCases = scenarios.map((scenario) => buildEligibilityCases(scenario, t)[0] || [])

  return (
    <Flex vertical gap={12}>
      <div
        style={{
          padding: 14,
          borderRadius: token.borderRadiusLG,
          background: token.colorInfoBg,
          border: `1px solid ${token.colorInfoBorder}`,
        }}
      >
        <Typography.Text type="secondary">{t('topup_form.summary_label')}</Typography.Text>
        <Typography.Paragraph strong style={{ margin: '4px 0 0' }}>
          {t('topup_form.eligible_if')}
        </Typography.Paragraph>
        <Flex vertical gap={4}>
          {eligibilityCases.length ? (
            eligibilityCases.map((caseParts, index) => (
              <Typography.Text key={`eligibility-case-${index}`}>
                {t('topup_form.scenario_summary', {
                  number: index + 1,
                  conditions: getEligibilityCaseText(caseParts, t),
                })}
              </Typography.Text>
            ))
          ) : (
            <Typography.Text>—</Typography.Text>
          )}
        </Flex>
      </div>
      <Tree
        showIcon
        showLine
        selectable={false}
        defaultExpandAll
        treeData={scenarios.map((scenario, index) => buildScenarioTreeNode(scenario, t, index))}
        style={{
          padding: 12,
          borderRadius: token.borderRadiusLG,
          background: token.colorFillAlter,
        }}
      />
    </Flex>
  )
}

const SectionShell = ({ title, subtitle, accentColor, onDelete, children, t, token }) => (
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
        <Tooltip title={t('topup_form.delete_group')}>
          <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete} />
        </Tooltip>
      ) : null}
    </Flex>
    <div style={{ padding: 16 }}>{children}</div>
  </div>
)

const ConditionRow = ({ condition, index, onChange, onDelete, t, token, showValidationErrors }) => {
  const isText = condition.field === EnumConfig.TopupConditionField.SchoolingStatus
  const isBetween = !isText && condition.operator === EnumConfig.TopupConditionOperator.Between
  const validationErrors = getTopupConditionValidationErrors(condition)
  const valueError = showValidationErrors
    ? validationErrors.valueText || validationErrors.valueNumber
    : null
  const upperValueError = showValidationErrors ? validationErrors.valueNumberTo : null
  const operatorError = showValidationErrors ? validationErrors.operator : null
  const isAge = condition.field === EnumConfig.TopupConditionField.Age

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
        <Typography.Text type="secondary">{t('topup_form.rule')}</Typography.Text>
      </Flex>
      <Tooltip title={t('topup_form.delete_condition')}>
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={onDelete}
          style={{ position: 'absolute', top: 10, right: 8 }}
        />
      </Tooltip>
      <Row gutter={[8, 8]} align="top">
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Select
            aria-label={t('topup_form.field')}
            placeholder="Select field"
            value={condition.field}
            options={getFieldOptions(t)}
            style={{ width: '100%', height: 32 }}
            onChange={(field) =>
              onChange({
                ...condition,
                field,
                operator: EnumConfig.TopupConditionOperator.Equals,
                valueText: null,
                valueNumber: null,
                valueNumberTo: null,
              })
            }
          />
        </Col>
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Select
            aria-label={t('topup_form.operator')}
            placeholder="Select operator"
            value={condition.operator}
            options={getOperatorOptions(t, isText)}
            status={operatorError ? 'error' : undefined}
            style={{ width: '100%', height: 32 }}
            onChange={(operator) =>
              onChange({
                ...condition,
                operator,
                valueNumberTo:
                  operator === EnumConfig.TopupConditionOperator.Between
                    ? condition.valueNumberTo
                    : null,
              })
            }
          />
        </Col>
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Flex vertical gap={4}>
            {isText ? (
              <Select
                aria-label={t('topup_form.value')}
                status={valueError ? 'error' : undefined}
                value={condition.valueText}
                placeholder="Select value"
                options={[
                  { value: 'Enrolled', label: t('topup_form.enrolled') },
                  { value: 'Not Enrolled', label: t('topup_form.not_enrolled') },
                ]}
                style={{ width: '100%', height: 32 }}
                onChange={(valueText) => onChange({ ...condition, valueText })}
              />
            ) : (
              <InputNumber
                aria-label={t('topup_form.value')}
                status={valueError ? 'error' : undefined}
                value={condition.valueNumber}
                placeholder={
                  isBetween
                    ? isAge
                      ? `e.g. ${TOPUP_ELIGIBLE_AGE_MIN}`
                      : 'e.g. 100.00'
                    : isAge
                      ? `e.g. ${TOPUP_ELIGIBLE_AGE_MIN}`
                      : 'e.g. 100.00'
                }
                min={isAge ? TOPUP_ELIGIBLE_AGE_MIN : 0}
                max={isAge ? TOPUP_ELIGIBLE_AGE_MAX : undefined}
                precision={isAge ? 0 : 2}
                prefix={condition.field === EnumConfig.TopupConditionField.Balance ? '$' : undefined}
                suffix={
                  condition.field === EnumConfig.TopupConditionField.Age
                    ? t('topup_form.years')
                    : undefined
                }
                style={{ width: '100%', height: 32 }}
                onChange={(valueNumber) => onChange({ ...condition, valueNumber })}
              />
            )}
            {valueError && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {getConditionValidationErrorMessage(valueError, t)}
              </Typography.Text>
            )}
          </Flex>
        </Col>
        {isBetween && (
          <Col xs={24} md={12} xl={6}>
            <Flex vertical gap={4}>
              <InputNumber
                aria-label={t('topup_form.to_value')}
                status={upperValueError ? 'error' : undefined}
                value={condition.valueNumberTo}
                placeholder={isAge ? `e.g. ${TOPUP_ELIGIBLE_AGE_MAX}` : 'e.g. 500.00'}
                min={isAge ? TOPUP_ELIGIBLE_AGE_MIN : 0}
                max={isAge ? TOPUP_ELIGIBLE_AGE_MAX : undefined}
                precision={isAge ? 0 : 2}
                prefix={condition.field === EnumConfig.TopupConditionField.Balance ? '$' : undefined}
                suffix={
                  condition.field === EnumConfig.TopupConditionField.Age
                    ? t('topup_form.years')
                    : undefined
                }
                style={{ width: '100%', height: 32 }}
                onChange={(valueNumberTo) => onChange({ ...condition, valueNumberTo })}
              />
              {upperValueError && (
                <Typography.Text type="danger" style={{ fontSize: 12 }}>
                  {getConditionValidationErrorMessage(upperValueError, t)}
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
  t,
  token,
  showValidationErrors = false,
  canDelete = true,
}) => {
  const conditions = group.conditions || []
  const updateCondition = (index, nextCondition) =>
    onChange({
      ...group,
      logicalOperator: EnumConfig.TopupLogicalOperator.And,
      groups: [],
      conditions: conditions.map((condition, itemIndex) =>
        itemIndex === index ? nextCondition : condition
      ),
    })

  return (
    <SectionShell
      title={t('topup_form.scenario_number', { number: groupNumber })}
      subtitle={t('topup_form.scenario_hint')}
      accentColor={token.colorInfo}
      onDelete={canDelete ? onDelete : null}
      t={t}
      token={token}
    >
      <Flex vertical gap={12}>
        <Tag color="blue" style={{ width: 'fit-content' }}>
          {t('topup_form.must_match_all_in_scenario')}
        </Tag>

        {conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id ?? `condition-${index}`}
            condition={condition}
            index={index}
            t={t}
            token={token}
            showValidationErrors={showValidationErrors}
            onChange={(nextCondition) => updateCondition(index, nextCondition)}
            onDelete={() =>
              onChange({
                ...group,
                logicalOperator: EnumConfig.TopupLogicalOperator.And,
                groups: [],
                conditions: conditions.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}

        <Space wrap>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() =>
              onChange({
                ...group,
                logicalOperator: EnumConfig.TopupLogicalOperator.And,
                groups: [],
                conditions: [...conditions, createEmptyTopupCondition()],
              })
            }
          >
            {t('topup_form.add_scenario_condition')}
          </Button>
        </Space>
        {!conditions.length && (
          <Typography.Text type="danger">{t('topup_form.condition_required')}</Typography.Text>
        )}
      </Flex>
    </SectionShell>
  )
}

const TopupRuleConditionsField = ({ value, onChange, showValidationErrors = false }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const group = value || createEmptyTopupScenarioRoot()
  const scenarios = group.groups?.length ? group.groups : [createEmptyTopupConditionGroup()]
  const warnings = getTopupConditionGroupWarnings(group, t)
  const emitScenarioRoot = (groups) =>
    onChange({
      ...group,
      logicalOperator: EnumConfig.TopupLogicalOperator.Or,
      conditions: [],
      groups,
    })
  const updateScenario = (index, nextScenario) =>
    emitScenarioRoot(
      scenarios.map((scenario, itemIndex) =>
        itemIndex === index
          ? { ...nextScenario, logicalOperator: EnumConfig.TopupLogicalOperator.And, groups: [] }
          : scenario
      )
    )

  return (
    <Flex vertical gap={12}>
      <Alert type="info" showIcon message={t('topup_form.scenario_only_help')} />
      {scenarios.map((scenario, index) => (
        <GroupEditor
          key={scenario.id ?? `scenario-${index}`}
          group={scenario}
          groupNumber={index + 1}
          t={t}
          token={token}
          canDelete={scenarios.length > 1}
          showValidationErrors={showValidationErrors}
          onChange={(nextScenario) => updateScenario(index, nextScenario)}
          onDelete={() => emitScenarioRoot(scenarios.filter((_, itemIndex) => itemIndex !== index))}
        />
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => emitScenarioRoot([...scenarios, createEmptyTopupConditionGroup()])}
      >
        {t('topup_form.add_scenario')}
      </Button>
      {!!warnings.length && (
        <Alert
          type="warning"
          showIcon
          message={t('topup_form.condition_warnings')}
          description={
            <Flex vertical gap={2}>
              {warnings.map((warning) => (
                <Typography.Text key={warning}>{warning}</Typography.Text>
              ))}
            </Flex>
          }
        />
      )}
      {isTopupConditionGroupValid(group) && (
        <div
          style={{
            padding: 16,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
          }}
        >
          <Typography.Text strong>{t('topup_form.readable_preview')}</Typography.Text>
          <div style={{ marginTop: 12 }}>
            <TopupConditionTree value={group} />
          </div>
        </div>
      )}
    </Flex>
  )
}

export default TopupRuleConditionsField
