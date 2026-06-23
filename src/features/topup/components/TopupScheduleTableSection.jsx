import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { countTopupConditions } from '../utils/topupRuleFormUtil'

const formatAmount = (value) => (value == null ? '-' : Number(value).toLocaleString())

const TopupScheduleTableSection = ({
  schedules,
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
    { key: 'name', title: t('topup.topup_name'), width: 220, sortable: true },
    {
      key: 'topupAmount',
      title: t('topup.amount'),
      width: 130,
      isNumeric: true,
      sortable: true,
      render: formatAmount,
    },
    {
      key: 'frequency',
      title: t('topup.schedule_type'),
      width: 140,
      sortable: true,
      options: _enum.scheduleTopupFrequencyOptions,
    },
    {
      key: 'status',
      title: t('topup.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.scheduleTopupStatusOptions,
      color: defaultTopupStatusStyle,
    },
    {
      key: 'rootConditionGroup',
      title: t('topup.conditions'),
      width: 110,
      isNumeric: true,
      render: countTopupConditions,
    },
    { key: 'executionTime', title: t('topup_form.execution_time'), width: 150 },
    {
      key: 'nextExecutionAt',
      title: t('topup.next_execution'),
      width: 190,
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
      data={schedules}
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

export default TopupScheduleTableSection
