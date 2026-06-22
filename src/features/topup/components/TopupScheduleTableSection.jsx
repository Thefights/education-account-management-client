import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'

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
    { key: 'topupRule.ruleName', title: t('topup.rule_name'), width: 220 },
    {
      key: 'frequency',
      title: t('topup.schedule_type'),
      width: 140,
      sortable: true,
      options: _enum.topupScheduleTypeOptions,
    },
    {
      key: 'status',
      title: t('topup.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.topupScheduleStatusOptions,
      color: defaultTopupStatusStyle,
    },
    { key: 'executionTime', title: t('topup_form.execution_time'), width: 150 },
    { key: 'nextExecutionAt', title: t('topup.next_execution'), width: 190 },
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
