import GenericTable from '@/shared/components/tables/GenericTable'
import { routeUrls } from '@/shared/config/routeUrls'
import {
  defaultTopupExecutionSourceStyle,
  defaultTopupExecutionStatusStyle,
} from '@/shared/config/theme/defaultStylesConfig'
import useEnum from '@/shared/hooks/useEnum'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Button } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const formatAmount = (value) =>
  value == null ? '-' : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })

const TopupHistoryTableSection = ({ history, loading, sort, setSort }) => {
  const { t } = useTranslation()
  const _enum = useEnum()
  const navigate = useNavigate()

  const fields = useMemo(
    () => [
      { key: 'executionCode', title: t('topup.execution_code'), width: 190, sortable: true },
      {
        key: 'sourceType',
        title: t('topup.source'),
        width: 120,
        type: 'tag',
        options: _enum.topupExecutionSourceTypeOptions,
        color: defaultTopupExecutionSourceStyle,
      },
      { key: 'topupNameSnapshot', title: t('topup.topup_name'), width: 200 },
      {
        key: 'status',
        title: t('topup.status'),
        width: 120,
        type: 'tag',
        options: _enum.topupExecutionStatusOptions,
        color: defaultTopupExecutionStatusStyle,
      },
      { key: 'totalTargetCount', title: t('topup.total_targets'), width: 120, isNumeric: true },
      { key: 'successCount', title: t('topup.succeeded'), width: 110, isNumeric: true },
      { key: 'failedCount', title: t('topup.failed'), width: 100, isNumeric: true },
      {
        key: 'totalExecutedAmount',
        title: t('topup.amount'),
        width: 140,
        isNumeric: true,
        render: formatAmount,
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
        width: 80,
        render: (_, row) => (
          <Button
            type="link"
            onClick={() =>
              navigate(
                routeUrls.BASE_ROUTE.FINANCE_ADMIN(
                  routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(row.id)
                )
              )
            }
          >
            {t('button.view')}
          </Button>
        ),
      },
    ],
    [_enum, navigate, t]
  )

  return (
    <GenericTable
      data={history}
      fields={fields}
      rowKey="id"
      loading={loading}
      sort={sort}
      setSort={setSort}
    />
  )
}

export default TopupHistoryTableSection
