import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, DatePicker, Drawer, Form, InputNumber, Select, Spin, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'

const frequencyValues = { OneTime: 1, Monthly: 2, Yearly: 3 }
const statusValues = { Active: 1, Inactive: 2, Completed: 3 }
const initialValues = {
  topupRuleId: null,
  frequency: 1,
  oneTimeExecutionAt: null,
  executeAtDay: null,
  executeAtMonth: null,
  executionTime: dayjs('00:00:00', 'HH:mm:ss'),
  status: 1,
}

const TopupScheduleFormDrawer = ({ open, scheduleId, loading, onClose, onSubmit }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const detail = useFetch(
    scheduleId ? ApiUrls.TOPUP_SCHEDULE.DETAIL(scheduleId) : '',
    {},
    [open, scheduleId],
    false
  )
  const rules = useFetch(
    ApiUrls.TOPUP_RULE.INDEX,
    { type: 2, status: 1, page: 1, pageSize: 100 },
    [open],
    false
  )
  const ruleOptions = (rules.data?.collection || []).map((rule) => ({
    value: rule.id,
    label: rule.ruleName,
  }))
  const frequency = Form.useWatch('frequency', form)

  useEffect(() => {
    if (!open) return
    if (!scheduleId) form.setFieldsValue(initialValues)
  }, [form, open, scheduleId])

  useEffect(() => {
    if (!open || !scheduleId || !detail.data) return
    form.setFieldsValue({
      ...detail.data,
      frequency: frequencyValues[detail.data.frequency] ?? detail.data.frequency,
      status: statusValues[detail.data.status] ?? detail.data.status,
      oneTimeExecutionAt: detail.data.oneTimeExecutionAt
        ? dayjs(detail.data.oneTimeExecutionAt)
        : null,
      executionTime: dayjs(`2000-01-01T${detail.data.executionTime || '00:00:00'}`),
    })
  }, [detail.data, form, open, scheduleId])

  const close = () => {
    form.resetFields()
    onClose()
  }

  const submit = async () => {
    const values = await form.validateFields()
    const payload = {
      topupRuleId: values.topupRuleId,
      frequency: values.frequency,
      oneTimeExecutionAt:
        values.frequency === 1 ? values.oneTimeExecutionAt?.toISOString() : null,
      executeAtDay: [2, 3].includes(values.frequency) ? values.executeAtDay : null,
      executeAtMonth: values.frequency === 3 ? values.executeAtMonth : null,
      executionTime: values.executionTime.format('HH:mm:ss'),
      ...(scheduleId ? { status: values.status } : {}),
    }
    if (await onSubmit(payload)) close()
  }

  return (
    <Drawer
      open={open}
      onClose={close}
      width={640}
      destroyOnHidden
      title={scheduleId ? t('topup_form.update_schedule') : t('topup_form.create_schedule')}
      extra={<Button type="primary" loading={loading} onClick={submit}>{scheduleId ? t('button.update') : t('button.create')}</Button>}
    >
      <Spin spinning={detail.loading}>
        <Form form={form} layout="vertical" initialValues={initialValues}>
          <Form.Item name="topupRuleId" label={t('topup_form.topup_rules')} rules={[{ required: true }]}>
            <Select loading={rules.loading} options={ruleOptions} optionFilterProp="label" showSearch />
          </Form.Item>
          <Form.Item name="frequency" label={t('topup_form.schedule_type')} rules={[{ required: true }]}>
            <Select options={[
              { value: 1, label: t('topup_form.one_time') },
              { value: 2, label: t('topup_form.monthly') },
              { value: 3, label: t('topup_form.yearly') },
            ]} />
          </Form.Item>
          {frequency === 1 && (
            <Form.Item name="oneTimeExecutionAt" label={t('topup_form.execution_date')} rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          )}
          {[2, 3].includes(frequency) && (
            <Form.Item name="executeAtDay" label={t('topup_form.day_of_month')} rules={[{ required: true }]}>
              <InputNumber min={1} max={28} style={{ width: '100%' }} />
            </Form.Item>
          )}
          {frequency === 3 && (
            <Form.Item name="executeAtMonth" label={t('topup_form.month')} rules={[{ required: true }]}>
              <InputNumber min={1} max={12} style={{ width: '100%' }} />
            </Form.Item>
          )}
          <Form.Item name="executionTime" label={t('topup_form.execution_time')} rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
          {scheduleId && (
            <Form.Item name="status" label={t('topup_form.status')} rules={[{ required: true }]}>
              <Select options={[
                { value: 1, label: t('topup_form.active') },
                { value: 2, label: t('topup_form.inactive') },
                { value: 3, label: 'Completed' },
              ]} />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Drawer>
  )
}

export default TopupScheduleFormDrawer
