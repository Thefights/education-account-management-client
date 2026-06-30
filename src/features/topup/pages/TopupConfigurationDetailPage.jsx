import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { localDateTimeToIso } from '@/shared/utils/dateTimeUtil'
import {
  formatCurrencyBasedOnCurrentLanguage,
  getCurrencySymbolBasedOnCurrentLanguage,
} from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { maxLen, numberHigherThan } from '@/shared/utils/validateUtil'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Result, Skeleton, Space, Tag, Typography } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopupRuleConditionsField, {
  TopupConditionTree,
} from '../components/TopupRuleConditionsField'
import {
  isTopupConditionGroupValid,
  normalizeTopupConditionGroup,
  serializeTopupConditionGroup,
} from '../utils/topupRuleFormUtil'
import { getScheduleExecutionAt } from '../utils/topupScheduleUtil'

const getScheduleExecutionText = (data, t) => {
  if (data.oneTimeExecutionAt) {
    return formatDatetimeStringBasedOnCurrentLanguage(data.oneTimeExecutionAt)
  }

  return [
    data.executeAtMonth != null ? `${t('topup_form.month')}: ${data.executeAtMonth}` : null,
    data.executeAtDay != null ? `${t('topup_form.day_of_month')}: ${data.executeAtDay}` : null,
    data.executionTime ? `${t('topup_form.execution_time')}: ${data.executionTime}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

const TopupConfigurationDetailPage = ({ type }) => {
  const { id } = useParams()
  const isSchedule = type === 'schedule'
  const { t } = useTranslation()
  const _enum = useEnum()
  const navigate = useNavigate()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const detailUrl = isSchedule ? ApiUrls.SCHEDULE_TOPUP.DETAIL(id) : ApiUrls.SYSTEM_TOPUP.DETAIL(id)
  const detail = useFetch(detailUrl, {}, [id])
  const updateTopup = useAxiosSubmit({
    url: detailUrl,
    method: 'PUT',
  })
  const data = detail.data
  const listUrl = routeUrls.BASE_ROUTE.FINANCE_ADMIN(
    `${routeUrls.TOPUP_MANAGEMENT.INDEX}?tab=${isSchedule ? 'schedules' : 'system'}`
  )
  const initialValues = useMemo(
    () =>
      data
        ? {
            name: data.name,
            topupAmount: data.topupAmount,
            status: data.status,
            rootConditionGroup: normalizeTopupConditionGroup(data.rootConditionGroup),
            ...(isSchedule
              ? {
                  frequency: data.frequency,
                  scheduleExecutionAt: getScheduleExecutionAt(data),
                }
              : {}),
          }
        : {},
    [data, isSchedule]
  )
  const fields = useMemo(
    () => [
      {
        key: 'name',
        label: t('topup_form.topup_name'),
      },
      {
        key: 'topupAmount',
        label: t('topup_form.topup_amount'),
        render: (value) =>
          value == null ? renderEmptyFallback(null) : formatCurrencyBasedOnCurrentLanguage(value),
      },
      {
        key: 'status',
        label: t('topup_form.status'),
        render: (value) =>
          value ? (
            <Tag color={defaultTopupStatusStyle(value)}>{value}</Tag>
          ) : (
            renderEmptyFallback(null)
          ),
      },
      ...(isSchedule
        ? [
            {
              key: 'frequency',
              label: t('topup_form.schedule_type'),
            },
            {
              key: 'scheduleExecutionAt',
              label: t('topup_form.execution_date'),
              render: (_, item) => getScheduleExecutionText(item, t) || renderEmptyFallback(null),
            },
          ]
        : []),
      {
        key: 'id',
        label: 'ID',
        render: (value) => (value == null ? renderEmptyFallback(null) : `#${value}`),
      },
      ...(isSchedule
        ? [
            {
              key: 'nextExecutionAt',
              label: t('topup.next_execution'),
              render: (value) =>
                formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
            },
          ]
        : []),
      {
        key: 'createdAt',
        label: t('audit_log.field.created_at'),
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [isSchedule, t]
  )
  const editableFields = useMemo(
    () => [
      {
        key: 'name',
        title: t('topup_form.topup_name'),
        placeholder: t('topup_form.name_placeholder'),
        validate: [maxLen(150, t('topup_form.name_max'))],
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
      {
        key: 'status',
        title: t('topup_form.status'),
        type: 'select',
        placeholder: 'Select status',
        options: isSchedule
          ? _enum.scheduleTopupStatusOptions
          : _enum.systemTopupStatusOptions,
      },
      ...(isSchedule
        ? [
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
        : []),
    ],
    [
      _enum.scheduleTopupFrequencyOptions,
      _enum.scheduleTopupStatusOptions,
      _enum.systemTopupStatusOptions,
      currencySymbol,
      isSchedule,
      t,
    ]
  )

  const handleSave = async ({ values }) => {
    const response = await updateTopup.submit({
      overrideData: {
        name: values.name.trim(),
        topupAmount: values.topupAmount,
        status: values.status,
        rootConditionGroup: serializeTopupConditionGroup(values.rootConditionGroup),
        ...(isSchedule
          ? {
              frequency: values.frequency,
              scheduleExecutionAt: localDateTimeToIso(values.scheduleExecutionAt),
            }
          : {}),
      },
    })
    if (!response) return false

    await detail.fetch()
    return true
  }

  if (detail.loading && !data) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    )
  }
  if (!data) {
    return (
      <Card>
        <Result
          status="404"
          title="404"
          subTitle={t('topup_form.not_found')}
          extra={<Button onClick={() => navigate(listUrl)}>{t('topup_form.back_to_list')}</Button>}
        />
      </Card>
    )
  }

  return (
    <GenericDetail
      title={data.name}
      data={data}
      fields={fields}
      onBack={() => navigate(listUrl)}
      edit={{
        initialValues,
        fields: editableFields,
        loading: updateTopup.loading,
        validate: ({ values }) => isTopupConditionGroupValid(values.rootConditionGroup),
        onSubmit: handleSave,
      }}
      renderAfter={({ editing, values, setField, submitted }) => {
        const conditionGroup = editing
          ? values.rootConditionGroup
          : normalizeTopupConditionGroup(data.rootConditionGroup)
        const conditionValid = isTopupConditionGroupValid(conditionGroup)

        return (
          <section
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--app-border-color)',
            }}
          >
            <Space style={{ marginBottom: 16 }}>
              <SafetyCertificateOutlined />
              <Typography.Text strong>{t('topup_form.who_receives')}</Typography.Text>
            </Space>
            {editing ? (
              <Flex vertical gap={8}>
                <TopupRuleConditionsField
                  value={conditionGroup}
                  showValidationErrors={submitted}
                  onChange={(nextConditionGroup) =>
                    setField('rootConditionGroup', nextConditionGroup)
                  }
                />
                {submitted && !conditionValid && (
                  <Typography.Text type="danger">
                    {t('topup_form.fix_conditions')}
                  </Typography.Text>
                )}
              </Flex>
            ) : (
              <TopupConditionTree value={conditionGroup} />
            )}
          </section>
        )
      }}
    />
  )
}

export default TopupConfigurationDetailPage
