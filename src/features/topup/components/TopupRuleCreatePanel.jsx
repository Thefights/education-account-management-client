import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, Form, Input, InputNumber, Select, Typography } from 'antd'
import { useState } from 'react'
import TopupRuleConditionsField from './TopupRuleConditionsField'

const newCondition = () => ({
  field: 1,
  operator: 1,
  valueText: null,
  valueNumber: null,
  conditionAmount: null,
  displayOrder: 0,
})

const TopupRuleCreatePanel = ({ ruleType, onCreated }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [conditions, setConditions] = useState([newCondition()])
  const createRule = useAxiosSubmit({ url: ApiUrls.TOPUP_RULE.INDEX, method: 'POST' })
  const matchMode = Form.useWatch('matchMode', form) ?? EnumConfig.TopupMatchModeId.And

  const submit = async () => {
    const values = await form.validateFields()
    const payload = {
      ruleName: values.ruleName.trim(),
      type: ruleType,
      matchMode: values.matchMode,
      topupAmount: values.matchMode === EnumConfig.TopupMatchModeId.Or ? null : values.topupAmount,
      conditions: conditions.map((condition, index) => ({
        field: condition.field,
        operator: condition.operator,
        displayOrder: index,
        valueText: condition.field === 3 ? condition.valueText : null,
        valueNumber: condition.field === 3 ? null : condition.valueNumber,
        conditionAmount: values.matchMode === EnumConfig.TopupMatchModeId.Or ? condition.conditionAmount : null,
      })),
    }
    const response = await createRule.submit({ overrideData: payload })
    if (response) {
      form.resetFields()
      setConditions([newCondition()])
      onCreated?.(response.data)
    }
  }

  const invalidConditions = !conditions.length || conditions.some((condition) =>
    condition.field === 3 ? !condition.valueText : condition.valueNumber == null
  ) || (matchMode === EnumConfig.TopupMatchModeId.Or
    && conditions.some((condition) => !(Number(condition.conditionAmount) > 0)))

  return <Form form={form} layout="vertical" initialValues={{ matchMode: 1 }}>
    <Form.Item name="ruleName" label={t('topup_form.rule_name')} rules={[{ required: true }]}>
      <Input maxLength={150} />
    </Form.Item>
    <Form.Item name="matchMode" label={t('topup_form.match_mode')} rules={[{ required: true }]}>
      <Select options={[{ value: 1, label: 'AND' }, { value: 2, label: 'OR' }]} />
    </Form.Item>
    {matchMode === EnumConfig.TopupMatchModeId.And ? (
      <Form.Item name="topupAmount" label={t('topup_form.topup_amount')} rules={[{ required: true }]}>
        <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
      </Form.Item>
    ) : <Typography.Paragraph type="secondary">{t('topup_form.or_amount_hint')}</Typography.Paragraph>}
    <TopupRuleConditionsField value={conditions} onChange={setConditions} matchMode={matchMode} />
    <Flex justify="end" style={{ marginTop: 16 }}>
      <Button type="primary" loading={createRule.loading} disabled={invalidConditions} onClick={submit}>{t('button.create')}</Button>
    </Flex>
  </Form>
}

export default TopupRuleCreatePanel
