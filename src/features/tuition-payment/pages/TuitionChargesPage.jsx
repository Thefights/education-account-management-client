import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { ExclamationCircleOutlined, WalletOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  Modal,
  Segmented,
  Skeleton,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TuitionFilterSection from '../components/TuitionFilterSection'
import TuitionObligationTimeline from '../components/TuitionObligationTimeline'
import '../styles/tuitionPayment.css'

const currentYear = new Date().getFullYear()
const defaultFilters = { Year: currentYear, Search: '', Statuses: [] }
const TuitionTab = { WithoutPlan: 'withoutPlan', WithPlan: 'withPlan' }
const statusPriority = { Overdue: 0, Due: 1, Paid: 2, Upcoming: 3 }
const obligationKey = (item) =>
  item.installmentId ? `installment:${item.installmentId}` : `charge:${item.chargeId}`

const TuitionChargesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [activeTab, setActiveTab] = useState(TuitionTab.WithoutPlan)
  const [selected, setSelected] = useState(new Map())
  const [debtWarning, setDebtWarning] = useState(null)
  const [showFutureMonths, setShowFutureMonths] = useState(false)
  const summary = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_SUMMARY)
  const queryParams = useMemo(
    () => ({
      Year: filters.Year,
      Search: filters.Search,
      ...(filters.Statuses?.length ? { Statuses: filters.Statuses } : {}),
    }),
    [filters]
  )
  const obligations = useFetch(
    ApiUrls.ACCOUNT_HOLDER.TUITION_OBLIGATIONS,
    queryParams,
    [queryParams]
  )

  const months = obligations.data?.months ?? []
  const currentMonth = new Date().getMonth() + 1
  const tabCounts = months.reduce(
    (counts, month) => {
      month.items.forEach((item) => {
        if (item.obligationType === 'Installment') counts.withPlan += 1
        else counts.withoutPlan += 1
      })
      return counts
    },
    { withoutPlan: 0, withPlan: 0 }
  )
  const visibleMonths = months
    .map((month) => {
      const items = month.items.filter((item) =>
        activeTab === TuitionTab.WithPlan
          ? item.obligationType === 'Installment'
          : item.obligationType === 'FullCharge'
      ).sort((left, right) =>
        (statusPriority[left.status] ?? 4) - (statusPriority[right.status] ?? 4) ||
        new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
      )
      return {
        ...month,
        items,
        totalAmount: items
          .filter((item) => item.status !== 'Paid')
          .reduce((total, item) => total + Number(item.amount), 0),
      }
    })
  const futureMonths = filters.Year === currentYear
    ? visibleMonths.filter((month) => month.month > currentMonth)
    : []
  const displayedMonths =
    filters.Year === currentYear && !showFutureMonths
      ? visibleMonths.filter((month) => month.month <= currentMonth)
      : visibleMonths
  const futureObligationCount = futureMonths.reduce(
    (total, month) => total + month.items.length,
    0
  )
  const selectedItems = [...selected.values()]
  const selectedKeys = new Set(selected.keys())
  const selectedAmount = selectedItems.reduce((total, item) => total + Number(item.amount), 0)
  const selectedFullCharges = selectedItems.filter((item) => item.obligationType === 'FullCharge')
  const canBulkCreatePlan =
    activeTab === TuitionTab.WithoutPlan &&
    selectedItems.length > 0 &&
    selectedFullCharges.length === selectedItems.length
  const outstandingAmount = Number(summary.data?.totalOutstandingAmount ?? 0)
  const availableBalance = Number(summary.data?.educationAccountBalance ?? 0)

  const commitSelection = (items) => {
    setSelected((current) => {
      const next = new Map(current)
      items.forEach((item) => next.set(obligationKey(item), item))
      return next
    })
  }

  const toggleObligation = (item, checked) => {
    const key = obligationKey(item)
    if (!checked) {
      setSelected((current) => {
        const next = new Map(current)
        next.delete(key)
        return next
      })
      return
    }
    if (item.installmentId && item.priorOverdueInstallments?.length > 0) {
      setDebtWarning({ selectedItems: [item], overdueItems: overdueAsObligations(item) })
      return
    }
    commitSelection([item])
  }

  const overdueAsObligations = (item) =>
    item.priorOverdueInstallments
      .filter((previous) => previous.isPayable)
      .map((previous) => ({
        ...item,
        obligationType: 'Installment',
        installmentId: previous.installmentId,
        installmentNumber: previous.installmentNumber,
        amount: previous.amount,
        dueDate: previous.dueDate,
        status: 'Overdue',
        isPayable: true,
        priorOverdueInstallments: [],
      }))

  const toggleMonth = (items, checked) => {
    const payableItems = items.filter((item) => item.isPayable)
    const payableKeys = new Set(payableItems.map(obligationKey))
    if (!checked) {
      const monthKeys = new Set(payableItems.map(obligationKey))
      setSelected((current) =>
        new Map([...current].filter(([key]) => !monthKeys.has(key)))
      )
      return
    }

    const overdueItems = payableItems
      .flatMap((item) => overdueAsObligations(item))
      .filter(
        (item, index, all) =>
          all.findIndex((candidate) => obligationKey(candidate) === obligationKey(item)) === index &&
          !payableKeys.has(obligationKey(item)) &&
          !selected.has(obligationKey(item))
      )
    if (overdueItems.length > 0) {
      setDebtWarning({ selectedItems: payableItems, overdueItems })
      return
    }
    commitSelection(payableItems)
  }

  const openCheckout = (items = selectedItems) => {
    if (items.length === 0) return
    const params = new URLSearchParams({ action: 'obligations', year: String(filters.Year) })
    const enrollmentIds = new Set()
    items.forEach((item) => {
      enrollmentIds.add(item.enrollmentId)
      if (item.installmentId) params.append('installmentIds', String(item.installmentId))
      else params.append('chargeIds', String(item.chargeId))
    })
    enrollmentIds.forEach((id) => params.append('enrollmentIds', String(id)))
    navigate(
      `${routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.CHECKOUT)}?${params}`
    )
  }

  const createPlan = (items = selectedFullCharges) => {
    if (items.length === 0) return
    const params = new URLSearchParams({ action: 'installment-plan' })
    items.forEach((item) => params.append('enrollmentIds', String(item.enrollmentId)))
    navigate(
      `${routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.CHECKOUT)}?${params}`
    )
  }

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters)
    setSelected(new Map())
    setShowFutureMonths(false)
  }

  return (
    <Flex vertical gap={18} className="tuition-page">
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('tuition-payment.title')}
      </Typography.Title>

      {summary.loading && !summary.data ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Flex gap={12} wrap="wrap" className="tuition-summary">
          <Card className="tuition-summary-card tuition-summary-card--owed">
            <Flex align="center" gap={14} className="tuition-summary-card__content">
              <Flex align="center" gap={10} className="tuition-summary-card__leading">
                <span className="tuition-summary-card__icon tuition-summary-card__icon--owed">
                  <ExclamationCircleOutlined />
                </span>
                <span className="tuition-summary-card__chip">
                  {t('tuition-payment.hero.action_needed')}
                </span>
              </Flex>
              <Flex vertical gap={4} className="tuition-summary-card__main">
                <Typography.Text className="tuition-summary-card__label">
                  {t('tuition-payment.hero.amount_you_owe')}
                </Typography.Text>
                <Typography.Title level={1} className="tuition-summary-card__amount">
                  {formatCurrencyBasedOnCurrentLanguage(outstandingAmount)}
                </Typography.Title>
                <Typography.Text className="tuition-summary-card__helper">
                  {t('tuition-payment.hero.invoice_attention', {
                    count: summary.data?.pendingPaymentInvoicesCount ?? 0,
                  })}
                </Typography.Text>
              </Flex>
            </Flex>
          </Card>
          <Card className="tuition-summary-card tuition-summary-card--balance">
            <Flex align="center" gap={14} className="tuition-summary-card__content">
              <span className="tuition-summary-card__icon tuition-summary-card__icon--balance">
                <WalletOutlined />
              </span>
              <Flex vertical gap={4} className="tuition-summary-card__main">
                <Typography.Text className="tuition-summary-card__label">
                  {t('tuition-payment.hero.account_balance')}
                </Typography.Text>
                <Typography.Title level={1} className="tuition-summary-card__amount">
                  {formatCurrencyBasedOnCurrentLanguage(availableBalance)}
                </Typography.Title>
                <Typography.Text className="tuition-summary-card__helper">
                  {t('tuition-payment.hero.available_in_account')}
                </Typography.Text>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      )}

      <TuitionFilterSection
        filters={filters}
        loading={obligations.loading}
        onFilter={applyFilters}
        onReset={() => applyFilters(defaultFilters)}
      />

      <Segmented
        block
        size="large"
        value={activeTab}
        options={[
          {
            value: TuitionTab.WithoutPlan,
            label: t('tuition-payment.tabs.without_plan_count', {
              count: tabCounts.withoutPlan,
            }),
          },
          {
            value: TuitionTab.WithPlan,
            label: t('tuition-payment.tabs.with_plan_count', { count: tabCounts.withPlan }),
          },
        ]}
        onChange={(value) => {
          setActiveTab(value)
          setSelected(new Map())
        }}
      />

      {obligations.loading && !obligations.data ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <TuitionObligationTimeline
          key={`${filters.Year}:${activeTab}`}
          months={displayedMonths}
          year={filters.Year}
          selectedKeys={selectedKeys}
          onToggle={toggleObligation}
          onToggleMonth={toggleMonth}
        />
      )}

      {filters.Year === currentYear && futureMonths.length > 0 && !showFutureMonths && (
        <button
          type="button"
          className="tuition-future-months-toggle"
          onClick={() => setShowFutureMonths(true)}
        >
          <Typography.Text strong>
            {t('tuition-payment.timeline.show_future_months', {
              count: futureMonths.length,
            })}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('tuition-payment.timeline.future_months_hint', {
              count: futureObligationCount,
            })}
          </Typography.Text>
        </button>
      )}

      {filters.Year === currentYear && showFutureMonths && futureMonths.length > 0 && (
        <Button
          className="tuition-future-months-collapse"
          onClick={() => setShowFutureMonths(false)}
        >
          {t('tuition-payment.timeline.hide_future_months')}
        </Button>
      )}

      {selectedItems.length > 0 && (
        <div className="tuition-selection-bar">
          <Flex align="center" gap={24}>
            <Typography.Text strong>
              {t('tuition-payment.selected', { count: selectedItems.length })}
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrencyBasedOnCurrentLanguage(selectedAmount)}
            </Typography.Title>
          </Flex>
          <Flex gap={10}>
            <Button
              className="tuition-selection-bar__button tuition-selection-bar__button--clear"
              onClick={() => setSelected(new Map())}
            >
              {t('tuition-payment.action.clear_selection')}
            </Button>
            {canBulkCreatePlan && (
              <Button
                className="tuition-selection-bar__button tuition-selection-bar__button--plan"
                onClick={() => createPlan()}
              >
                {t('tuition-payment.action.create_plan')}
              </Button>
            )}
            <Button
              type="primary"
              className="tuition-selection-bar__button tuition-selection-bar__button--pay"
              onClick={() => openCheckout()}
            >
              {canBulkCreatePlan
                ? t('tuition-payment.action.pay_full')
                : t('tuition-payment.timeline.pay_selected')}
            </Button>
          </Flex>
        </div>
      )}

      <Modal
        open={Boolean(debtWarning)}
        closable={false}
        maskClosable={false}
        keyboard={false}
        title={t('tuition-payment.timeline.debt_warning_title')}
        okText={t('tuition-payment.timeline.add_overdue')}
        cancelText={t('tuition-payment.timeline.continue_current')}
        onOk={() => {
          commitSelection([...debtWarning.overdueItems, ...debtWarning.selectedItems])
          setDebtWarning(null)
        }}
        onCancel={() => {
          commitSelection(debtWarning.selectedItems)
          setDebtWarning(null)
        }}
      >
        <Typography.Paragraph>
          {t('tuition-payment.timeline.debt_warning_description')}
        </Typography.Paragraph>
        <Flex vertical gap={8}>
          {debtWarning?.overdueItems?.map((item) => (
            <Flex key={item.installmentId} justify="space-between">
              <Typography.Text>
                {t('tuition-payment.timeline.installment_number', {
                  number: item.installmentNumber,
                })}{' '}
                · {new Date(item.dueDate).toLocaleDateString()}
              </Typography.Text>
              <Typography.Text strong>
                {formatCurrencyBasedOnCurrentLanguage(item.amount)}
              </Typography.Text>
            </Flex>
          ))}
        </Flex>
      </Modal>
    </Flex>
  )
}

export default TuitionChargesPage
