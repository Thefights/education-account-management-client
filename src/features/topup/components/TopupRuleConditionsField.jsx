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
  Card,
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
  { value: 1, label: t('topup_form.age') },
  { value: 2, label: t('topup_form.balance') },
  { value: 3, label: t('topup_form.schooling_status') },
]

const getOperatorOptions = (t, isText = false) => {
  const options = [
    { value: 1, label: t('topup_form.is') },
    { value: 2, label: t('topup_form.is_not') },
    { value: 3, label: t('topup_form.greater_than') },
    { value: 4, label: t('topup_form.at_least') },
    { value: 5, label: t('topup_form.less_than') },
    { value: 6, label: t('topup_form.at_most') },
    { value: 7, label: t('topup_form.between') },
  ]
  return isText ? options.slice(0, 2) : options
}

const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || '—'

const getConditionValueText = (condition, t) => {
  if (condition.field === 3) {
    return condition.valueText === 'Enrolled'
      ? t('topup_form.enrolled')
      : condition.valueText === 'Not Enrolled'
        ? t('topup_form.not_enrolled')
        : t('topup_form.value_missing')
  }
  if (condition.valueNumber == null) return t('topup_form.value_missing')
  const suffix = condition.field === 1 ? ` ${t('topup_form.years')}` : ''
  const formatValue = (value) =>
    condition.field === 2
      ? formatCurrencyBasedOnCurrentLanguage(value)
      : `${Number(value).toLocaleString()}${suffix}`
  const first = formatValue(condition.valueNumber)
  if (condition.operator !== 7) return first
  const upperValue =
    condition.valueNumberTo == null
      ? t('topup_form.value_missing')
      : formatValue(condition.valueNumberTo)
  return `${first} ${t('topup_form.and')} ${upperValue}`
}

const getConditionText = (condition, t) => {
  const field = getOptionLabel(getFieldOptions(t), condition.field)
  const operator = getOptionLabel(getOperatorOptions(t, condition.field === 3), condition.operator)
  return `${field} ${operator} ${getConditionValueText(condition, t)}`
}

const getGroupSummary = (group, t, nested = false) => {
  const parts = [
    ...(group.conditions || []).map((condition) => getConditionText(condition, t)),
    ...(group.groups || []).map((child) => getGroupSummary(child, t, true)),
  ]
  const separator = ` ${t(
    group.logicalOperator === 2 ? 'topup_form.logical_or' : 'topup_form.logical_and'
  )} `
  const summary = parts.join(separator)
  return nested && summary ? `(${summary})` : summary
}

export const TopupConditionSentence = ({ condition }) => {
  const { t } = useTranslation()
  return (
    <Typography.Text>
      <Typography.Text strong>
        {getOptionLabel(getFieldOptions(t), condition.field)}
      </Typography.Text>{' '}
      {getOptionLabel(getOperatorOptions(t, condition.field === 3), condition.operator)}{' '}
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
            ? group.logicalOperator === 2
              ? 'topup_form.preview_any_requirement'
              : 'topup_form.preview_all_requirement'
            : group.logicalOperator === 2
              ? 'topup_form.preview_any_scenario'
              : 'topup_form.preview_all_scenario'
        )}
      </Typography.Text>
      <Tag color={group.logicalOperator === 2 ? 'purple' : 'blue'}>
        {group.logicalOperator === 2 ? 'ANY' : 'ALL'}
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
          {getGroupSummary(value, t) || '—'}
        </Typography.Paragraph>
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

const ConditionRow = ({ condition, index, onChange, onDelete, t, token }) => {
  const isText = condition.field === 3
  const isBetween = !isText && condition.operator === 7
  const missingValue = isText ? !condition.valueText : condition.valueNumber == null
  const missingUpperValue = isBetween && condition.valueNumberTo == null
  const invalidRange =
    isBetween &&
    condition.valueNumberTo != null &&
    Number(condition.valueNumberTo) < Number(condition.valueNumber)

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
                operator: 1,
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
                valueNumberTo: operator === 7 ? condition.valueNumberTo : null,
              })
            }
          />
        </Col>
        <Col xs={24} md={12} xl={isBetween ? 6 : 8}>
          <Flex vertical gap={4}>
            {isText ? (
              <Select
                aria-label={t('topup_form.value')}
                status={missingValue ? 'error' : undefined}
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
                status={missingValue ? 'error' : undefined}
                value={condition.valueNumber}
                placeholder={isBetween ? t('topup_form.from_value') : t('topup_form.value')}
                min={0}
                precision={condition.field === 1 ? 0 : 2}
                prefix={condition.field === 2 ? '$' : undefined}
                suffix={condition.field === 1 ? t('topup_form.years') : undefined}
                style={{ width: '100%', height: 32 }}
                onChange={(valueNumber) => onChange({ ...condition, valueNumber })}
              />
            )}
            {missingValue && (
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
                status={missingUpperValue || invalidRange ? 'error' : undefined}
                value={condition.valueNumberTo}
                placeholder={t('topup_form.to_value')}
                min={0}
                precision={condition.field === 1 ? 0 : 2}
                prefix={condition.field === 2 ? '$' : undefined}
                suffix={condition.field === 1 ? t('topup_form.years') : undefined}
                style={{ width: '100%', height: 32 }}
                onChange={(valueNumberTo) => onChange({ ...condition, valueNumberTo })}
              />
              {(missingUpperValue || invalidRange) && (
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

const GroupEditor = ({ group, onChange, onDelete, depth, groupNumber, t, token }) => {
  const mode = group.logicalOperator === 2 ? 'ANY' : 'ALL'
  const isRoot = depth === 1
  const updateCondition = (index, nextCondition) =>
    onChange({
      ...group,
      conditions: group.conditions.map((condition, itemIndex) =>
        itemIndex === index ? nextCondition : condition
      ),
    })

  return (
    <Card
      size="small"
      styles={{ body: { padding: 16 } }}
      style={{
        borderLeft: `5px solid ${depth === 1 ? token.colorPrimary : token.colorInfo}`,
        background: depth === 1 ? token.colorFillAlter : token.colorBgContainer,
        boxShadow: depth === 1 ? undefined : 'none',
      }}
      title={
        <Flex vertical gap={2}>
          <Typography.Text strong>
            {isRoot
              ? t('topup_form.required_conditions')
              : t('topup_form.scenario_number', { number: groupNumber })}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {isRoot ? t('topup_form.required_conditions_hint') : t('topup_form.scenario_hint')}
          </Typography.Text>
        </Flex>
      }
      extra={
        onDelete ? (
          <Tooltip title={t('topup_form.delete_group')}>
            <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete} />
          </Tooltip>
        ) : null
      }
    >
      <Flex vertical gap={12}>
        <Flex align="center" gap={8} wrap="wrap">
          <Typography.Text>{t('topup_form.matching_mode')}</Typography.Text>
          <Select
            value={group.logicalOperator}
            style={{ minWidth: 260, height: 32 }}
            options={[
              {
                value: 1,
                label: isRoot
                  ? t('topup_form.must_match_all_requirements')
                  : t('topup_form.must_match_all_in_scenario'),
              },
              {
                value: 2,
                label: isRoot
                  ? t('topup_form.can_match_any_requirement')
                  : t('topup_form.can_match_any_in_scenario'),
              },
            ]}
            onChange={(logicalOperator) => onChange({ ...group, logicalOperator })}
          />
          <Tooltip
            title={t(mode === 'ALL' ? 'topup_form.match_all_help' : 'topup_form.match_any_help')}
          >
            <QuestionCircleOutlined style={{ color: token.colorTextSecondary }} />
          </Tooltip>
        </Flex>

        {(group.conditions || []).map((condition, index) => (
          <ConditionRow
            key={condition.id ?? `condition-${index}`}
            condition={condition}
            index={index}
            t={t}
            token={token}
            onChange={(nextCondition) => updateCondition(index, nextCondition)}
            onDelete={() =>
              onChange({
                ...group,
                conditions: group.conditions.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}

        {(group.groups || []).map((child, index) => (
          <GroupEditor
            key={child.id ?? `group-${index}`}
            group={child}
            depth={depth + 1}
            groupNumber={index + 1}
            t={t}
            token={token}
            onChange={(nextChild) =>
              onChange({
                ...group,
                groups: group.groups.map((item, itemIndex) =>
                  itemIndex === index ? nextChild : item
                ),
              })
            }
            onDelete={() =>
              onChange({
                ...group,
                groups: group.groups.filter((_, itemIndex) => itemIndex !== index),
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
                conditions: [...group.conditions, createEmptyTopupCondition()],
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
                onChange({ ...group, groups: [...group.groups, createEmptyTopupConditionGroup()] })
              }
            >
              {t('topup_form.add_scenario')}
            </Button>
          )}
        </Space>
        {!group.conditions.length && !group.groups.length && (
          <Typography.Text type="danger">{t('topup_form.condition_required')}</Typography.Text>
        )}
      </Flex>
    </Card>
  )
}

const TopupRuleConditionsField = ({ value, onChange }) => {
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
      />
      {isTopupConditionGroupValid(group) && (
        <Card size="small" title={t('topup_form.readable_preview')} style={{ boxShadow: 'none' }}>
          <TopupConditionTree value={group} />
        </Card>
      )}
    </Flex>
  )
}

export default TopupRuleConditionsField
