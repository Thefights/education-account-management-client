import { ApiUrls } from '@/shared/api/apiUrls'
import BulkActionBar from '@/shared/components/generals/BulkActionBar'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { WalletOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Modal, Progress, Segmented, Skeleton, Statistic, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TuitionChargeList from '../components/TuitionChargeList'
import TuitionFilterSection from '../components/TuitionFilterSection'

const defaultFilters = {
  Search: '',
  Statuses: [],
  Sort: 'createdAt desc',
}
const TuitionChargeTab = {
  WithoutPlan: 'withoutPlan',
  WithPlan: 'withPlan',
}
const PaymentAction = {
  Full: 'full',
  InstallmentPlan: 'installment-plan',
  Next: 'next',
  Remaining: 'remaining',
}

const TuitionChargesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TuitionChargeTab.WithoutPlan)
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedCharges, setSelectedCharges] = useState([])
  const summary = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_SUMMARY)

  const queryParams = useMemo(
    () => ({
      Search: filters.Search,
      IsInstallment: activeTab === TuitionChargeTab.WithPlan,
      Sort: filters.Sort,
      Page: page,
      PageSize: pageSize,
      ...(filters.Statuses?.length ? { Statuses: filters.Statuses } : {}),
    }),
    [activeTab, filters.Search, filters.Sort, filters.Statuses, page, pageSize]
  )
  const charges = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES, queryParams, [queryParams])
  const noPlanCountParams = useMemo(
    () => ({
      Search: filters.Search,
      IsInstallment: false,
      Sort: filters.Sort,
      Page: 1,
      PageSize: 1,
      ...(filters.Statuses?.length ? { Statuses: filters.Statuses } : {}),
    }),
    [filters.Search, filters.Sort, filters.Statuses]
  )
  const withPlanCountParams = useMemo(
    () => ({
      Search: filters.Search,
      IsInstallment: true,
      Sort: filters.Sort,
      Page: 1,
      PageSize: 1,
      ...(filters.Statuses?.length ? { Statuses: filters.Statuses } : {}),
    }),
    [filters.Search, filters.Sort, filters.Statuses]
  )
  const noPlanCount = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES, noPlanCountParams, [
    noPlanCountParams,
  ])
  const withPlanCount = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES, withPlanCountParams, [
    withPlanCountParams,
  ])

  const resetSelection = () => setSelectedCharges([])
  const applyFilters = (nextFilters) => {
    setFilters(nextFilters)
    setPage(1)
    resetSelection()
  }
  const changeTab = (key) => {
    setActiveTab(key)
    setPage(1)
    resetSelection()
  }

  const openCheckout = (action) => {
    if (selectedCharges.length === 0) return
    const params = new URLSearchParams({ action })
    selectedCharges.forEach((charge) => params.append('enrollmentIds', String(charge.enrollmentId)))
    navigate(
      `${routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.CHECKOUT)}?${params.toString()}`
    )
  }

  const openInstallmentCheckout = (action) => {
    const hasOverdueInstallment = selectedCharges.some((charge) =>
      charge.installments.some(
        (installment) => installment.status === EnumConfig.ChargeStatus.Overdue
      )
    )
    if (!hasOverdueInstallment) {
      openCheckout(action)
      return
    }
    Modal.confirm({
      title: t('tuition-payment.overdue.title'),
      content: t('tuition-payment.overdue.description'),
      okText: t('tuition-payment.overdue.continue'),
      cancelText: t('general.cancel'),
      onOk: () => openCheckout(action),
    })
  }

  const selectedCount = selectedCharges.length
  const data = summary.data
  const currentPagePayableCharges = (charges.data?.collection ?? []).filter(
    (charge) =>
      Boolean(charge.chargeId) &&
      charge.status !== EnumConfig.ChargeStatus.Paid &&
      charge.remainingAmount > 0
  )
  const outstandingAmount = Number(data?.totalOutstandingAmount ?? 0)
  const availableBalance = Number(data?.educationAccountBalance ?? 0)
  const coveragePercent = outstandingAmount
    ? Math.min(Math.round((availableBalance / outstandingAmount) * 100), 100)
    : 0
  const handleHeroPayNow = () => {
    if (selectedCount > 0) {
      if (activeTab === TuitionChargeTab.WithoutPlan) {
        openCheckout(PaymentAction.Full)
        return
      }
      openInstallmentCheckout(PaymentAction.Next)
      return
    }
    setSelectedCharges(currentPagePayableCharges)
  }
  const bulkActions =
    activeTab === TuitionChargeTab.WithoutPlan
      ? [
          {
            key: PaymentAction.InstallmentPlan,
            label: t('tuition-payment.action.create_plan'),
            onClick: () => openCheckout(PaymentAction.InstallmentPlan),
          },
          {
            key: PaymentAction.Full,
            label: t('tuition-payment.action.pay_full'),
            type: 'primary',
            onClick: () => openCheckout(PaymentAction.Full),
          },
        ]
      : [
          {
            key: PaymentAction.Remaining,
            label: t('tuition-payment.action.pay_remaining'),
            onClick: () => openInstallmentCheckout(PaymentAction.Remaining),
          },
          {
            key: PaymentAction.Next,
            label: t('tuition-payment.action.pay_next'),
            type: 'primary',
            onClick: () => openInstallmentCheckout(PaymentAction.Next),
          },
        ]

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('tuition-payment.title')}
      </Typography.Title>

      {summary.loading && !data ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Flex gap={12} wrap="wrap">
          <Card style={{ flex: '2 1 420px' }}>
            <Flex vertical gap={16}>
              <Flex justify="space-between" align="start" gap={16} wrap="wrap">
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary">
                    {t('tuition-payment.hero.outstanding')}
                  </Typography.Text>
                  <Typography.Title level={1} style={{ margin: 0 }}>
                    {formatCurrencyBasedOnCurrentLanguage(outstandingAmount)}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {t('tuition-payment.hero.invoice_attention', {
                      count: data?.pendingPaymentInvoicesCount ?? 0,
                    })}
                  </Typography.Text>
                </Flex>
                <Button
                  type="primary"
                  size="large"
                  disabled={currentPagePayableCharges.length === 0}
                  onClick={handleHeroPayNow}
                >
                  {t('tuition-payment.hero.pay_now')}
                </Button>
              </Flex>
              <Progress
                percent={coveragePercent}
                showInfo={false}
                strokeColor="var(--app-secondary)"
              />
            </Flex>
          </Card>
          <Card style={{ flex: '1 1 300px' }}>
            <Statistic
              prefix={<WalletOutlined />}
              title={t('tuition-payment.education_account_balance')}
              value={availableBalance}
              formatter={(value) => formatCurrencyBasedOnCurrentLanguage(value)}
            />
            <Typography.Text type="secondary">
              {t('tuition-payment.hero.balance_coverage', { percent: coveragePercent })}
            </Typography.Text>
          </Card>
        </Flex>
      )}

      <Flex vertical gap={16}>
        <Segmented
          block
          size="large"
          value={activeTab}
          onChange={changeTab}
          options={[
            {
              value: TuitionChargeTab.WithoutPlan,
              label: t('tuition-payment.tabs.without_plan_count', {
                count: noPlanCount.data?.totalCount ?? 0,
              }),
            },
            {
              value: TuitionChargeTab.WithPlan,
              label: t('tuition-payment.tabs.with_plan_count', {
                count: withPlanCount.data?.totalCount ?? 0,
              }),
            },
          ]}
        />
        <TuitionFilterSection
          filters={filters}
          loading={charges.loading}
          onFilter={applyFilters}
          onReset={() => applyFilters(defaultFilters)}
        />

        <TuitionChargeList
          charges={charges.data?.collection ?? []}
          loading={charges.loading}
          selectedCharges={selectedCharges}
          onSelectionChange={setSelectedCharges}
          showInstallments={activeTab === TuitionChargeTab.WithPlan}
        />
        <GenericTablePagination
          totalCount={charges.data?.totalCount}
          totalPage={charges.data?.totalPage}
          page={page}
          setPage={(nextPage) => {
            setPage(nextPage)
            resetSelection()
          }}
          pageSize={pageSize}
          setPageSize={(nextPageSize) => {
            setPageSize(nextPageSize)
            resetSelection()
          }}
          loading={charges.loading}
        />
        <BulkActionBar
          selectedCount={selectedCount}
          actions={bulkActions}
          loading={charges.loading}
          onClear={resetSelection}
        />
      </Flex>
    </Flex>
  )
}

export default TuitionChargesPage
