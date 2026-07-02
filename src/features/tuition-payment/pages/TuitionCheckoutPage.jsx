import { ApiUrls } from '@/shared/api/apiUrls'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultChargeStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { selectInputNumberTextOnFocus } from '@/shared/utils/inputNumberFocusUtil'
import { showErrorToast, showSuccessToast } from '@/shared/utils/toastUtil'
import { ArrowLeftOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Flex,
  InputNumber,
  Result,
  Skeleton,
  Steps,
  Tag,
  Typography,
} from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ObligationCheckoutPage from './ObligationCheckoutPage'
import {
  compareInstallmentDueDateThenNumber,
  getTuitionStatusLabel,
  isInstallmentDueForPayment,
} from '../utils/chargeStatusSort'

const PaymentAction = {
  Full: 'full',
  InstallmentPlan: 'installment-plan',
  Due: 'due',
  Remaining: 'remaining',
}

const paymentEndpoints = {
  [PaymentAction.Full]: ApiUrls.PAYMENT.FULL,
  [PaymentAction.InstallmentPlan]: ApiUrls.PAYMENT.INSTALLMENT_PLAN,
  [PaymentAction.Due]: ApiUrls.PAYMENT.INSTALLMENTS_DUE,
  [PaymentAction.Remaining]: ApiUrls.PAYMENT.INSTALLMENTS_REMAINING,
}

const PaymentSessionStatus = {
  Succeeded: 'Succeeded',
}

const getPaymentFlowSteps = (t) => [
  { title: t('tuition-payment.flow.charges') },
  { title: t('tuition-payment.flow.summary') },
  { title: t('tuition-payment.flow.payment') },
  { title: t('tuition-payment.flow.completed') },
]

const getUnpaidInstallments = (charge) =>
  charge.installments
    .filter((installment) => installment.status !== EnumConfig.ChargeStatus.Paid)
    .sort(compareInstallmentDueDateThenNumber)

const getDueInstallments = (charge) =>
  charge.installments.filter(isInstallmentDueForPayment).sort(compareInstallmentDueDateThenNumber)

const getPaymentTargetText = (charge, action, installmentCounts, t) => {
  const unpaidInstallments = getUnpaidInstallments(charge)
  if (action === PaymentAction.Full) return t('tuition-payment.checkout.target_full_charge')
  if (action === PaymentAction.InstallmentPlan) {
    return t('tuition-payment.checkout.target_first_installment')
  }
  if (action === PaymentAction.Due) {
    const dueInstallments = getDueInstallments(charge).slice(0, installmentCounts[charge.chargeId])
    const firstInstallment = dueInstallments[0]
    const lastInstallment = dueInstallments[dueInstallments.length - 1]
    return firstInstallment
      ? t(
          dueInstallments.length === 1
            ? 'tuition-payment.checkout.target_due_installment'
            : 'tuition-payment.checkout.target_due_installments',
          {
            first: firstInstallment.installmentNumber,
            last: lastInstallment.installmentNumber,
            count: dueInstallments.length,
          }
        )
      : t('tuition-payment.charge.completed')
  }
  return t('tuition-payment.checkout.target_remaining_installments', {
    count: unpaidInstallments.length,
  })
}

const getInstallmentPlanAmount = (charge, months) =>
  Math.round((Number(charge.remainingAmount) / months) * 100) / 100

const LegacyTuitionCheckoutPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { paymentPlanOptions } = useEnum()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action')
  const enrollmentIds = useMemo(
    () =>
      searchParams
        .getAll('enrollmentIds')
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    [searchParams]
  )
  const endpoint = paymentEndpoints[action]
  const targetsExistingPlan = action === PaymentAction.Due || action === PaymentAction.Remaining
  const installmentCounts = useMemo(() => {
    const counts = {}
    searchParams.forEach((value, key) => {
      if (!key.startsWith('installmentCount.')) return
      const chargeId = Number(key.slice('installmentCount.'.length))
      const count = Number(value)
      if (Number.isInteger(chargeId) && chargeId > 0 && Number.isInteger(count) && count > 0) {
        counts[chargeId] = count
      }
    })
    return counts
  }, [searchParams])
  const [paymentPlanMonths, setPaymentPlanMonths] = useState({})
  const [creditBalanceApplied, setCreditBalanceApplied] = useState(null)
  const [completedPayment, setCompletedPayment] = useState(null)

  const chargeQuery = useMemo(
    () => ({
      EnrollmentIds: enrollmentIds,
      IsInstallment: targetsExistingPlan,
      Sort: 'createdAt desc',
      Page: 1,
      PageSize: 100,
    }),
    [enrollmentIds, targetsExistingPlan]
  )
  const charges = useFetch(
    endpoint && enrollmentIds.length ? ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES : '',
    chargeQuery,
    [chargeQuery]
  )
  const summary = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_SUMMARY)
  const payment = useAxiosSubmit({ url: endpoint ?? '', method: 'POST' })
  const planOptions = paymentPlanOptions.filter((opt) => opt.value !== 1)

  const selectedCharges = charges.data?.collection ?? []
  const hasAllRequestedCharges = selectedCharges.length === new Set(enrollmentIds).size
  const hasInvalidCharge = selectedCharges.some((charge) => {
    if (
      !charge.chargeId ||
      charge.status === EnumConfig.ChargeStatus.Paid ||
      charge.remainingAmount <= 0
    )
      return true
    if (!targetsExistingPlan) return charge.installments.length > 0
    if (charge.installments.length === 0) return true
    if (action !== PaymentAction.Due) return false
    const installmentCount = installmentCounts[charge.chargeId]
    return !installmentCount || installmentCount > getDueInstallments(charge).length
  })

  const amountForCharge = useCallback(
    (charge) => {
      if (action === PaymentAction.Full) return Number(charge.remainingAmount)
      if (action === PaymentAction.InstallmentPlan) {
        const months = paymentPlanMonths[charge.chargeId] ?? 3
        return getInstallmentPlanAmount(charge, months)
      }
      const unpaidInstallments = getUnpaidInstallments(charge)
      if (action === PaymentAction.Due) {
        return getDueInstallments(charge)
          .slice(0, installmentCounts[charge.chargeId])
          .reduce((total, installment) => total + Number(installment.amount), 0)
      }
      return unpaidInstallments.reduce(
        (total, installment) => total + Number(installment.amount),
        0
      )
    },
    [action, installmentCounts, paymentPlanMonths]
  )

  const totalDueToday = selectedCharges.reduce(
    (total, charge) => total + amountForCharge(charge),
    0
  )
  const availableBalance = Number(summary.data?.educationAccountBalance ?? 0)
  const maxCreditBalance = Math.min(availableBalance, totalDueToday)
  const appliedCreditBalance = Math.min(Number(creditBalanceApplied ?? 0), maxCreditBalance)
  const onlineAmount = Math.max(totalDueToday - appliedCreditBalance, 0)

  const requestInvalid = !hasAllRequestedCharges || hasInvalidCharge
  const tuitionListRoute = routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX)

  const chargeTableFields = useMemo(
    () => [
      { key: 'courseName', title: t('tuition-payment.charge.course') },
      { key: 'courseCode', title: t('tuition-payment.charge.course_code') },
      {
        key: 'paymentDueDate',
        title: t('tuition-payment.charge.due_date'),
        render: (value) => formatDateBasedOnCurrentLanguage(value),
      },
      {
        key: 'status',
        title: t('tuition-payment.installments.status'),
        render: (value) => (
          <Tag color={defaultChargeStatusStyle(value)}>{getTuitionStatusLabel(value, t)}</Tag>
        ),
      },
      {
        key: 'paymentTarget',
        title: t('tuition-payment.checkout.payment_target'),
        render: (_, charge) => getPaymentTargetText(charge, action, installmentCounts, t),
      },
      {
        key: 'remainingAmount',
        title: t('tuition-payment.charge.remaining_amount'),
        render: (value) => formatCurrencyBasedOnCurrentLanguage(value),
      },
      {
        key: 'enrollmentId',
        title: t('tuition-payment.checkout.due_today'),
        render: (_, charge) => formatCurrencyBasedOnCurrentLanguage(amountForCharge(charge)),
      },
    ],
    [action, amountForCharge, installmentCounts, t]
  )

  const renderPlanSelector = (charge) => {
    const selectedMonth = paymentPlanMonths[charge.chargeId] ?? 3
    return (
      <Card key={charge.enrollmentId} size="small">
        <Flex vertical gap={14}>
          <Flex justify="space-between" align="start" gap={12} wrap="wrap">
            <Flex vertical gap={2}>
              <Typography.Text strong>{charge.courseName}</Typography.Text>
              <Typography.Text type="secondary">{charge.courseCode}</Typography.Text>
            </Flex>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(charge.remainingAmount)}
            </Typography.Text>
          </Flex>
          <Flex gap={8} wrap="wrap">
            {planOptions.map((option) => {
              const selected = option.value === selectedMonth
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`tuition-plan-option${
                    selected ? ' tuition-plan-option--selected' : ''
                  }`}
                  aria-pressed={selected}
                  onClick={() =>
                    setPaymentPlanMonths((current) => ({
                      ...current,
                      [charge.chargeId]: option.value,
                    }))
                  }
                >
                  <Flex vertical gap={4} align="center">
                    <Typography.Text className="tuition-plan-option__label">
                      {option.label}
                    </Typography.Text>
                    <Typography.Text className="tuition-plan-option__amount">
                      {t('tuition-payment.checkout.per_month', {
                        amount: formatCurrencyBasedOnCurrentLanguage(
                          getInstallmentPlanAmount(charge, option.value)
                        ),
                      })}
                    </Typography.Text>
                  </Flex>
                </button>
              )
            })}
          </Flex>
        </Flex>
      </Card>
    )
  }

  const handleSubmit = async () => {
    if (!hasAllRequestedCharges || hasInvalidCharge || totalDueToday <= 0) return

    let request
    if (action === PaymentAction.InstallmentPlan) {
      request = {
        Items: selectedCharges.map((charge) => ({
          ChargeId: charge.chargeId,
          PaymentPlanMonths: paymentPlanMonths[charge.chargeId] ?? 3,
        })),
        CreditBalanceApplied: appliedCreditBalance,
      }
    } else if (action === PaymentAction.Due) {
      request = {
        Items: selectedCharges.map((charge) => ({
          ChargeId: charge.chargeId,
          InstallmentCount: installmentCounts[charge.chargeId],
        })),
        CreditBalanceApplied: appliedCreditBalance,
      }
    } else {
      request = {
        ChargeIds: selectedCharges.map((charge) => charge.chargeId),
        CreditBalanceApplied: appliedCreditBalance,
      }
    }

    const response = await payment.submit({ overrideData: request })
    const result = response?.data
    if (!result) return

    if (result.requiresRedirect) {
      if (!result.link) {
        showErrorToast(t('tuition-payment.checkout.missing_redirect'))
        return
      }
      window.location.assign(result.link)
      return
    }

    if (result.status === PaymentSessionStatus.Succeeded) {
      setCompletedPayment(result)
      showSuccessToast(t('tuition-payment.callback.succeeded'))
      await Promise.all([summary.fetch(), charges.fetch()])
      return
    }

    showErrorToast(t('tuition-payment.checkout.unexpected_status', { status: result.status }))
  }

  if (!endpoint || enrollmentIds.length === 0) {
    return <Empty description={t('tuition-payment.checkout.invalid_request')} />
  }

  if (completedPayment) {
    return (
      <Flex vertical gap={18} style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
        <Steps size="small" current={3} items={getPaymentFlowSteps(t)} />
        <Card>
          <Result
            status="success"
            title={t('tuition-payment.callback.success_title')}
            subTitle={t('tuition-payment.checkout.completed_description')}
            extra={[
              <Button
                key="back"
                type="primary"
                onClick={() => navigate(tuitionListRoute, { replace: true })}
              >
                {t('tuition-payment.action.back_to_charges')}
              </Button>,
            ]}
          />
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label={t('tuition-payment.checkout.payment_mode')}>
              {completedPayment.paymentMode}
            </Descriptions.Item>
            <Descriptions.Item label={t('tuition-payment.checkout.total_amount')}>
              <Typography.Text strong>
                {formatCurrencyBasedOnCurrentLanguage(completedPayment.totalAmount)}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('tuition-payment.checkout.wallet_amount')}>
              {formatCurrencyBasedOnCurrentLanguage(completedPayment.walletAmount)}
            </Descriptions.Item>
            <Descriptions.Item label={t('tuition-payment.checkout.online_amount')}>
              {formatCurrencyBasedOnCurrentLanguage(completedPayment.onlineAmount)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Flex>
    )
  }

  if ((charges.loading && !charges.data) || (summary.loading && !summary.data)) {
    return <Skeleton active paragraph={{ rows: 10 }} />
  }

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <Steps size="small" current={1} items={getPaymentFlowSteps(t)} />
      <Flex align="center" gap={8}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(tuitionListRoute)}
        />
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t(`tuition-payment.checkout.action.${action}`)}
        </Typography.Title>
      </Flex>

      {requestInvalid && (
        <Card>
          <Typography.Text type="danger">
            {t('tuition-payment.checkout.charges_not_eligible')}
          </Typography.Text>
        </Card>
      )}

      <Card
        title={
          action === PaymentAction.InstallmentPlan
            ? t('tuition-payment.checkout.choose_plan')
            : t('tuition-payment.checkout.selected_charges')
        }
      >
        {action === PaymentAction.InstallmentPlan ? (
          <Flex vertical gap={12}>
            {selectedCharges.map(renderPlanSelector)}
          </Flex>
        ) : (
          <GenericTable
            rowKey="enrollmentId"
            data={selectedCharges}
            fields={chargeTableFields}
            loading={charges.loading}
          />
        )}
      </Card>

      <Card title={t('tuition-payment.checkout.payment_summary')}>
        <Flex vertical gap={14}>
          <Flex justify="space-between">
            <Typography.Text>{t('tuition-payment.checkout.available_balance')}</Typography.Text>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(availableBalance)}
            </Typography.Text>
          </Flex>
          <InputNumber
            min={0}
            max={maxCreditBalance}
            precision={2}
            value={creditBalanceApplied}
            placeholder="e.g. 100.00"
            prefix={<WalletOutlined />}
            style={{ width: '100%' }}
            onFocus={selectInputNumberTextOnFocus}
            onChange={setCreditBalanceApplied}
          />
          <Flex justify="space-between" align="center" gap={8} wrap="wrap">
            <Typography.Text type="secondary">
              {t('tuition-payment.checkout.max_balance', {
                amount: formatCurrencyBasedOnCurrentLanguage(maxCreditBalance),
              })}
            </Typography.Text>
            <Button
              size="small"
              disabled={maxCreditBalance <= 0 || appliedCreditBalance === maxCreditBalance}
              onClick={() => setCreditBalanceApplied(maxCreditBalance)}
            >
              {t('tuition-payment.checkout.use_max_balance')}
            </Button>
          </Flex>
          <Divider style={{ margin: 0 }} />
          <Flex justify="space-between">
            <Typography.Text>{t('tuition-payment.checkout.total_due_today')}</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrencyBasedOnCurrentLanguage(totalDueToday)}
            </Typography.Title>
          </Flex>
          <Flex justify="space-between">
            <Typography.Text>{t('tuition-payment.checkout.from_balance')}</Typography.Text>
            <Typography.Text>
              {formatCurrencyBasedOnCurrentLanguage(appliedCreditBalance)}
            </Typography.Text>
          </Flex>
          <Flex justify="space-between">
            <Typography.Text>
              <BankOutlined /> {t('tuition-payment.checkout.online_payment')}
            </Typography.Text>
            <Typography.Text>{formatCurrencyBasedOnCurrentLanguage(onlineAmount)}</Typography.Text>
          </Flex>
          <Button
            type="primary"
            size="large"
            block
            loading={payment.loading}
            disabled={requestInvalid || totalDueToday <= 0}
            onClick={handleSubmit}
          >
            {t('tuition-payment.checkout.pay_amount', {
              amount: formatCurrencyBasedOnCurrentLanguage(totalDueToday),
            })}
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

const TuitionCheckoutPage = () => {
  const [searchParams] = useSearchParams()
  return searchParams.get('action') === 'obligations' ? (
    <ObligationCheckoutPage />
  ) : (
    <LegacyTuitionCheckoutPage />
  )
}

export default TuitionCheckoutPage
