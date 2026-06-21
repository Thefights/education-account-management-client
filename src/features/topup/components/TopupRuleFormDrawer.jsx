import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import { EnumConfig } from '@/shared/config/enumConfig'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Drawer, InputNumber, Skeleton, Typography } from 'antd'
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

const TopupRuleFormDrawer = ({ open, ruleId, ruleType, onClose, onSubmit }) => {
  const { t } = useTranslation()
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
        type: ruleType ?? 1,
        matchMode: EnumConfig.TopupMatchModeId.And,
        topupAmount: '',
        conditions: [{ ...emptyCondition }],
      }
    }

    return {
      ...detail.data,
      matchMode: detail.data?.matchMode === EnumConfig.TopupMatchMode.Or
        ? EnumConfig.TopupMatchModeId.Or
        : EnumConfig.TopupMatchModeId.And,
      status: detail.data?.status === 'Inactive' ? 2 : 1,
      conditions: (detail.data?.conditions || []).map(normalizeTopupRuleCondition),
    }
  }, [detail.data, ruleId, ruleType])
  const fields = useMemo(() => [
    { key: 'ruleName', title: t('topup_form.rule_name') },
    ...(!ruleId && !ruleType ? [
      {
        key: 'type',
        title: t('topup_form.rule_type', 'Rule type'),
        type: 'select',
        options: [{ value: 1, label: 'System' }, { value: 2, label: 'Schedule' }],
      },
    ] : []),
    {
        key: 'matchMode',
        title: t('topup_form.match_mode', 'Match mode'),
        type: 'select',
        options: [
          { value: EnumConfig.TopupMatchModeId.And, label: 'AND' },
          { value: EnumConfig.TopupMatchModeId.Or, label: 'OR' },
        ],
    },
    {
      key: 'topupAmount',
      title: t('topup_form.topup_amount'),
      type: 'custom',
      required: false,
      render: ({ value, onChange, values }) => values.matchMode === EnumConfig.TopupMatchModeId.And
        ? <InputNumber min={0.01} precision={2} value={value} onChange={onChange} style={{ width: '100%' }} />
        : <Typography.Text type="secondary">{t('topup_form.or_amount_hint')}</Typography.Text>,
    },
    ...(ruleId ? [{
      key: 'status',
      title: t('topup_form.status'),
      type: 'select',
      options: [{ value: 1, label: t('topup_form.active') }, { value: 2, label: t('topup_form.inactive') }],
    }] : []),
    {
      key: 'conditions',
      title: '',
      type: 'custom',
      render: ({ value, onChange, values }) => (
        <TopupRuleConditionsField value={value} onChange={onChange} matchMode={values.matchMode ?? detail.data?.matchMode} />
      ),
    },
  ], [detail.data?.matchMode, ruleId, ruleType, t])

  if (open && ruleId && !detail.data) {
    return <Drawer open title={t('topup_form.update_rule')} width={640} onClose={onClose}><Skeleton active /></Drawer>
  }

  return (
    <GenericFormDrawer
      key={`${ruleId || 'create'}-${detail.data?.updatedAt || ''}`}
      open={open}
      onClose={onClose}
      title={ruleId ? t('topup_form.update_rule') : t('topup_form.create_rule')}
      submitLabel={ruleId ? t('button.update') : t('button.create')}
      width={640}
      initialValues={initialValues}
      fields={fields}
      destroyOnClose
      isSubmitDisabled={(values) => {
        if (!values.ruleName?.trim() || !values.conditions?.length) return true
        if (values.matchMode === EnumConfig.TopupMatchModeId.And) {
          return !(Number(values.topupAmount) > 0)
        }
        return values.conditions.some((condition) => !(Number(condition.conditionAmount) > 0))
      }}
      onSubmit={async ({ values, closeDrawer }) => {
        const conditions = values.conditions.map((condition, index) => ({
          ...(ruleId && condition.id ? { id: condition.id } : {}),
          field: condition.field,
          operator: condition.operator,
          displayOrder: index,
          valueText: condition.field === 3 ? condition.valueText : null,
          valueNumber: condition.field === 3 ? null : condition.valueNumber,
          conditionAmount: values.matchMode === EnumConfig.TopupMatchModeId.Or
            ? condition.conditionAmount
            : null,
        }))
        const payload = {
          ruleName: values.ruleName.trim(),
          matchMode: values.matchMode,
          topupAmount: values.matchMode === EnumConfig.TopupMatchModeId.Or ? null : values.topupAmount,
          conditions,
          ...(ruleId
            ? { status: values.status }
            : { type: ruleType ?? values.type }),
        }
        if (await onSubmit(payload)) closeDrawer()
      }}
    />
  )
}

export default TopupRuleFormDrawer
