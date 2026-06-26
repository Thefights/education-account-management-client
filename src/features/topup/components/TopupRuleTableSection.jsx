import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Space, Typography } from 'antd'

const formatAmount = (value) => formatCurrencyBasedOnCurrentLanguage(value) || '-'

const TopupRuleTableSection = ({ rules, loading, sort, setSort, onDetail }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const fields = [
    {
      key: 'name',
      title: t('topup.topup_name'),
      width: 280,
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
      width: 140,
      isNumeric: true,
      sortable: true,
      render: formatAmount,
    },
    {
      key: 'status',
      title: t('topup.status'),
      width: 120,
      sortable: true,
      type: 'tag',
      options: _enum.systemTopupStatusOptions,
      color: defaultTopupStatusStyle,
    },
    {
      key: 'createdAt',
      title: t('topup.created_at'),
      width: 190,
      sortable: true,
      render: formatDatetimeStringBasedOnCurrentLanguage,
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
      onRowClick={onDetail}
    />
  )
}

export default TopupRuleTableSection
