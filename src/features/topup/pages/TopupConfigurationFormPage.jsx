import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  localDateTimeToIso,
  toLocalPickerValue,
  toLocalTimePickerValue,
} from '@/shared/utils/dateTimeUtil'
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  TimePicker,
  Tooltip,
  Typography,
  theme,
} from 'antd'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopupRuleConditionsField from '../components/TopupRuleConditionsField'
import {
  createEmptyTopupConditionGroup,
  isTopupConditionGroupValid,
  normalizeTopupConditionGroup,
  serializeTopupConditionGroup,
} from '../utils/topupRuleFormUtil'

const frequencyValues = { OneTime: 1, Monthly: 2, Yearly: 3 }
const systemStatusValues = { Active: 1, Inactive: 2 }
const scheduleStatusValues = { Active: 1, Inactive: 2, Completed: 3 }

const TitleWithHelp = ({ title, help }) => {
  const { token } = theme.useToken()

  return (
    <Flex align="center" gap={8}>
      <span>{title}</span>
      <Tooltip title={help}>
        <QuestionCircleOutlined style={{ color: token.colorTextSecondary }} />
      </Tooltip>
    </Flex>
  )
}

const TopupConfigurationFormPage = ({ type, mode }) => {
  const { id } = useParams()
  const isSchedule = type === 'schedule'
  const isEdit = mode === 'edit'
  const { t } = useTranslation()
  const _enum = useEnum()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const detailUrl = isSchedule ? ApiUrls.SCHEDULE_TOPUP.DETAIL(id) : ApiUrls.SYSTEM_TOPUP.DETAIL(id)
  const indexUrl = isSchedule ? ApiUrls.SCHEDULE_TOPUP.INDEX : ApiUrls.SYSTEM_TOPUP.INDEX
  const detail = useFetch(isEdit ? detailUrl : '', {}, [id])
  const save = useAxiosSubmit({
    url: isEdit ? detailUrl : indexUrl,
    method: isEdit ? 'PUT' : 'POST',
  })

  const listUrl = routeUrls.BASE_ROUTE.FINANCE_ADMIN(
    `${routeUrls.TOPUP_MANAGEMENT.INDEX}?tab=${isSchedule ? 'schedules' : 'system'}`
  )
  const getDetailRoute = (ruleId) =>
    routeUrls.BASE_ROUTE.FINANCE_ADMIN(
      isSchedule
        ? routeUrls.TOPUP_MANAGEMENT.SCHEDULE_DETAIL(ruleId)
        : routeUrls.TOPUP_MANAGEMENT.SYSTEM_DETAIL(ruleId)
    )

  useEffect(() => {
    if (!isEdit) {
      form.setFieldsValue({
        name: '',
        topupAmount: null,
        frequency: EnumConfig.ScheduleTopupFrequencyId.OneTime,
        oneTimeExecutionAt: null,
        executeAtDay: null,
        executeAtMonth: null,
        executionTime: toLocalTimePickerValue(),
        rootConditionGroup: createEmptyTopupConditionGroup(),
      })
      return
    }
    if (!detail.data) return
    const statusValues = isSchedule ? scheduleStatusValues : systemStatusValues
    form.setFieldsValue({
      ...detail.data,
      status: statusValues[detail.data.status] ?? detail.data.status ?? 1,
      frequency: frequencyValues[detail.data.frequency] ?? detail.data.frequency ?? 1,
      executionTime: detail.data.executionTime
        ? toLocalTimePickerValue(detail.data.executionTime)
        : toLocalTimePickerValue(),
      oneTimeExecutionAt: detail.data.oneTimeExecutionAt
        ? toLocalPickerValue(detail.data.oneTimeExecutionAt)
        : null,
      rootConditionGroup: normalizeTopupConditionGroup(detail.data.rootConditionGroup),
    })
  }, [detail.data, form, isEdit, isSchedule])

  const frequency = Form.useWatch('frequency', form)

  const handleSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      topupAmount: values.topupAmount,
      rootConditionGroup: serializeTopupConditionGroup(values.rootConditionGroup),
      ...(isEdit ? { status: values.status } : {}),
    }
    if (isSchedule) {
      Object.assign(payload, {
        frequency: values.frequency,
        oneTimeExecutionAt:
          values.frequency === EnumConfig.ScheduleTopupFrequencyId.OneTime
            ? localDateTimeToIso(values.oneTimeExecutionAt)
            : null,
        executeAtDay: [
          EnumConfig.ScheduleTopupFrequencyId.Monthly,
          EnumConfig.ScheduleTopupFrequencyId.Yearly,
        ].includes(values.frequency)
          ? values.executeAtDay
          : null,
        executeAtMonth:
          values.frequency === EnumConfig.ScheduleTopupFrequencyId.Yearly
            ? values.executeAtMonth
            : null,
        executionTime: values.executionTime.format('HH:mm:ss'),
      })
    }
    const response = await save.submit({ overrideData: payload })
    if (response) navigate(getDetailRoute(response.data?.id || id))
  }

  const pageTitle = t(
    isSchedule
      ? isEdit
        ? 'topup_form.update_schedule'
        : 'topup_form.create_schedule'
      : isEdit
        ? 'topup_form.update_system_topup'
        : 'topup_form.create_system_topup'
  )

  if (isEdit && detail.loading && !detail.data) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} scrollToFirstError>
      <Flex vertical gap={16}>
        <Card>
          <Flex align="center" gap={12} wrap="wrap">
            <Flex align="center" gap={12}>
              <Button
                aria-label={t('button.back')}
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(listUrl)}
              />
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  <Flex align="center" gap={8}>
                    <span>{pageTitle}</span>
                    <Tooltip title={t('topup_form.form_subtitle')}>
                      <QuestionCircleOutlined style={{ fontSize: 16 }} />
                    </Tooltip>
                  </Flex>
                </Typography.Title>
              </div>
            </Flex>
          </Flex>
        </Card>

        <Row gutter={[16, 16]} align="top" style={{ marginInline: 0 }}>
          <Col xs={24}>
            <Flex vertical gap={16}>
              <Card title={t('topup_form.basic_information')}>
                <Row gutter={16}>
                  <Col xs={24} md={isEdit ? 8 : 12}>
                    <Form.Item
                      name="name"
                      label={t('topup_form.topup_name')}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: t('topup_form.name_required'),
                        },
                        { max: 150, message: t('topup_form.name_max') },
                      ]}
                    >
                      <Input
                        style={{ height: 32 }}
                        placeholder={t('topup_form.name_placeholder')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={isEdit ? 8 : 12}>
                    <Form.Item
                      name="topupAmount"
                      label={t('topup_form.topup_amount')}
                      rules={[{ required: true, message: t('topup_form.amount_required') }]}
                    >
                      <InputNumber
                        min={0.01}
                        precision={2}
                        prefix="$"
                        style={{ width: '100%', height: 32 }}
                      />
                    </Form.Item>
                  </Col>
                  {isEdit && (
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="status"
                        label={t('topup_form.status')}
                        rules={[{ required: true }]}
                      >
                        <Select
                          options={
                            isSchedule
                              ? _enum.scheduleTopupStatusIdOptions
                              : _enum.systemTopupStatusIdOptions
                          }
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Card>

              {isSchedule && (
                <Card
                  title={
                    <TitleWithHelp
                      title={t('topup.schedule_configuration')}
                      help={t('topup_form.schedule_time_help')}
                    />
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="frequency"
                        label={t('topup_form.schedule_type')}
                        rules={[{ required: true }]}
                      >
                        <Select options={_enum.scheduleTopupFrequencyIdOptions} />
                      </Form.Item>
                    </Col>
                    {frequency === EnumConfig.ScheduleTopupFrequencyId.OneTime && (
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="oneTimeExecutionAt"
                          label={t('topup_form.execution_date')}
                          rules={[
                            { required: true, message: t('topup_form.execution_date_required') },
                          ]}
                        >
                          <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    )}
                    {[
                      EnumConfig.ScheduleTopupFrequencyId.Monthly,
                      EnumConfig.ScheduleTopupFrequencyId.Yearly,
                    ].includes(frequency) && (
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="executeAtDay"
                          label={t('topup_form.day_of_month')}
                          rules={[{ required: true, message: t('topup_form.day_required') }]}
                        >
                          <InputNumber min={1} max={31} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    )}
                    {frequency === EnumConfig.ScheduleTopupFrequencyId.Yearly && (
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="executeAtMonth"
                          label={t('topup_form.month')}
                          rules={[{ required: true, message: t('topup_form.month_required') }]}
                        >
                          <InputNumber min={1} max={12} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="executionTime"
                        label={t('topup_form.execution_time')}
                        rules={[{ required: true }]}
                      >
                        <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )}

              <Card
                title={
                  <TitleWithHelp
                    title={t('topup_form.eligibility_conditions')}
                    help={t('topup_form.eligibility_subtitle')}
                  />
                }
              >
                <Form.Item
                  name="rootConditionGroup"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (_, value) =>
                        isTopupConditionGroupValid(value)
                          ? Promise.resolve()
                          : Promise.reject(new Error(t('topup_form.fix_conditions'))),
                    },
                  ]}
                >
                  <TopupRuleConditionsField />
                </Form.Item>
              </Card>
            </Flex>
          </Col>
        </Row>

        <Card size="small">
          <Flex justify="flex-end" gap={8}>
            <Button type="primary" htmlType="submit" loading={save.loading}>
              {t(isEdit ? 'button.update' : 'button.create')}
            </Button>
          </Flex>
        </Card>
      </Flex>
    </Form>
  )
}

export default TopupConfigurationFormPage
