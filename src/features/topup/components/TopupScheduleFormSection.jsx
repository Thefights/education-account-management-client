import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  singaporeWallTimeToIso,
  toSingaporePickerValue,
  toSingaporeTimePickerValue,
} from '@/shared/utils/dateTimeUtil'
import { DatePicker, InputNumber, Skeleton, TimePicker } from 'antd'
import { useCallback, useMemo, useState } from 'react'

const frequencyValues = { OneTime: 1, Monthly: 2, Yearly: 3 }
const statusValues = { Active: 1, Inactive: 2, Completed: 3 }

const TopupScheduleFormSection = ({
  open,
  scheduleId,
  onClose,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const [currentFrequency, setCurrentFrequency] = useState(EnumConfig.TopupScheduleTypeId.OneTime)
  const detail = useFetch(
    scheduleId ? ApiUrls.TOPUP_SCHEDULE.DETAIL(scheduleId) : '',
    {},
    [open, scheduleId],
    false
  )
  const rules = useFetch(
    ApiUrls.TOPUP_RULE.INDEX,
    {
      type: EnumConfig.TopupRuleTypeId.Schedule,
      status: EnumConfig.TopupScheduleStatusId.Active,
      page: 1,
      pageSize: 100,
    },
    [open],
    false
  )
  const initialValues = useMemo(() => {
    if (!scheduleId) {
      return {
        topupRuleId: null,
        frequency: EnumConfig.TopupScheduleTypeId.OneTime,
        oneTimeExecutionAt: null,
        executeAtDay: null,
        executeAtMonth: null,
        executionTime: toSingaporeTimePickerValue(),
      }
    }

    return {
      ...detail.data,
      frequency: frequencyValues[detail.data?.frequency] ?? detail.data?.frequency ?? 1,
      status: statusValues[detail.data?.status] ?? detail.data?.status ?? 1,
      executionTime: detail.data?.executionTime
        ? toSingaporeTimePickerValue(detail.data.executionTime)
        : toSingaporeTimePickerValue(),
      oneTimeExecutionAt: detail.data?.oneTimeExecutionAt
        ? toSingaporePickerValue(detail.data.oneTimeExecutionAt)
        : null,
    }
  }, [detail.data, scheduleId])
  const ruleOptions = useMemo(
    () =>
      (rules.data?.collection || []).map((rule) => ({
        value: rule.id,
        label: rule.ruleName,
      })),
    [rules.data]
  )
  const fields = useMemo(() => {
    const frequencyFields = []
    if (currentFrequency === EnumConfig.TopupScheduleTypeId.OneTime) {
      frequencyFields.push({
        key: 'oneTimeExecutionAt',
        title: `${t('topup_form.execution_date')} (${t('text.singapore_time')})`,
        type: 'custom',
        render: ({ value, onChange }) => (
          <DatePicker showTime value={value} onChange={onChange} style={{ width: '100%' }} />
        ),
      })
    }
    if (
      [EnumConfig.TopupScheduleTypeId.Monthly, EnumConfig.TopupScheduleTypeId.Yearly].includes(
        currentFrequency
      )
    ) {
      frequencyFields.push({
        key: 'executeAtDay',
        title: t('topup_form.day_of_month'),
        type: 'custom',
        render: ({ value, onChange }) => (
          <InputNumber
            min={1}
            max={28}
            value={value}
            onChange={onChange}
            style={{ width: '100%' }}
          />
        ),
      })
    }
    if (currentFrequency === EnumConfig.TopupScheduleTypeId.Yearly) {
      frequencyFields.push({
        key: 'executeAtMonth',
        title: t('topup_form.month'),
        type: 'custom',
        render: ({ value, onChange }) => (
          <InputNumber
            min={1}
            max={12}
            value={value}
            onChange={onChange}
            style={{ width: '100%' }}
          />
        ),
      })
    }

    return [
      {
        key: 'topupRuleId',
        title: t('topup_form.topup_rules'),
        type: 'select',
        options: ruleOptions,
        props: { showSearch: true, optionFilterProp: 'label', loading: rules.loading },
      },
      {
        key: 'frequency',
        title: t('topup_form.schedule_type'),
        type: 'select',
        options: _enum.topupScheduleTypeIdOptions,
      },
      ...frequencyFields,
      {
        key: 'executionTime',
        title: `${t('topup_form.execution_time')} (${t('text.singapore_time')})`,
        type: 'custom',
        render: ({ value, onChange }) => (
          <TimePicker
            format="HH:mm:ss"
            value={value}
            onChange={onChange}
            style={{ width: '100%' }}
          />
        ),
      },
    ]
  }, [_enum.topupScheduleTypeIdOptions, currentFrequency, ruleOptions, rules.loading, t])
  const handleValuesChange = useCallback((values) => {
    setCurrentFrequency((current) => (current === values.frequency ? current : values.frequency))
  }, [])
  const handleClose = () => {
    detail.setData(null)
    setCurrentFrequency(EnumConfig.TopupScheduleTypeId.OneTime)
    onClose?.()
  }

  if (open && scheduleId && !detail.data) {
    return (
      <GenericFormDialog
        open
        title={t('topup_form.update_schedule')}
        onClose={handleClose}
        fields={[]}
        showSubmit={false}
      >
        <Skeleton active />
      </GenericFormDialog>
    )
  }

  const handleSubmit = async ({ values, closeDialog }) => {
    const payload = {
      topupRuleId: values.topupRuleId,
      frequency: values.frequency,
      oneTimeExecutionAt:
        values.frequency === EnumConfig.TopupScheduleTypeId.OneTime
          ? singaporeWallTimeToIso(values.oneTimeExecutionAt)
          : null,
      executeAtDay: [
        EnumConfig.TopupScheduleTypeId.Monthly,
        EnumConfig.TopupScheduleTypeId.Yearly,
      ].includes(values.frequency)
        ? values.executeAtDay
        : null,
      executeAtMonth:
        values.frequency === EnumConfig.TopupScheduleTypeId.Yearly ? values.executeAtMonth : null,
      executionTime: values.executionTime.format('HH:mm:ss'),
      ...(scheduleId ? { status: values.status } : {}),
    }
    const response = await (scheduleId
      ? onUpdateSubmit?.({
          overrideUrl: ApiUrls.TOPUP_SCHEDULE.DETAIL(scheduleId),
          overrideData: payload,
        })
      : onCreateSubmit?.({ overrideData: payload }))
    if (!response) return
    closeDialog()
    await refetch?.()
  }

  return (
    <GenericFormDialog
      key={`${scheduleId || 'create'}-${detail.data?.updatedAt || ''}`}
      open={open}
      onClose={handleClose}
      title={scheduleId ? t('topup_form.update_schedule') : t('topup_form.create_schedule')}
      submitLabel={scheduleId ? t('button.update') : t('button.create')}
      initialValues={initialValues}
      fields={fields}
      destroyOnHidden
      onValuesChange={handleValuesChange}
      isSubmitDisabled={(values) => {
        if (!values.topupRuleId || !values.frequency || !values.executionTime) return true
        if (values.frequency === 1 && !values.oneTimeExecutionAt) return true
        if ([2, 3].includes(values.frequency) && !values.executeAtDay) return true
        if (values.frequency === 3 && !values.executeAtMonth) return true
        return false
      }}
      onSubmit={handleSubmit}
    />
  )
}

export default TopupScheduleFormSection
