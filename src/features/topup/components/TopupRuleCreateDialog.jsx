import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import GenericFormDialog from '@/shared/components/dialogs/commons/GenericFormDialog'
import MultipleSelectDialog from '@/shared/components/dialogs/commons/MultipleSelectDialog'
import MaskedNric from '@/shared/components/generals/MaskedNric'
import { EnumConfig } from '@/shared/config/enumConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Flex, InputNumber, Skeleton, Tabs, Typography } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { normalizeTopupRuleCondition } from '../utils/topupRuleFormUtil'
import TopupRuleConditionsField from './TopupRuleConditionsField'

const emptyCondition = {
  field: 1, operator: 1, valueText: null, valueNumber: null, conditionAmount: null, displayOrder: 0,
}

const AccountSelector = ({ value = [], onChange }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const loadAccounts = useCallback(async ({ search, page, pageSize }) => {
    const response = await axiosConfig.get(ApiUrls.TOPUP.ELIGIBLE_ACCOUNTS, { params: { search, page, pageSize } })
    const data = response.data
    return {
      totalCount: data?.totalCount || 0,
      options: (data?.collection || []).map((account) => ({
        value: account.id,
        label: (
          <Flex vertical>
            <Typography.Text strong>{account.accountNumber} - {account.name}</Typography.Text>
            <Typography.Text type="secondary">
              <MaskedNric value={account.nric} /> | {t('topup.balance', 'Balance')}: {account.balance}
            </Typography.Text>
          </Flex>
        ),
        searchKey: `${account.accountNumber} ${account.nric} ${account.name}`,
      })),
    }
  }, [t])

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t('topup.select_accounts', 'Select accounts')} ({value.length})</Button>
      <MultipleSelectDialog open={open} onClose={() => setOpen(false)} value={value} onChange={onChange} loadOptions={loadAccounts} title={t('topup.select_accounts')} />
    </>
  )
}

const TopupRuleCreateDialog = ({ open, ruleId, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('rule')

  const detail = useFetch(
    ruleId ? ApiUrls.TOPUP_RULE.DETAIL(ruleId) : '',
    {},
    [open, ruleId],
    false
  )

  const createRule = useAxiosSubmit({ url: ApiUrls.TOPUP_RULE.INDEX, method: 'POST' })
  const updateRule = useAxiosSubmit({ method: 'PUT' })
  const executeManual = useAxiosSubmit({ url: ApiUrls.TOPUP.EXECUTE_MANUAL, method: 'POST' })

  const initialValues = useMemo(() => {
    if (!ruleId) {
      if (activeTab === 'manual') {
        return {
          accountIds: [],
          topUpAmount: '',
          disbursementReason: '',
        }
      }
      return {
        ruleName: '',
        type: 1, // System default, since we combined them
        matchMode: EnumConfig.TopupMatchModeId.And,
        topupAmount: '',
        conditions: [{ ...emptyCondition }],
      }
    }

    return {
      ...detail.data,
      matchMode: detail.data?.matchMode === EnumConfig.TopupMatchMode.Or ? 2 : 1,
      status: detail.data?.status === 'Inactive' ? 2 : 1,
      conditions: (detail.data?.conditions || []).map(normalizeTopupRuleCondition),
    }
  }, [detail.data, ruleId, activeTab])

  const fields = useMemo(() => {
    const tabsField = ruleId ? [] : [
      {
        key: '_tabs',
        title: '',
        type: 'custom',
        render: () => (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'rule', label: t('topup_form.system_or_schedule', 'System or Schedule Rule') },
              { key: 'manual', label: t('topup.manual_tab', 'Manual') },
            ]}
            style={{ marginBottom: 16 }}
          />
        ),
      }
    ]

    if (!ruleId && activeTab === 'manual') {
      return [
        ...tabsField,
        {
          key: 'accountIds',
          title: t('topup.select_accounts', 'Select accounts'),
          type: 'custom',
          render: ({ value, onChange }) => <AccountSelector value={value} onChange={onChange} />,
        },
        {
          key: 'topUpAmount',
          title: t('topup.amount', 'Amount'),
          type: 'custom',
          render: ({ value, onChange }) => <InputNumber min={0.01} precision={2} value={value} onChange={onChange} style={{ width: '100%' }} />,
        },
        {
          key: 'disbursementReason',
          title: t('topup.reason', 'Reason'),
          type: 'textarea',
          props: { rows: 4 },
        },
      ]
    }

    return [
      ...tabsField,
      { key: 'ruleName', title: t('topup_form.rule_name', 'Rule name'), type: 'text' },
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
        title: t('topup_form.topup_amount', 'Topup amount'),
        type: 'custom',
        render: ({ value, onChange, values }) => values.matchMode === EnumConfig.TopupMatchModeId.And
          ? <InputNumber min={0.01} precision={2} value={value} onChange={onChange} style={{ width: '100%' }} />
          : <Typography.Text type="secondary">{t('topup_form.or_amount_hint', 'OR mode uses amount configured on conditions.')}</Typography.Text>,
      },
      ...(ruleId ? [{
        key: 'status',
        title: t('topup_form.status', 'Status'),
        type: 'select',
        options: [{ value: 1, label: t('topup_form.active', 'Active') }, { value: 2, label: t('topup_form.inactive', 'Inactive') }],
      }] : []),
      {
        key: 'conditions',
        title: '',
        type: 'custom',
        render: ({ value, onChange, values }) => (
          <TopupRuleConditionsField value={value} onChange={onChange} matchMode={values.matchMode ?? detail.data?.matchMode} />
        ),
      },
    ]
  }, [ruleId, activeTab, detail.data, t])

  if (open && ruleId && !detail.data) {
    return <GenericFormDialog open title={t('topup_form.update_rule', 'Update rule')} width={640} onClose={onClose} fields={[]}><Skeleton active /></GenericFormDialog>
  }

  return (
    <GenericFormDialog
      key={`${ruleId || 'create'}-${activeTab}-${detail.data?.updatedAt || ''}`}
      open={open}
      onClose={onClose}
      title={ruleId ? t('topup_form.update_rule', 'Update rule') : t('topup_form.create_rule', 'Create rule')}
      submitLabel={ruleId ? t('button.update', 'Update') : (!ruleId && activeTab === 'manual' ? t('topup.execute', 'Execute') : t('button.create', 'Create'))}
      width={640}
      initialValues={initialValues}
      fields={fields}
      destroyOnClose
      isSubmitDisabled={(values) => {
        if (!ruleId && activeTab === 'manual') {
          return !values.accountIds?.length || !values.topUpAmount || !values.disbursementReason?.trim()
        }
        if (!values.ruleName?.trim() || !values.conditions?.length) return true
        if (values.matchMode === EnumConfig.TopupMatchModeId.And) {
          return !(Number(values.topupAmount) > 0)
        }
        return values.conditions.some((condition) => !(Number(condition.conditionAmount) > 0))
      }}
      onSubmit={async ({ values, closeDialog }) => {
        if (!ruleId && activeTab === 'manual') {
          const response = await executeManual.submit({
            overrideData: {
              accountIds: values.accountIds,
              topUpAmount: values.topUpAmount,
              disbursementReason: values.disbursementReason.trim(),
              idempotencyKey: crypto.randomUUID(),
            },
          })
          if (response) {
            closeDialog()
            onSuccess?.()
          }
          return
        }

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
            : { type: values.type }),
        }
        
        const response = ruleId
          ? await updateRule.submit({ overrideUrl: ApiUrls.TOPUP_RULE.DETAIL(ruleId), overrideData: payload })
          : await createRule.submit({ overrideData: payload })
          
        if (response) {
          closeDialog()
          onSuccess?.()
        }
      }}
    />
  )
}

export default TopupRuleCreateDialog
