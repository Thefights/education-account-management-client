import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupTargetStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { useMemo } from 'react'

const TopupHistoryDetailTableSection = ({ targets, loading, sort, setSort }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = useMemo(
    () => [
      { key: 'accountNumber', title: t('topup.account_number'), sortable: true },
      { key: 'accountName', title: t('topup.account_name'), sortable: true },
      { key: 'transactionCode', title: t('topup.transaction_code'), sortable: true },
      { key: 'failureReason', title: t('topup.failure_reason'), sortable: true },
      {
        key: 'status',
        title: t('topup.status'),
        sortable: true,
        type: 'tag',
        options: _enum.topupTargetStatusOptions,
        color: defaultTopupTargetStatusStyle,
      },
      {
        key: 'amount',
        title: t('topup.amount'),
        sortable: true,
        isNumeric: true,
        render: formatCurrencyBasedOnCurrentLanguage,
      },
      {
        key: 'createdAt',
        title: t('topup.created_at'),
        sortable: true,
        render: (value) =>
          formatDatetimeStringBasedOnCurrentLanguage(value) || renderEmptyFallback(null),
      },
    ],
    [_enum, t]
  )

  return (
    <GenericTable
      data={targets}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
    />
  )
}

export default TopupHistoryDetailTableSection
