import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { localDateTimeToIso } from '@/shared/utils/dateTimeUtil'
import { getCurrencySymbolBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { maxLen, numberHigherThan } from '@/shared/utils/validateUtil'
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Row, Skeleton, Tooltip, Typography, theme } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopupRuleConditionsField from '../components/TopupRuleConditionsField'
import {
  createEmptyTopupScenarioRoot,
  isTopupConditionGroupValid,
  normalizeTopupConditionGroup,
  serializeTopupConditionGroup,
} from '../utils/topupRuleFormUtil'
import { getScheduleExecutionAt } from '../utils/topupScheduleUtil'

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

const FormSection = ({ title, children }) => (
  <section
    style={{
      paddingBlock: 20,
      borderTop: '1px solid var(--app-border-color)',
    }}
  >
    <Typography.Text strong style={{ display: 'block', marginBottom: 16 }}>
      {title}
    </Typography.Text>
    {children}
  </section>
)

const TopupConfigurationFormPage = ({ type, mode }) => {
  const { id } = useParams()
  const isSchedule = type === 'schedule'
  const isEdit = mode === 'edit'
  const { t } = useTranslation()
  const _enum = useEnum()
  const navigate = useNavigate()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const { values, handleChange, setField, reset, registerRef, validateAll, resetValidation } =
    useForm()
  const [submitted, setSubmitted] = useState(false)
  const [conditionGroup, setConditionGroup] = useState(createEmptyTopupScenarioRoot())
  const [showConditionErrors, setShowConditionErrors] = useState(false)
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    submitted
  )
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

  const basicFields = useMemo(() => {
    const fields = [
      {
        key: 'name',
        title: t('topup_form.topup_name'),
        validate: [maxLen(150, t('topup_form.name_max'))],
        props: { placeholder: t('topup_form.name_placeholder') },
      },
      {
        key: 'topupAmount',
        title: t('topup_form.topup_amount'),
        type: 'input-number',
        minValue: 0.01,
        validate: [numberHigherThan(0)],
        placeholder: 'e.g. 100.00',
        props: { precision: 2, prefix: currencySymbol },
      },
    ]

    if (isEdit) {
      fields.push({
        key: 'status',
        title: t('topup_form.status'),
        type: 'select',
        placeholder: 'Select status',
        options: isSchedule ? _enum.scheduleTopupStatusOptions : _enum.systemTopupStatusOptions,
      })
    }

    return fields
  }, [
    _enum.scheduleTopupStatusOptions,
    _enum.systemTopupStatusOptions,
    currencySymbol,
    isEdit,
    isSchedule,
    t,
  ])

  const scheduleFields = useMemo(() => {
    if (!isSchedule) return []

    return [
      {
        key: 'frequency',
        title: t('topup_form.schedule_type'),
        type: 'select',
        placeholder: 'Select schedule type',
        options: _enum.scheduleTopupFrequencyOptions,
      },
      {
        key: 'scheduleExecutionAt',
        title: t('topup_form.execution_date'),
        type: 'datetime',
        placeholder: 'Select execution date and time',
      },
    ]
  }, [_enum.scheduleTopupFrequencyOptions, isSchedule, t])

  const inputFields = useMemo(
    () => [...basicFields, ...scheduleFields],
    [basicFields, scheduleFields]
  )

  useEffect(() => {
    if (!isEdit) {
      const rootConditionGroup = createEmptyTopupScenarioRoot()
      queueMicrotask(() => setConditionGroup(rootConditionGroup))
      reset({
        name: '',
        topupAmount: null,
        frequency: EnumConfig.ScheduleTopupFrequency.OneTime,
        scheduleExecutionAt: null,
      })
      resetValidation()
      queueMicrotask(() => setSubmitted(false))
      return
    }
    if (!detail.data) return
    const rootConditionGroup = normalizeTopupConditionGroup(detail.data.rootConditionGroup)
    queueMicrotask(() => setConditionGroup(rootConditionGroup))
    reset({
      ...detail.data,
      status: detail.data.status ?? EnumConfig.SystemTopupStatus.Active,
      frequency: detail.data.frequency ?? EnumConfig.ScheduleTopupFrequency.OneTime,
      scheduleExecutionAt: getScheduleExecutionAt(detail.data),
    })
    resetValidation()
    queueMicrotask(() => setSubmitted(false))
  }, [detail.data, isEdit, isSchedule, reset, resetValidation])

  const handleSubmit = async () => {
    setSubmitted(true)
    const inputsValid = validateAll()
    const missingInput = hasRequiredMissing(inputFields)
    const conditionsValid = isTopupConditionGroupValid(conditionGroup)

    if (!conditionsValid) {
      setShowConditionErrors(true)
    }
    if (!inputsValid || missingInput || !conditionsValid) {
      return
    }
    setShowConditionErrors(false)

    const payload = {
      name: values.name.trim(),
      topupAmount: values.topupAmount,
      rootConditionGroup: serializeTopupConditionGroup(conditionGroup),
      ...(isEdit ? { status: values.status } : {}),
    }
    if (isSchedule) {
      const scheduleExecutionAt = values.scheduleExecutionAt
      Object.assign(payload, {
        frequency: values.frequency,
        scheduleExecutionAt: localDateTimeToIso(scheduleExecutionAt),
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
    <div style={{ padding: '20px 28px 28px' }}>
      <Flex vertical gap={4}>
        <Flex align="center" gap={12} wrap="wrap">
          <Button
            aria-label={t('button.back')}
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(listUrl)}
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            <Flex align="center" gap={8}>
              <span>{pageTitle}</span>
              <Tooltip title={t('topup_form.form_subtitle')}>
                <QuestionCircleOutlined style={{ fontSize: 16 }} />
              </Tooltip>
            </Flex>
          </Typography.Title>
        </Flex>

        <FormSection title={t('topup_form.basic_information')}>
          <Row gutter={16}>
            {basicFields.map((field) => (
              <Col key={field.key} xs={24} md={isEdit ? 8 : 12}>
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </FormSection>

        {isSchedule && (
          <FormSection
            title={
              <TitleWithHelp
                title={t('topup.schedule_configuration')}
                help={t('topup_form.schedule_time_help')}
              />
            }
          >
            <Row gutter={16}>
              {scheduleFields.map((field) => (
                <Col key={field.key} xs={24} md={12}>
                  {renderField(field)}
                </Col>
              ))}
            </Row>
          </FormSection>
        )}

        <FormSection
          title={
            <TitleWithHelp
              title={t('topup_form.eligibility_conditions')}
              help={t('topup_form.eligibility_subtitle')}
            />
          }
        >
          <Flex vertical gap={8}>
            <TopupRuleConditionsField
              value={conditionGroup}
              showValidationErrors={showConditionErrors}
              onChange={(nextConditionGroup) => {
                setShowConditionErrors(false)
                setConditionGroup(nextConditionGroup)
              }}
            />
            {showConditionErrors && (
              <Typography.Text type="danger">{t('topup_form.fix_conditions')}</Typography.Text>
            )}
          </Flex>
        </FormSection>

        <Flex
          justify="flex-end"
          gap={8}
          style={{
            paddingTop: 20,
            borderTop: '1px solid var(--app-border-color)',
          }}
        >
          <Button type="primary" onClick={handleSubmit} loading={save.loading}>
            {t(isEdit ? 'button.update' : 'button.create')}
          </Button>
        </Flex>
      </Flex>
    </div>
  )
}

export default TopupConfigurationFormPage
