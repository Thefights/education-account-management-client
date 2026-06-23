import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { countTopupConditions } from '../utils/topupRuleFormUtil'

const formatAmount = (value) => (value == null ? '-' : Number(value).toLocaleString())

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
    { key: 'name', title: t('topup.topup_name'), width: 240, sortable: true },
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
      options: _enum.systemTopupStatusOptions,
      color: defaultTopupStatusStyle,
    },
    {
      key: 'rootConditionGroup',
      title: t('topup.conditions'),
      width: 120,
      isNumeric: true,
      render: countTopupConditions,
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
