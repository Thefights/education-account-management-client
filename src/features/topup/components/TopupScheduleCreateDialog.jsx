import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { DatePicker, InputNumber, Skeleton, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

const TopupScheduleCreateDialog = ({ open, scheduleId, onClose, onSuccess }) => {
  const { t } = useTranslation()
  
  const detail = useFetch(
    scheduleId ? ApiUrls.TOPUP_SCHEDULE.DETAIL(scheduleId) : '',
    {},
    [open, scheduleId],
    false
  )

  const rules = useFetch(ApiUrls.TOPUP_RULE.INDEX, { status: 1, page: 1, pageSize: 100 }, [open])
  const createSchedule = useAxiosSubmit({ url: ApiUrls.TOPUP_SCHEDULE.INDEX, method: 'POST' })
  const updateSchedule = useAxiosSubmit({ method: 'PUT' })

  // We need to track frequency to render different fields
  const [currentFrequency, setCurrentFrequency] = useState(1)

  const initialValues = useMemo(() => {
    if (!scheduleId) {
      setCurrentFrequency(1)
      return {
        frequency: 1,
        executionTime: dayjs('00:00:00', 'HH:mm:ss')
      }
    }
    
    setCurrentFrequency(detail.data?.frequency ?? 1)
    return {
      ...detail.data,
      executionTime: detail.data?.executionTime ? dayjs(detail.data.executionTime, 'HH:mm:ss') : dayjs('00:00:00', 'HH:mm:ss'),
      oneTimeExecutionAt: detail.data?.oneTimeExecutionAt ? dayjs(detail.data.oneTimeExecutionAt) : null,
      status: detail.data?.status === 'Inactive' ? 2 : 1,
    }
  }, [detail.data, scheduleId])

  const fields = useMemo(() => {
    const ruleOptions = (rules.data?.collection || []).map((rule) => ({ value: rule.id, label: rule.ruleName }))
    
    const baseFields = [
      {
        key: 'topupRuleId',
        title: t('topup_form.topup_rules'),
        type: 'select',
        options: ruleOptions,
        props: { showSearch: true, optionFilterProp: 'label', loading: rules.loading }
      },
      {
        key: 'frequency',
        title: t('topup_form.schedule_type'),
        type: 'select',
        options: [
          { value: 1, label: t('topup_form.one_time') },
          { value: 2, label: t('topup_form.monthly') },
          { value: 3, label: t('topup_form.yearly') }
        ],
      }
    ]

    const frequencyFields = []
    if (currentFrequency === 1) {
      frequencyFields.push({
        key: 'oneTimeExecutionAt',
        title: t('topup_form.execution_date'),
        type: 'custom',
        render: ({ value, onChange }) => <DatePicker showTime value={value} onChange={onChange} style={{ width: '100%' }} />
      })
    }
    if ([2, 3].includes(currentFrequency)) {
      frequencyFields.push({
        key: 'executeAtDay',
        title: t('topup_form.day_of_month'),
        type: 'custom',
        render: ({ value, onChange }) => <InputNumber min={1} max={31} value={value} onChange={onChange} style={{ width: '100%' }} />
      })
    }
    if (currentFrequency === 3) {
      frequencyFields.push({
        key: 'executeAtMonth',
        title: t('topup_form.month'),
        type: 'custom',
        render: ({ value, onChange }) => <InputNumber min={1} max={12} value={value} onChange={onChange} style={{ width: '100%' }} />
      })
    }

    return [
      ...baseFields,
      ...frequencyFields,
      {
        key: 'executionTime',
        title: t('topup_form.execution_time'),
        type: 'custom',
        render: ({ value, onChange }) => <TimePicker format="HH:mm:ss" value={value} onChange={onChange} style={{ width: '100%' }} />
      },
      ...(scheduleId ? [{
        key: 'status',
        title: t('topup_form.status'),
        type: 'select',
        options: [{ value: 1, label: t('topup_form.active') }, { value: 2, label: t('topup_form.inactive') }],
      }] : [])
    ]
  }, [rules.data, rules.loading, currentFrequency, scheduleId, t])

  if (open && scheduleId && !detail.data) {
    return <GenericFormDialog open title={t('topup_form.update_schedule')} width={640} onClose={onClose} fields={[]}><Skeleton active /></GenericFormDialog>
  }

  return (
    <GenericFormDialog
      key={`${scheduleId || 'create'}-${detail.data?.updatedAt || ''}`}
      open={open}
      onClose={onClose}
      title={scheduleId ? t('topup_form.update_schedule') : t('topup_form.create_schedule')}
      submitLabel={scheduleId ? t('button.update') : t('button.create')}
      width={640}
      initialValues={initialValues}
      fields={fields}
      destroyOnClose
      onValuesChange={(values) => {
        if (values.frequency !== currentFrequency) {
          setCurrentFrequency(values.frequency)
        }
      }}
      isSubmitDisabled={(values) => {
        if (!values.topupRuleId || !values.frequency || !values.executionTime) return true
        if (values.frequency === 1 && !values.oneTimeExecutionAt) return true
        if ([2, 3].includes(values.frequency) && !values.executeAtDay) return true
        if (values.frequency === 3 && !values.executeAtMonth) return true
        return false
      }}
      onSubmit={async ({ values, closeDialog }) => {
        const payload = {
          topupRuleId: values.topupRuleId,
          frequency: values.frequency,
          oneTimeExecutionAt: values.frequency === 1 ? values.oneTimeExecutionAt.toISOString() : null,
          executeAtDay: [2, 3].includes(values.frequency) ? values.executeAtDay : null,
          executeAtMonth: values.frequency === 3 ? values.executeAtMonth : null,
          executionTime: values.executionTime.format('HH:mm:ss'),
          ...(scheduleId ? { status: values.status } : {})
        }

        const response = scheduleId
          ? await updateSchedule.submit({ overrideUrl: ApiUrls.TOPUP_SCHEDULE.DETAIL(scheduleId), overrideData: payload })
          : await createSchedule.submit({ overrideData: payload })

        if (response) {
          closeDialog()
          onSuccess?.()
        }
      }}
    />
  )
}

export default TopupScheduleCreateDialog
