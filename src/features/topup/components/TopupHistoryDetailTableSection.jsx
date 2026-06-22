import GenericTable from '@/shared/components/tables/GenericTable'
import { defaultTopupTargetStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { useMemo } from 'react'

const formatAmount = (value) =>
  value == null ? '-' : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })

const TopupHistoryDetailTableSection = ({ targets, loading, sort, setSort }) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const fields = useMemo(
    () => [
      { key: 'accountNumber', title: t('topup.account_number'), sortable: true },
      { key: 'accountName', title: t('topup.account_name') },
      {
        key: 'amount',
        title: t('topup.amount'),
        sortable: true,
        isNumeric: true,
        render: formatAmount,
      },
      {
        key: 'status',
        title: t('topup.status'),
        type: 'tag',
        options: _enum.topupTargetStatusOptions,
        color: defaultTopupTargetStatusStyle,
      },
      { key: 'failureReason', title: t('topup.failure_reason') },
      { key: 'transactionCode', title: t('topup.transaction_code') },
      {
        key: 'createdAt',
        title: t('topup.created_at'),
        sortable: true,
        render: formatDateBasedOnCurrentLanguage,
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
