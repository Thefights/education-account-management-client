import GenericTable from '@/shared/components/tables/GenericTable'
import {
  defaultTopupExecutionSourceStyle,
  defaultTopupExecutionStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { useMemo } from 'react'

const TopupHistoryTableSection = ({ history, loading, sort, setSort, onDetail }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = useMemo(
    () => [
      {
        key: 'executionCode',
        title: t('topup.execution_code'),
        width: 190,
        sortable: true,
        fixedColumn: true,
      },
      { key: 'topupNameSnapshot', title: t('topup.topup_name'), width: 220, sortable: true },
      {
        key: 'sourceType',
        title: t('topup.source'),
        width: 120,
        sortable: true,
        type: 'tag',
        options: _enum.topupExecutionSourceTypeOptions,
        color: defaultTopupExecutionSourceStyle,
      },
      {
        key: 'status',
        title: t('topup.status'),
        width: 120,
        sortable: true,
        type: 'tag',
        options: _enum.topupExecutionStatusOptions,
        color: defaultTopupExecutionStatusStyle,
      },
      {
        key: 'totalTargetCount',
        title: t('topup.total_targets'),
        width: 130,
        sortable: true,
        isNumeric: true,
      },
      {
        key: 'successCount',
        title: t('topup.succeeded'),
        width: 120,
        sortable: true,
        isNumeric: true,
      },
      {
        key: 'failedCount',
        title: t('topup.failed'),
        width: 110,
        sortable: true,
        isNumeric: true,
      },
      {
        key: 'totalExecutedAmount',
        title: t('topup.amount'),
        width: 150,
        sortable: true,
        isNumeric: true,
        render: formatCurrencyBasedOnCurrentLanguage,
      },
      {
        key: 'createdAt',
        title: t('topup.created_at'),
        width: 190,
        sortable: true,
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [_enum, t]
  )

  return (
    <GenericTable
      data={history}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
      onRowClick={onDetail}
    />
  )
}

export default TopupHistoryTableSection
