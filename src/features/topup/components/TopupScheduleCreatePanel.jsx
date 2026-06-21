import { ApiUrls } from '@/shared/api/apiUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, DatePicker, Flex, Form, InputNumber, Select, TimePicker } from 'antd'
import dayjs from 'dayjs'

const TopupScheduleCreatePanel = ({ refreshKey, onCreated }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const frequency = Form.useWatch('frequency', form) ?? 1
  const rules = useFetch(ApiUrls.TOPUP_RULE.INDEX, { type: 2, status: 1, page: 1, pageSize: 100 }, [refreshKey])
  const createSchedule = useAxiosSubmit({ url: ApiUrls.TOPUP_SCHEDULE.INDEX, method: 'POST' })
  const submit = async () => {
    const values = await form.validateFields()
    const response = await createSchedule.submit({ overrideData: {
      topupRuleId: values.topupRuleId,
      frequency: values.frequency,
      oneTimeExecutionAt: values.frequency === 1 ? values.oneTimeExecutionAt.toISOString() : null,
      executeAtDay: [2, 3].includes(values.frequency) ? values.executeAtDay : null,
      executeAtMonth: values.frequency === 3 ? values.executeAtMonth : null,
      executionTime: values.executionTime.format('HH:mm:ss'),
    } })
    if (response) {
      form.resetFields()
      onCreated?.(response.data)
    }
  }
  const ruleOptions = (rules.data?.collection || []).map((rule) => ({ value: rule.id, label: rule.ruleName }))

  return <Form form={form} layout="vertical" initialValues={{ frequency: 1, executionTime: dayjs('00:00:00', 'HH:mm:ss') }}>
    <Form.Item name="topupRuleId" label={t('topup_form.topup_rules')} rules={[{ required: true }]}>
      <Select showSearch optionFilterProp="label" loading={rules.loading} options={ruleOptions} />
    </Form.Item>
    <Form.Item name="frequency" label={t('topup_form.schedule_type')} rules={[{ required: true }]}>
      <Select options={[{ value: 1, label: t('topup_form.one_time') }, { value: 2, label: t('topup_form.monthly') }, { value: 3, label: t('topup_form.yearly') }]} />
    </Form.Item>
    {frequency === 1 && <Form.Item name="oneTimeExecutionAt" label={t('topup_form.execution_date')} rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item>}
    {[2, 3].includes(frequency) && <Form.Item name="executeAtDay" label={t('topup_form.day_of_month')} rules={[{ required: true }]}><InputNumber min={1} max={31} style={{ width: '100%' }} /></Form.Item>}
    {frequency === 3 && <Form.Item name="executeAtMonth" label={t('topup_form.month')} rules={[{ required: true }]}><InputNumber min={1} max={12} style={{ width: '100%' }} /></Form.Item>}
    <Form.Item name="executionTime" label={t('topup_form.execution_time')} rules={[{ required: true }]}><TimePicker format="HH:mm:ss" style={{ width: '100%' }} /></Form.Item>
    <Flex justify="end"><Button type="primary" loading={createSchedule.loading} onClick={submit}>{t('button.create')}</Button></Flex>
  </Form>
}

export default TopupScheduleCreatePanel
