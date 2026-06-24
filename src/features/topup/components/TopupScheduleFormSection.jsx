import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  localDateTimeToIso,
  toLocalPickerValue,
  toLocalTimePickerValue,
} from '@/shared/utils/dateTimeUtil'
import { DatePicker, Form, InputNumber, Skeleton, TimePicker } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import {
  createEmptyTopupConditionGroup,
  isTopupConditionGroupValid,
  normalizeTopupConditionGroup,
  serializeTopupConditionGroup,
} from '../utils/topupRuleFormUtil'
import TopupRuleConditionsField from './TopupRuleConditionsField'

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
  const [currentFrequency, setCurrentFrequency] = useState(null)
  const detail = useFetch(
    scheduleId ? ApiUrls.SCHEDULE_TOPUP.DETAIL(scheduleId) : '',
    {},
    [open, scheduleId],
    false
  )
  const initialValues = useMemo(() => {
    if (!scheduleId) {
      return {
        name: '',
        topupAmount: null,
        frequency: EnumConfig.ScheduleTopupFrequencyId.OneTime,
        oneTimeExecutionAt: null,
        executeAtDay: null,
        executeAtMonth: null,
        executionTime: toLocalTimePickerValue(),
        rootConditionGroup: createEmptyTopupConditionGroup(),
      }
    }

    return {
      ...detail.data,
      frequency: frequencyValues[detail.data?.frequency] ?? detail.data?.frequency ?? 1,
      status: statusValues[detail.data?.status] ?? detail.data?.status ?? 1,
      executionTime: detail.data?.executionTime
        ? toLocalTimePickerValue(detail.data.executionTime)
        : toLocalTimePickerValue(),
      oneTimeExecutionAt: detail.data?.oneTimeExecutionAt
        ? toLocalPickerValue(detail.data.oneTimeExecutionAt)
        : null,
      rootConditionGroup: normalizeTopupConditionGroup(detail.data?.rootConditionGroup),
    }
  }, [detail.data, scheduleId])
  const displayedFrequency = currentFrequency ?? initialValues.frequency

  const fields = useMemo(() => {
    const frequencyFields = []
    if (displayedFrequency === EnumConfig.ScheduleTopupFrequencyId.OneTime) {
      frequencyFields.push({
        key: 'oneTimeExecutionAt',
        title: t('topup_form.execution_date'),
        type: 'custom',
        render: ({ value, onChange }) => (
          <DatePicker showTime value={value} onChange={onChange} style={{ width: '100%' }} />
        ),
      })
    }
    if (
      [
        EnumConfig.ScheduleTopupFrequencyId.Monthly,
        EnumConfig.ScheduleTopupFrequencyId.Yearly,
      ].includes(displayedFrequency)
    ) {
      frequencyFields.push({
        key: 'executeAtDay',
        title: t('topup_form.day_of_month'),
        type: 'custom',
        render: ({ value, onChange }) => (
          <InputNumber
            min={1}
            max={31}
            value={value}
            onChange={onChange}
            style={{ width: '100%' }}
          />
        ),
      })
    }
    if (displayedFrequency === EnumConfig.ScheduleTopupFrequencyId.Yearly) {
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
      { key: 'name', title: t('topup_form.topup_name') },
      {
        key: 'topupAmount',
        title: '',
        type: 'custom',
        render: ({ value, onChange }) => (
          <Form.Item
            label={t('topup_form.topup_amount')}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            labelAlign="left"
            colon={false}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              min={0.01}
              precision={2}
              value={value}
              onChange={onChange}
              prefix="$"
              style={{ width: '100%' }}
            />
          </Form.Item>
        ),
      },
      {
        key: 'frequency',
        title: t('topup_form.schedule_type'),
        type: 'select',
        options: _enum.scheduleTopupFrequencyIdOptions,
      },
      ...frequencyFields,
      {
        key: 'executionTime',
        title: t('topup_form.execution_time'),
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
      {
        key: 'rootConditionGroup',
        title: '',
        type: 'custom',
        render: ({ value, onChange }) => (
          <TopupRuleConditionsField value={value} onChange={onChange} />
        ),
      },
    ]
  }, [_enum.scheduleTopupFrequencyIdOptions, displayedFrequency, t])
  const handleValuesChange = useCallback((values) => {
    setCurrentFrequency((current) => (current === values.frequency ? current : values.frequency))
  }, [])
  const handleClose = () => {
    detail.setData(null)
    setCurrentFrequency(null)
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
      name: values.name.trim(),
      topupAmount: values.topupAmount,
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
      rootConditionGroup: serializeTopupConditionGroup(values.rootConditionGroup),
      ...(scheduleId ? { status: values.status } : {}),
    }
    const response = await (scheduleId
      ? onUpdateSubmit?.({
          overrideUrl: ApiUrls.SCHEDULE_TOPUP.DETAIL(scheduleId),
          overrideData: payload,
        })
      : onCreateSubmit?.({ overrideData: payload }))
    if (!response) return
    closeDialog()
    await refetch?.()
  }

  return (
    <GenericFormDialog
      key={`${scheduleId || 'create'}-${detail.data?.name || ''}`}
      open={open}
      onClose={handleClose}
      title={scheduleId ? t('topup_form.update_schedule') : t('topup_form.create_schedule')}
      submitLabel={scheduleId ? t('button.update') : t('button.create')}
      initialValues={initialValues}
      fields={fields}
      destroyOnHidden
      onValuesChange={handleValuesChange}
      isSubmitDisabled={(values) => {
        if (
          !values.name?.trim() ||
          !(Number(values.topupAmount) > 0) ||
          !values.frequency ||
          !values.executionTime ||
          !isTopupConditionGroupValid(values.rootConditionGroup)
        )
          return true
        if (values.frequency === 1 && !values.oneTimeExecutionAt) return true
        if ([2, 3].includes(values.frequency) && !values.executeAtDay) return true
        if (values.frequency === 3 && !values.executeAtMonth) return true
        if (values.frequency === 3 && values.executeAtDay && values.executeAtMonth) {
          return values.executeAtDay > new Date(2024, values.executeAtMonth, 0).getDate()
        }
        return false
      }}
      onSubmit={handleSubmit}
    />
  )
}

export default TopupScheduleFormSection
