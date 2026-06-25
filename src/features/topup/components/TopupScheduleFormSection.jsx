import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  localDateTimeToIso,
  toLocalPickerValue,
} from '@/shared/utils/dateTimeUtil'
import { Skeleton } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import {
  createEmptyTopupConditionGroup,
  isTopupConditionGroupValid,
  normalizeTopupConditionGroup,
  serializeTopupConditionGroup,
} from '../utils/topupRuleFormUtil'
import TopupRuleConditionsField from './TopupRuleConditionsField'

const frequencyValues = { OneTime: 1, Monthly: 2, Yearly: 3 }
const statusValues = { Active: 1, Inactive: 2, Completed: 3 }
const getScheduleExecutionAt = (data = {}) => {
  if (data.oneTimeExecutionAt) return toLocalPickerValue(data.oneTimeExecutionAt)

  const [hour = 0, minute = 0, second = 0] = String(data.executionTime || '00:00:00')
    .split(':')
    .map((value) => Number(value))
  const now = dayjs()
  const month = Number(data.executeAtMonth) || now.month() + 1
  const day = Number(data.executeAtDay) || now.date()

  return dayjs()
    .month(month - 1)
    .date(day)
    .hour(hour)
    .minute(minute)
    .second(second)
}

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
        scheduleExecutionAt: null,
        rootConditionGroup: createEmptyTopupConditionGroup(),
      }
    }

    return {
      ...detail.data,
      frequency: frequencyValues[detail.data?.frequency] ?? detail.data?.frequency ?? 1,
      status: statusValues[detail.data?.status] ?? detail.data?.status ?? 1,
      scheduleExecutionAt: getScheduleExecutionAt(detail.data),
      rootConditionGroup: normalizeTopupConditionGroup(detail.data?.rootConditionGroup),
    }
  }, [detail.data, scheduleId])

  const fields = useMemo(() => {
    return [
      { key: 'name', title: t('topup_form.topup_name') },
      {
        key: 'topupAmount',
        title: t('topup_form.topup_amount'),
        type: 'input-number',
        minValue: 0.01,
        props: { precision: 2, prefix: '$' },
      },
      {
        key: 'frequency',
        title: t('topup_form.schedule_type'),
        type: 'select',
        options: _enum.scheduleTopupFrequencyIdOptions,
      },
      {
        key: 'scheduleExecutionAt',
        title: t('topup_form.execution_date'),
        type: 'datetime',
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
  }, [_enum.scheduleTopupFrequencyIdOptions, t])
  const handleClose = () => {
    detail.setData(null)
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
    const scheduleExecutionAt = values.scheduleExecutionAt
    const payload = {
      name: values.name.trim(),
      topupAmount: values.topupAmount,
      frequency: values.frequency,
      scheduleExecutionAt: localDateTimeToIso(scheduleExecutionAt),
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
      isSubmitDisabled={(values) => {
        if (
          !values.name?.trim() ||
          !(Number(values.topupAmount) > 0) ||
          !values.frequency ||
          !values.scheduleExecutionAt ||
          !isTopupConditionGroupValid(values.rootConditionGroup)
        )
          return true
        return false
      }}
      onSubmit={handleSubmit}
    />
  )
}

export default TopupScheduleFormSection
