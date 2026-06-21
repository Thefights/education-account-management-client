import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, InputNumber, Row, Select, Space, Typography } from 'antd'
import useTranslation from '@/shared/hooks/useTranslation'

const emptyCondition = {
  field: 1,
  operator: 1,
  valueText: null,
  valueNumber: null,
  conditionAmount: null,
}

const TopupRuleConditionsField = ({ value = [], onChange, matchMode = 1 }) => {
  const { t } = useTranslation()
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
  ]
  const update = (index, changes) => {
    onChange(value.map((condition, itemIndex) =>
      itemIndex === index ? { ...condition, ...changes } : condition
    ))
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      <Typography.Text strong>{t('topup_form.conditions')}</Typography.Text>
      {value.map((condition, index) => {
        const isText = condition.field === 3
        return (
          <Card key={condition.id ?? index} size="small">
            <Row gutter={[8, 8]} align="middle">
              <Col xs={24} md={7}>
                <Select
                  value={condition.field}
                  options={fieldOptions}
                  style={{ width: '100%' }}
                  onChange={(field) => update(index, {
                    field,
                    operator: 1,
                    valueText: null,
                    valueNumber: null,
                  })}
                />
              </Col>
              <Col xs={24} md={7}>
                <Select
                  value={condition.operator}
                  options={isText ? operatorOptions.slice(0, 2) : operatorOptions}
                  style={{ width: '100%' }}
                  onChange={(operator) => update(index, { operator })}
                />
              </Col>
              <Col xs={20} md={8}>
                {isText ? (
                  <Select
                    value={condition.valueText}
                    placeholder={t('topup_form.value')}
                    options={[
                      { value: 'Enrolled', label: t('topup_form.enrolled') },
                      { value: 'Not Enrolled', label: t('topup_form.not_enrolled') },
                    ]}
                    style={{ width: '100%' }}
                    onChange={(valueText) => update(index, { valueText })}
                  />
                ) : (
                  <InputNumber
                    value={condition.valueNumber}
                    placeholder={t('topup_form.value')}
                    min={0}
                    precision={condition.field === 1 ? 0 : 2}
                    style={{ width: '100%' }}
                    onChange={(valueNumber) => update(index, { valueNumber })}
                  />
                )}
              </Col>
              {matchMode === 2 && (
                <Col xs={20} md={8}>
                  <InputNumber
                    value={condition.conditionAmount}
                    placeholder={t('topup_form.condition_amount', 'Top-up amount')}
                    min={0.01}
                    precision={2}
                    style={{ width: '100%' }}
                    onChange={(conditionAmount) => update(index, { conditionAmount })}
                  />
                </Col>
              )}
              <Col xs={4} md={2}>
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                />
              </Col>
            </Row>
          </Card>
        )
      })}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => onChange([...value, { ...emptyCondition, displayOrder: value.length }])}
      >
        {t('topup_form.add_condition')}
      </Button>
      {!value.length && <Typography.Text type="danger">{t('topup_form.condition_required')}</Typography.Text>}
    </Space>
  )
}

export default TopupRuleConditionsField
