import useTranslation from '@/shared/hooks/useTranslation'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, InputNumber, Row, Select, Space, Typography } from 'antd'
import {
  createEmptyTopupCondition,
  createEmptyTopupConditionGroup,
} from '../utils/topupRuleFormUtil'

const GroupEditor = ({ group, onChange, onDelete, depth, t }) => {
  const fieldOptions = [
    { value: 1, label: t('topup_form.age') },
    { value: 2, label: t('topup_form.balance') },
    { value: 3, label: t('topup_form.schooling_status') },
  ]
  const operatorOptions = [
    { value: 1, label: t('topup_form.equals') },
    { value: 2, label: t('topup_form.not_equals') },
    { value: 3, label: t('topup_form.greater_than') },
    { value: 4, label: t('topup_form.greater_than_or_equal') },
    { value: 5, label: t('topup_form.less_than') },
    { value: 6, label: t('topup_form.less_than_or_equal') },
    { value: 7, label: t('topup_form.between') },
  ]
  const updateCondition = (index, changes) => {
    onChange({
      ...group,
      conditions: group.conditions.map((condition, itemIndex) =>
        itemIndex === index ? { ...condition, ...changes } : condition
      ),
    })
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <Typography.Text>{t('topup_form.condition_group')}</Typography.Text>
          <Select
            size="small"
            value={group.logicalOperator}
            options={[
              { value: 1, label: 'AND' },
              { value: 2, label: 'OR' },
            ]}
            onChange={(logicalOperator) => onChange({ ...group, logicalOperator })}
          />
        </Space>
      }
      extra={
        onDelete ? (
          <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete} />
        ) : null
      }
    >
      <Space orientation="vertical" size={8} style={{ width: '100%' }}>
        {group.conditions.map((condition, index) => {
          const isText = condition.field === 3
          const isBetween = !isText && condition.operator === 7
          return (
            <Row key={condition.id ?? index} gutter={[8, 8]} align="middle">
              <Col xs={24} md={5}>
                <Select
                  value={condition.field}
                  options={fieldOptions}
                  style={{ width: '100%' }}
                  onChange={(field) =>
                    updateCondition(index, {
                      field,
                      operator: 1,
                      valueText: null,
                      valueNumber: null,
                      valueNumberTo: null,
                    })
                  }
                />
              </Col>
              <Col xs={24} md={5}>
                <Select
                  value={condition.operator}
                  options={isText ? operatorOptions.slice(0, 2) : operatorOptions}
                  style={{ width: '100%' }}
                  onChange={(operator) =>
                    updateCondition(index, {
                      operator,
                      valueNumberTo: operator === 7 ? condition.valueNumberTo : null,
                    })
                  }
                />
              </Col>
              <Col xs={20} md={isBetween ? 5 : 12}>
                {isText ? (
                  <Select
                    value={condition.valueText}
                    placeholder={t('topup_form.value')}
                    options={[
                      { value: 'Enrolled', label: t('topup_form.enrolled') },
                      { value: 'Not Enrolled', label: t('topup_form.not_enrolled') },
                    ]}
                    style={{ width: '100%' }}
                    onChange={(valueText) => updateCondition(index, { valueText })}
                  />
                ) : (
                  <InputNumber
                    value={condition.valueNumber}
                    placeholder={isBetween ? t('topup_form.from_value') : t('topup_form.value')}
                    min={0}
                    precision={condition.field === 1 ? 0 : 2}
                    style={{ width: '100%' }}
                    onChange={(valueNumber) => updateCondition(index, { valueNumber })}
                  />
                )}
              </Col>
              {isBetween && (
                <Col xs={20} md={7}>
                  <InputNumber
                    value={condition.valueNumberTo}
                    placeholder={t('topup_form.to_value')}
                    min={0}
                    precision={condition.field === 1 ? 0 : 2}
                    style={{ width: '100%' }}
                    onChange={(valueNumberTo) => updateCondition(index, { valueNumberTo })}
                  />
                </Col>
              )}
              <Col xs={4} md={2}>
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    onChange({
                      ...group,
                      conditions: group.conditions.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                />
              </Col>
            </Row>
          )
        })}

        {(group.groups || []).map((child, index) => (
          <GroupEditor
            key={child.id ?? index}
            group={child}
            depth={depth + 1}
            t={t}
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
            {t('topup_form.add_condition')}
          </Button>
          {depth < 5 && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                onChange({ ...group, groups: [...group.groups, createEmptyTopupConditionGroup()] })
              }
            >
              {t('topup_form.add_condition_group')}
            </Button>
          )}
        </Space>
        {!group.conditions.length && !group.groups.length && (
          <Typography.Text type="danger">{t('topup_form.condition_required')}</Typography.Text>
        )}
      </Space>
    </Card>
  )
}

const TopupRuleConditionsField = ({ value, onChange }) => {
  const { t } = useTranslation()
  return (
    <GroupEditor
      group={value || createEmptyTopupConditionGroup()}
      onChange={onChange}
      depth={1}
      t={t}
    />
  )
}

export default TopupRuleConditionsField
