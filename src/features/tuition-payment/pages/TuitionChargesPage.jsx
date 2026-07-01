import { ApiUrls } from '@/shared/api/apiUrls'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { BankOutlined, WalletOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Modal, Skeleton, Statistic, Tabs, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TuitionChargeList from '../components/TuitionChargeList'
import TuitionFilterSection from '../components/TuitionFilterSection'

const defaultFilters = {
  Search: '',
  Status: EnumConfig.StudentTuitionFilterStatus.All,
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
      Status: filters.Status,
      IsInstallment: activeTab === TuitionChargeTab.WithPlan,
      Sort: filters.Sort,
      Page: page,
      PageSize: pageSize,
    }),
    [activeTab, filters.Search, filters.Sort, filters.Status, page, pageSize]
  )
  const charges = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES, queryParams, [queryParams])

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

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('tuition-payment.title')}
      </Typography.Title>

      {summary.loading && !data ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Flex gap={12} wrap="wrap">
          <Card style={{ flex: '1 1 260px' }}>
            <Statistic
              prefix={<BankOutlined />}
              title={t('tuition-payment.total_outstanding')}
              value={data?.totalOutstandingAmount ?? 0}
              precision={2}
            />
            <Typography.Text type="secondary">
              {data?.pendingPaymentInvoicesCount ?? 0}{' '}
              {t('tuition-payment.pending_payment_invoices')}
            </Typography.Text>
          </Card>
          <Card style={{ flex: '1 1 260px' }}>
            <Statistic
              prefix={<WalletOutlined />}
              title={t('tuition-payment.education_account_balance')}
              value={data?.educationAccountBalance ?? 0}
              precision={2}
            />
          </Card>
        </Flex>
      )}

      <Card>
        <Flex vertical gap={16}>
          <Tabs
            activeKey={activeTab}
            onChange={changeTab}
            items={[
              { key: TuitionChargeTab.WithoutPlan, label: t('tuition-payment.tabs.without_plan') },
              { key: TuitionChargeTab.WithPlan, label: t('tuition-payment.tabs.with_plan') },
            ]}
          />
          <TuitionFilterSection
            filters={filters}
            loading={charges.loading}
            onFilter={applyFilters}
            onReset={() => applyFilters(defaultFilters)}
          />

          <Flex justify="space-between" align="center" gap={12} wrap="wrap">
            <Typography.Text type="secondary">
              {t('tuition-payment.selected', { count: selectedCount })}
            </Typography.Text>
            {activeTab === TuitionChargeTab.WithoutPlan ? (
              <Flex gap={8} wrap="wrap">
                <Button
                  disabled={!selectedCount}
                  onClick={() => openCheckout(PaymentAction.InstallmentPlan)}
                >
                  {t('tuition-payment.action.create_plan')}
                </Button>
                <Button
                  type="primary"
                  disabled={!selectedCount}
                  onClick={() => openCheckout(PaymentAction.Full)}
                >
                  {t('tuition-payment.action.pay_full')}
                </Button>
              </Flex>
            ) : (
              <Flex gap={8} wrap="wrap">
                <Button
                  disabled={!selectedCount}
                  onClick={() => openInstallmentCheckout(PaymentAction.Remaining)}
                >
                  {t('tuition-payment.action.pay_remaining')}
                </Button>
                <Button
                  type="primary"
                  disabled={!selectedCount}
                  onClick={() => openInstallmentCheckout(PaymentAction.Next)}
                >
                  {t('tuition-payment.action.pay_next')}
                </Button>
              </Flex>
            )}
          </Flex>

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
        </Flex>
      </Card>
    </Flex>
  )
}

export default TuitionChargesPage
