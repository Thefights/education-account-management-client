import { ApiUrls } from '@/shared/api/apiUrls'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
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
  Select,
  Skeleton,
  Typography,
} from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentAction = {
  Full: 'full',
  InstallmentPlan: 'installment-plan',
  Next: 'next',
  Remaining: 'remaining',
}

const paymentEndpoints = {
  [PaymentAction.Full]: ApiUrls.PAYMENT.FULL,
  [PaymentAction.InstallmentPlan]: ApiUrls.PAYMENT.INSTALLMENT_PLAN,
  [PaymentAction.Next]: ApiUrls.PAYMENT.INSTALLMENTS_NEXT,
  [PaymentAction.Remaining]: ApiUrls.PAYMENT.INSTALLMENTS_REMAINING,
}

const PaymentSessionStatus = {
  Succeeded: 'Succeeded',
}

const getUnpaidInstallments = (charge) =>
  charge.installments
    .filter((installment) => installment.status !== EnumConfig.ChargeStatus.Paid)
    .sort((left, right) => left.installmentNumber - right.installmentNumber)

const TuitionCheckoutPage = () => {
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
  const targetsExistingPlan = action === PaymentAction.Next || action === PaymentAction.Remaining
  const [paymentPlanMonths, setPaymentPlanMonths] = useState({})
  const [creditBalanceApplied, setCreditBalanceApplied] = useState(0)
  const [completedPayment, setCompletedPayment] = useState(null)

  const chargeQuery = useMemo(
    () => ({
      EnrollmentIds: enrollmentIds,
      Status: EnumConfig.StudentTuitionFilterStatus.All,
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

  const selectedCharges = charges.data?.collection ?? []
  const hasAllRequestedCharges = selectedCharges.length === new Set(enrollmentIds).size
  const hasInvalidCharge = selectedCharges.some((charge) => {
    if (
      !charge.chargeId ||
      charge.status === EnumConfig.ChargeStatus.Paid ||
      charge.remainingAmount <= 0
    )
      return true
    return targetsExistingPlan ? charge.installments.length === 0 : charge.installments.length > 0
  })

  const amountForCharge = useCallback((charge) => {
    if (action === PaymentAction.Full) return Number(charge.remainingAmount)
    if (action === PaymentAction.InstallmentPlan) {
      const months = paymentPlanMonths[charge.chargeId] ?? 3
      return Math.round((Number(charge.remainingAmount) / months) * 100) / 100
    }
    const unpaidInstallments = getUnpaidInstallments(charge)
    if (action === PaymentAction.Next) return Number(unpaidInstallments[0]?.amount ?? 0)
    return unpaidInstallments.reduce((total, installment) => total + Number(installment.amount), 0)
  }, [action, paymentPlanMonths])

  const totalDueToday = selectedCharges.reduce(
    (total, charge) => total + amountForCharge(charge),
    0
  )
  const availableBalance = Number(summary.data?.educationAccountBalance ?? 0)
  const maxCreditBalance = Math.min(availableBalance, totalDueToday)
  const appliedCreditBalance = Math.min(Number(creditBalanceApplied ?? 0), maxCreditBalance)
  const onlineAmount = Math.max(totalDueToday - appliedCreditBalance, 0)

  const requestInvalid = !hasAllRequestedCharges || hasInvalidCharge

  const chargeTableFields = useMemo(
    () => [
      { key: 'courseName', title: t('tuition-payment.charge.course') },
      { key: 'courseCode', title: t('tuition-payment.charge.course_code') },
      {
        key: 'remainingAmount',
        title: t('tuition-payment.charge.remaining_amount'),
        render: (value) => formatCurrencyBasedOnCurrentLanguage(value),
      },
      ...(action === PaymentAction.InstallmentPlan
        ? [
            {
              key: 'chargeId',
              title: t('tuition-payment.checkout.plan_months'),
              render: (_, charge) => (
                <Select
                  value={paymentPlanMonths[charge.chargeId] ?? 3}
                  options={paymentPlanOptions.filter((opt) => opt.value !== 1)}
                  onChange={(month) =>
                    setPaymentPlanMonths((current) => ({
                      ...current,
                      [charge.chargeId]: month,
                    }))
                  }
                />
              ),
            },
          ]
        : []),
      {
        key: 'enrollmentId',
        title: t('tuition-payment.checkout.due_today'),
        render: (_, charge) => formatCurrencyBasedOnCurrentLanguage(amountForCharge(charge)),
      },
    ],
    [action, amountForCharge, paymentPlanMonths, paymentPlanOptions, t]
  )

  const handleSubmit = async () => {
    if (!hasAllRequestedCharges || hasInvalidCharge || totalDueToday <= 0) return

    const request =
      action === PaymentAction.InstallmentPlan
        ? {
            Items: selectedCharges.map((charge) => ({
              ChargeId: charge.chargeId,
              PaymentPlanMonths: paymentPlanMonths[charge.chargeId] ?? 3,
            })),
            CreditBalanceApplied: appliedCreditBalance,
          }
        : {
            ChargeIds: selectedCharges.map((charge) => charge.chargeId),
            CreditBalanceApplied: appliedCreditBalance,
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
      <Result
        status="success"
        title={t('tuition-payment.callback.succeeded')}
        subTitle={t('tuition-payment.checkout.completed_description')}
        extra={[
          <Descriptions key="payment" bordered size="small" column={1}>
            <Descriptions.Item label={t('tuition-payment.checkout.payment_mode')}>
              {completedPayment.paymentMode}
            </Descriptions.Item>
            <Descriptions.Item label={t('tuition-payment.checkout.total_amount')}>
              {formatCurrencyBasedOnCurrentLanguage(completedPayment.totalAmount)}
            </Descriptions.Item>
            <Descriptions.Item label={t('tuition-payment.checkout.wallet_amount')}>
              {formatCurrencyBasedOnCurrentLanguage(completedPayment.walletAmount)}
            </Descriptions.Item>
            <Descriptions.Item label={t('tuition-payment.checkout.online_amount')}>
              {formatCurrencyBasedOnCurrentLanguage(completedPayment.onlineAmount)}
            </Descriptions.Item>
          </Descriptions>,
          <Button
            key="back"
            type="primary"
            onClick={() =>
              navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX), {
                replace: true,
              })
            }
          >
            {t('tuition-payment.action.back_to_charges')}
          </Button>,
        ]}
      />
    )
  }

  if ((charges.loading && !charges.data) || (summary.loading && !summary.data)) {
    return <Skeleton active paragraph={{ rows: 10 }} />
  }

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <Flex align="center" gap={8}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
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

      <Card title={t('tuition-payment.checkout.selected_charges')}>
        <GenericTable
          rowKey="chargeId"
          data={selectedCharges}
          fields={chargeTableFields}
          loading={charges.loading}
        />
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
            value={appliedCreditBalance}
            prefix={<WalletOutlined />}
            style={{ width: '100%' }}
            onChange={(value) => setCreditBalanceApplied(value ?? 0)}
          />
          <Divider style={{ margin: 0 }} />
          <Flex justify="space-between">
            <Typography.Text>{t('tuition-payment.checkout.total_due_today')}</Typography.Text>
            <Typography.Text strong>
              {formatCurrencyBasedOnCurrentLanguage(totalDueToday)}
            </Typography.Text>
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
            {t('tuition-payment.checkout.confirm')}
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default TuitionCheckoutPage
