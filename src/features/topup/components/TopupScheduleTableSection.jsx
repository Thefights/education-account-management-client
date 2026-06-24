import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Space, Typography } from 'antd'

const formatAmount = (value) => formatCurrencyBasedOnCurrentLanguage(value) || '-'

const TopupScheduleTableSection = ({ schedules, loading, sort, setSort, onDetail }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'name',
      title: t('topup.topup_name'),
      width: 250,
      sortable: true,
      fixedColumn: true,
      render: (name, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Link onClick={() => onDetail?.(row)}>{name}</Typography.Link>
          <Typography.Text type="secondary">#{row.id}</Typography.Text>
        </Space>
      ),
    },
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
      key: 'nextExecutionAt',
      title: t('topup.next_execution'),
      width: 190,
      render: formatDateBasedOnCurrentLanguage,
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
      onRowClick={onDetail}
    />
  )
}

export default TopupScheduleTableSection
