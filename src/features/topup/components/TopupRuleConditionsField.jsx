import { EnumConfig } from '@/shared/config/enumConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import {
  ApartmentOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import {
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
  createEmptyTopupCondition,
  createEmptyTopupConditionGroup,
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
    { value: EnumConfig.TopupConditionOperator.NotEquals, label: `!= (${t('topup_form.is_not')})` },
    {
      value: EnumConfig.TopupConditionOperator.GreaterThan,
      label: `> (${t('topup_form.greater_than')})`,
    },
    {
      value: EnumConfig.TopupConditionOperator.GreaterThanOrEqual,
      label: `>= (${t('topup_form.at_least')})`,
    },
    {
      value: EnumConfig.TopupConditionOperator.LessThan,
      label: `< (${t('topup_form.less_than')})`,
    },
    {
      value: EnumConfig.TopupConditionOperator.LessThanOrEqual,
      label: `<= (${t('topup_form.at_most')})`,
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

const getLogicalOperatorOptions = (t, isRoot) => [
  {
    value: EnumConfig.TopupLogicalOperator.And,
    label: t(
      isRoot ? 'topup_form.must_match_all_requirements' : 'topup_form.must_match_all_in_scenario'
    ),
  },
  {
    value: EnumConfig.TopupLogicalOperator.Or,
    label: t(
      isRoot ? 'topup_form.can_match_any_requirement' : 'topup_form.can_match_any_in_scenario'
    ),
  },
]

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

const buildTreeNode = (group, t, key = 'root', isRoot = true) => ({
  key,
  icon: <ApartmentOutlined />,
  title: (
    <Space size={8} wrap>
      <Typography.Text strong>
        {t(
          isRoot
            ? group.logicalOperator === EnumConfig.TopupLogicalOperator.Or
              ? 'topup_form.preview_any_requirement'
              : 'topup_form.preview_all_requirement'
            : group.logicalOperator === EnumConfig.TopupLogicalOperator.Or
              ? 'topup_form.preview_any_scenario'
              : 'topup_form.preview_all_scenario'
        )}
      </Typography.Text>
      <Tag color={group.logicalOperator === EnumConfig.TopupLogicalOperator.Or ? 'purple' : 'blue'}>
        {t(
          group.logicalOperator === EnumConfig.TopupLogicalOperator.Or
            ? 'topup_form.logical_or'
            : 'topup_form.logical_and'
        )}
      </Tag>
    </Space>
  ),
  children: [
    ...(group.conditions || []).map((condition, index) => ({
      key: `${key}-condition-${condition.id ?? index}`,
      title: <TopupConditionSentence condition={condition} />,
    })),
    ...(group.groups || []).map((child, index) =>
      buildTreeNode(child, t, `${key}-group-${child.id ?? index}`, false)
    ),
  ],
})

export const TopupConditionTree = ({ value }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  if (!value) return null
  const eligibilityCases = buildEligibilityCases(value, t)

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
                {eligibilityCases.length > 1
                  ? `${index + 1}. ${getEligibilityCaseText(caseParts, t)}`
                  : getEligibilityCaseText(caseParts, t)}
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
        treeData={[buildTreeNode(value, t)]}
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
  const missingValue = isText ? !condition.valueText : condition.valueNumber == null
  const missingUpperValue = isBetween && condition.valueNumberTo == null
  const invalidRange =
    isBetween &&
    condition.valueNumberTo != null &&
    Number(condition.valueNumberTo) < Number(condition.valueNumber)
  const showMissingValue = showValidationErrors && missingValue
  const showUpperValueError = showValidationErrors && missingUpperValue

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
            value={condition.operator}
            options={getOperatorOptions(t, isText)}
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
                status={showMissingValue ? 'error' : undefined}
                value={condition.valueText}
                placeholder={t('topup_form.select_value')}
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
                status={showMissingValue ? 'error' : undefined}
                value={condition.valueNumber}
                placeholder={isBetween ? t('topup_form.from_value') : t('topup_form.value')}
                min={0}
                precision={condition.field === EnumConfig.TopupConditionField.Age ? 0 : 2}
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
            {showMissingValue && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {t('topup_form.enter_value')}
              </Typography.Text>
            )}
          </Flex>
        </Col>
        {isBetween && (
          <Col xs={24} md={12} xl={6}>
            <Flex vertical gap={4}>
              <InputNumber
                aria-label={t('topup_form.to_value')}
                status={showUpperValueError || invalidRange ? 'error' : undefined}
                value={condition.valueNumberTo}
                placeholder={t('topup_form.to_value')}
                min={0}
                precision={condition.field === EnumConfig.TopupConditionField.Age ? 0 : 2}
                prefix={condition.field === EnumConfig.TopupConditionField.Balance ? '$' : undefined}
                suffix={
                  condition.field === EnumConfig.TopupConditionField.Age
                    ? t('topup_form.years')
                    : undefined
                }
                style={{ width: '100%', height: 32 }}
                onChange={(valueNumberTo) => onChange({ ...condition, valueNumberTo })}
              />
              {(showUpperValueError || invalidRange) && (
                <Typography.Text type="danger" style={{ fontSize: 12 }}>
                  {invalidRange ? t('topup_form.invalid_range') : t('topup_form.enter_value')}
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
  depth,
  groupNumber,
  t,
  token,
  showValidationErrors = false,
}) => {
  const mode = group.logicalOperator === EnumConfig.TopupLogicalOperator.Or ? 'ANY' : 'ALL'
  const isRoot = depth === 1
  const conditions = group.conditions || []
  const groups = group.groups || []
  const updateCondition = (index, nextCondition) =>
    onChange({
      ...group,
      conditions: conditions.map((condition, itemIndex) =>
        itemIndex === index ? nextCondition : condition
      ),
    })

  return (
    <SectionShell
      title={
        isRoot
          ? t('topup_form.required_conditions')
          : t('topup_form.scenario_number', { number: groupNumber })
      }
      subtitle={isRoot ? t('topup_form.required_conditions_hint') : t('topup_form.scenario_hint')}
      accentColor={isRoot ? token.colorPrimary : token.colorInfo}
      onDelete={onDelete}
      t={t}
      token={token}
    >
      <Flex vertical gap={12}>
        <Flex align="center" gap={8} wrap="wrap">
          <Typography.Text>{t('topup_form.matching_mode')}</Typography.Text>
          <Select
            value={group.logicalOperator}
            style={{ minWidth: 260, height: 32 }}
            options={getLogicalOperatorOptions(t, isRoot)}
            onChange={(logicalOperator) => onChange({ ...group, logicalOperator })}
          />
          <Tooltip
            title={t(mode === 'ALL' ? 'topup_form.match_all_help' : 'topup_form.match_any_help')}
          >
            <QuestionCircleOutlined style={{ color: token.colorTextSecondary }} />
          </Tooltip>
        </Flex>

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
                conditions: conditions.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}

        {groups.map((child, index) => (
          <GroupEditor
            key={child.id ?? `group-${index}`}
            group={child}
            depth={depth + 1}
            groupNumber={index + 1}
            t={t}
            token={token}
            showValidationErrors={showValidationErrors}
            onChange={(nextChild) =>
              onChange({
                ...group,
                groups: groups.map((item, itemIndex) => (itemIndex === index ? nextChild : item)),
              })
            }
            onDelete={() =>
              onChange({
                ...group,
                groups: groups.filter((_, itemIndex) => itemIndex !== index),
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
                conditions: [...conditions, createEmptyTopupCondition()],
              })
            }
          >
            {isRoot
              ? t('topup_form.add_required_condition')
              : t('topup_form.add_scenario_condition')}
          </Button>
          {depth === 1 && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                onChange({ ...group, groups: [...groups, createEmptyTopupConditionGroup()] })
              }
            >
              {t('topup_form.add_scenario')}
            </Button>
          )}
        </Space>
        {!conditions.length && !groups.length && (
          <Typography.Text type="danger">{t('topup_form.condition_required')}</Typography.Text>
        )}
      </Flex>
    </SectionShell>
  )
}

const TopupRuleConditionsField = ({ value, onChange, showValidationErrors = false }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const group = value || createEmptyTopupConditionGroup()

  return (
    <Flex vertical gap={12}>
      <GroupEditor
        group={group}
        onChange={onChange}
        depth={1}
        groupNumber={1}
        t={t}
        token={token}
        showValidationErrors={showValidationErrors}
      />
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
