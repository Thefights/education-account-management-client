import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import { EnumConfig } from '@/shared/config/enumConfig'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { InputNumber, Skeleton, Typography } from 'antd'
import { useMemo } from 'react'
import { normalizeTopupRuleCondition } from '../utils/topupRuleFormUtil'
import TopupRuleConditionsField from './TopupRuleConditionsField'

const emptyCondition = {
  field: 1,
  operator: 1,
  valueText: null,
  valueNumber: null,
  conditionAmount: null,
  displayOrder: 0,
}

const TopupRuleFormSection = ({
  open,
  ruleId,
  onClose,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const detail = useFetch(
    ruleId ? ApiUrls.TOPUP_RULE.DETAIL(ruleId) : '',
    {},
    [open, ruleId],
    false
  )
  const initialValues = useMemo(() => {
    if (!ruleId) {
      return {
        ruleName: '',
        type: EnumConfig.TopupRuleTypeId.System,
        matchMode: EnumConfig.TopupMatchModeId.And,
        topupAmount: '',
        conditions: [{ ...emptyCondition }],
      }
    }

    return {
      ...detail.data,
      matchMode: ['Or', 'OR', EnumConfig.TopupMatchModeId.Or].includes(detail.data?.matchMode)
        ? EnumConfig.TopupMatchModeId.Or
        : EnumConfig.TopupMatchModeId.And,
      status: detail.data?.status === 'Inactive' ? 2 : 1,
      conditions: (detail.data?.conditions || []).map(normalizeTopupRuleCondition),
    }
  }, [detail.data, ruleId])
  const fields = useMemo(
    () => [
      { key: 'ruleName', title: t('topup_form.rule_name') },
      ...(!ruleId
        ? [
            {
              key: 'type',
              title: t('topup_form.rule_type'),
              type: 'select',
              options: _enum.topupRuleTypeIdOptions,
            },
          ]
        : []),
      {
        key: 'matchMode',
        title: t('topup_form.match_mode'),
        type: 'select',
        options: _enum.topupMatchModeIdOptions,
      },
      {
        key: 'topupAmount',
        title: t('topup_form.topup_amount'),
        type: 'custom',
        required: false,
        render: ({ value, onChange, values }) =>
          values.matchMode === EnumConfig.TopupMatchModeId.And ? (
            <InputNumber
              min={0.01}
              precision={2}
              value={value}
              onChange={onChange}
              style={{ width: '100%' }}
            />
          ) : (
            <Typography.Text type="secondary">{t('topup_form.or_amount_hint')}</Typography.Text>
          ),
      },
      {
        key: 'conditions',
        title: '',
        type: 'custom',
        render: ({ value, onChange, values }) => (
          <TopupRuleConditionsField
            value={value}
            onChange={onChange}
            matchMode={values.matchMode}
          />
        ),
      },
    ],
    [_enum.topupMatchModeIdOptions, _enum.topupRuleTypeIdOptions, ruleId, t]
  )
  const handleClose = () => {
    detail.setData(null)
    onClose?.()
  }

  if (open && ruleId && !detail.data) {
    return (
      <GenericFormDialog
        open
        title={t('topup_form.update_rule')}
        onClose={handleClose}
        fields={[]}
        showSubmit={false}
      >
        <Skeleton active />
      </GenericFormDialog>
    )
  }

  const handleSubmit = async ({ values, closeDialog }) => {
    const conditions = values.conditions.map((condition, index) => ({
      ...(ruleId && condition.id ? { id: condition.id } : {}),
      field: condition.field,
      operator: condition.operator,
      displayOrder: index,
      valueText: condition.field === 3 ? condition.valueText : null,
      valueNumber: condition.field === 3 ? null : condition.valueNumber,
      conditionAmount:
        values.matchMode === EnumConfig.TopupMatchModeId.Or ? condition.conditionAmount : null,
    }))
    const payload = {
      ruleName: values.ruleName.trim(),
      matchMode: values.matchMode,
      topupAmount:
        values.matchMode === EnumConfig.TopupMatchModeId.Or ? null : values.topupAmount,
      conditions,
      ...(ruleId ? { status: values.status } : { type: values.type }),
    }
    const response = await (ruleId
      ? onUpdateSubmit?.({
          overrideUrl: ApiUrls.TOPUP_RULE.DETAIL(ruleId),
          overrideData: payload,
        })
      : onCreateSubmit?.({ overrideData: payload }))
    if (!response) return
    closeDialog()
    await refetch?.()
  }

  return (
    <GenericFormDialog
      key={`${ruleId || 'create'}-${detail.data?.updatedAt || ''}`}
      open={open}
      onClose={handleClose}
      title={ruleId ? t('topup_form.update_rule') : t('topup_form.create_rule')}
      submitLabel={ruleId ? t('button.update') : t('button.create')}
      initialValues={initialValues}
      fields={fields}
      destroyOnHidden
      isSubmitDisabled={(values) => {
        if (!values.ruleName?.trim() || !values.conditions?.length) return true
        if (values.matchMode === EnumConfig.TopupMatchModeId.And) {
          return !(Number(values.topupAmount) > 0)
        }
        return values.conditions.some((condition) => !(Number(condition.conditionAmount) > 0))
      }}
      onSubmit={handleSubmit}
    />
  )
}

export default TopupRuleFormSection
