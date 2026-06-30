import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { EnumConfig } from '@/shared/config/enumConfig'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Form, InputNumber, Skeleton } from 'antd'
import { useMemo } from 'react'
import {
  createEmptyTopupScenarioRoot,
  isTopupConditionGroupValid,
  normalizeTopupConditionGroup,
  serializeTopupConditionGroup,
} from '../utils/topupRuleFormUtil'
import TopupRuleConditionsField from './TopupRuleConditionsField'

const TopupRuleFormSection = ({
  open,
  ruleId,
  onClose,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
}) => {
  const { t } = useTranslation()
  const detail = useFetch(
    ruleId ? ApiUrls.SYSTEM_TOPUP.DETAIL(ruleId) : '',
    {},
    [open, ruleId],
    false
  )
  const initialValues = useMemo(() => {
    if (!ruleId) {
      return {
        name: '',
        topupAmount: null,
        rootConditionGroup: createEmptyTopupScenarioRoot(),
      }
    }
    return {
      ...detail.data,
      status: detail.data?.status ?? EnumConfig.SystemTopupStatus.Active,
      rootConditionGroup: normalizeTopupConditionGroup(detail.data?.rootConditionGroup),
    }
  }, [detail.data, ruleId])
  const fields = useMemo(
    () => [
      {
        key: 'name',
        title: t('topup_form.topup_name'),
        placeholder: 'e.g. Student Support Top-up 2026',
      },
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
              prefix="S$"
              placeholder="e.g. 100.00"
              style={{ width: '100%' }}
            />
          </Form.Item>
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
    ],
    [t]
  )
  const handleClose = () => {
    detail.setData(null)
    onClose?.()
  }

  if (open && ruleId && !detail.data) {
    return (
      <GenericFormDialog
        open
        title={t('topup_form.update_system_topup')}
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
      rootConditionGroup: serializeTopupConditionGroup(values.rootConditionGroup),
      ...(ruleId ? { status: values.status } : {}),
    }
    const response = await (ruleId
      ? onUpdateSubmit?.({
          overrideUrl: ApiUrls.SYSTEM_TOPUP.DETAIL(ruleId),
          overrideData: payload,
        })
      : onCreateSubmit?.({ overrideData: payload }))
    if (!response) return
    closeDialog()
    await refetch?.()
  }

  return (
    <GenericFormDialog
      key={`${ruleId || 'create'}-${detail.data?.name || ''}`}
      open={open}
      onClose={handleClose}
      title={ruleId ? t('topup_form.update_system_topup') : t('topup_form.create_system_topup')}
      submitLabel={ruleId ? t('button.update') : t('button.create')}
      initialValues={initialValues}
      fields={fields}
      destroyOnHidden
      isSubmitDisabled={(values) =>
        !values.name?.trim() ||
        !(Number(values.topupAmount) > 0) ||
        !isTopupConditionGroupValid(values.rootConditionGroup)
      }
      onSubmit={handleSubmit}
    />
  )
}

export default TopupRuleFormSection
