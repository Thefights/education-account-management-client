import { ApiUrls } from '@/shared/api/apiUrls'
import GenericDetail from '@/shared/components/details/GenericDetail'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  formatCurrencyBasedOnCurrentLanguage,
  getCurrencySymbolBasedOnCurrentLanguage,
} from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { maxLen, numberHigherThan } from '@/shared/utils/validateUtil'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Result, Skeleton, Space, Tag, Typography } from 'antd'
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

const TopupConfigurationDetailPage = ({ type }) => {
  const { id } = useParams()
  const isSchedule = type === 'schedule'
  const { t } = useTranslation()
  const _enum = useEnum()
  const navigate = useNavigate()
  const currencySymbol = getCurrencySymbolBasedOnCurrentLanguage()
  const detailUrl = isSchedule ? ApiUrls.SCHEDULE_TOPUP.DETAIL(id) : ApiUrls.SYSTEM_TOPUP.DETAIL(id)
  const detail = useFetch(detailUrl, {}, [id])
  const updateSystemTopup = useAxiosSubmit({
    url: ApiUrls.SYSTEM_TOPUP.DETAIL(id),
    method: 'PUT',
  })
  const data = detail.data
  const listUrl = routeUrls.BASE_ROUTE.FINANCE_ADMIN(
    `${routeUrls.TOPUP_MANAGEMENT.INDEX}?tab=${isSchedule ? 'schedules' : 'system'}`
  )
  const systemInitialValues = useMemo(
    () =>
      !isSchedule && data
        ? {
            name: data.name,
            topupAmount: data.topupAmount,
            status: data.status,
            rootConditionGroup: normalizeTopupConditionGroup(data.rootConditionGroup),
          }
        : {},
    [data, isSchedule]
  )
  const systemFields = useMemo(
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
      {
        key: 'id',
        label: 'ID',
        render: (value) => (value == null ? renderEmptyFallback(null) : `#${value}`),
      },
      {
        key: 'createdAt',
        label: t('audit_log.field.created_at'),
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [t]
  )
  const systemEditableFields = useMemo(
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
        options: _enum.systemTopupStatusOptions,
      },
    ],
    [_enum.systemTopupStatusOptions, currencySymbol, t]
  )

  const handleSystemSave = async ({ values }) => {
    const response = await updateSystemTopup.submit({
      overrideData: {
        name: values.name.trim(),
        topupAmount: values.topupAmount,
        status: values.status,
        rootConditionGroup: serializeTopupConditionGroup(values.rootConditionGroup),
      },
    })
    if (!response) return false

    await detail.fetch()
    return true
  }

  if (detail.loading && !data)
    return (
      <Card>
        <Skeleton active />
      </Card>
    )
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

  if (!isSchedule) {
    return (
      <GenericDetail
        title={data.name}
        data={data}
        fields={systemFields}
        onBack={() => navigate(listUrl)}
        edit={{
          initialValues: systemInitialValues,
          fields: systemEditableFields,
          loading: updateSystemTopup.loading,
          validate: ({ values }) => isTopupConditionGroupValid(values.rootConditionGroup),
          onSubmit: handleSystemSave,
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

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex align="center" gap={12}>
          <Button
            aria-label={t('button.back')}
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(listUrl)}
          />
          <div>
            <Flex align="center" gap={8} wrap="wrap">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {data.name}
              </Typography.Title>
              <Tag color={defaultTopupStatusStyle(data.status)}>{data.status}</Tag>
            </Flex>
            <Typography.Text type="secondary">
              {t(isSchedule ? 'topup_form.schedule_detail' : 'topup_form.system_detail')} · #
              {data.id}
            </Typography.Text>
          </div>
        </Flex>
      </Card>

      <Card title={t('topup_form.overview')}>
        <Descriptions bordered column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="ID">#{data.id}</Descriptions.Item>
          <Descriptions.Item label={t('topup_form.topup_amount')}>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(data.topupAmount)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('topup_form.status')}>
            <Tag color={defaultTopupStatusStyle(data.status)}>{data.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {isSchedule && (
        <Card
          title={
            <Space>
              <CalendarOutlined />
              {t('topup.schedule_configuration')}
            </Space>
          }
        >
          <Descriptions bordered column={{ xs: 1, md: 2, lg: 3 }}>
            <Descriptions.Item label={t('topup_form.schedule_type')}>
              {data.frequency}
            </Descriptions.Item>
            {data.oneTimeExecutionAt && (
              <Descriptions.Item label={t('topup_form.execution_date')}>
                {formatDatetimeStringBasedOnCurrentLanguage(data.oneTimeExecutionAt)}
              </Descriptions.Item>
            )}
            {data.executeAtDay != null && (
              <Descriptions.Item label={t('topup_form.day_of_month')}>
                {data.executeAtDay}
              </Descriptions.Item>
            )}
            {data.executeAtMonth != null && (
              <Descriptions.Item label={t('topup_form.month')}>
                {data.executeAtMonth}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t('topup.next_execution')}>
              {formatDatetimeStringBasedOnCurrentLanguage(data.nextExecutionAt) || '—'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            {t('topup_form.who_receives')}
          </Space>
        }
      >
        <TopupConditionTree value={normalizeTopupConditionGroup(data.rootConditionGroup)} />
      </Card>
    </Flex>
  )
}

export default TopupConfigurationDetailPage
