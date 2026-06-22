import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultTopupMatchModeStyle,
  defaultTopupRuleTypeStyle,
  defaultTopupStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'

const formatAmount = (value) => (value == null ? null : Number(value).toLocaleString())

const TopupRuleTableSection = ({
  rules,
  loading,
  sort,
  setSort,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    { key: 'id', title: 'ID', sortable: true, width: 80, fixedColumn: true },
    { key: 'ruleName', title: t('topup.rule_name'), width: 220, sortable: true },
    {
      key: 'type',
      title: t('topup.rule_type'),
      width: 130,
      sortable: true,
      type: 'tag',
      options: _enum.topupRuleTypeOptions,
      color: defaultTopupRuleTypeStyle,
    },
    {
      key: 'matchMode',
      title: t('topup_form.match_mode'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.topupMatchModeOptions,
      color: defaultTopupMatchModeStyle,
    },
    {
      key: 'topupAmount',
      title: t('topup.amount'),
      width: 140,
      isNumeric: true,
      sortable: true,
      render: formatAmount,
    },
    {
      key: 'status',
      title: t('topup.status'),
      width: 120,
      type: 'tag',
      options: _enum.topupScheduleStatusOptions,
      color: defaultTopupStatusStyle,
    },
    {
      key: 'conditions',
      title: t('topup.conditions'),
      width: 120,
      isNumeric: true,
      render: (conditions) => conditions?.length ?? 0,
    },
    {
      key: 'createdAt',
      title: t('topup.created_at'),
      width: 190,
      sortable: true,
      render: formatDateBasedOnCurrentLanguage,
    },
    {
      key: 'actions',
      title: '',
      width: 70,
      render: (_, row) => (
        <ActionMenu
          actions={[
            { title: t('button.edit'), onClick: () => onEdit?.(row) },
            { title: t('button.delete'), onClick: () => onDelete?.(row) },
          ]}
        />
      ),
    },
  ]
  return (
    <GenericTable
      data={rules}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      canSelectRows
      selectedRows={selectedIds}
      setSelectedRows={setSelectedIds}
    />
  )
}

export default TopupRuleTableSection
