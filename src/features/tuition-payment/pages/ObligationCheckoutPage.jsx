import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { selectInputNumberTextOnFocus } from '@/shared/utils/inputNumberFocusUtil'
import { showErrorToast, showSuccessToast } from '@/shared/utils/toastUtil'
import { ArrowLeftOutlined, BankOutlined, CalendarOutlined, WalletOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Empty, Flex, InputNumber, Result, Skeleton, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const statusPriority = { Overdue: 0, Due: 1, Paid: 2, Upcoming: 3 }
const statusColor = { Overdue: 'error', Due: 'processing', Paid: 'success', Upcoming: 'default' }
const fallbackStatus = (dueDate, storedStatus) => {
  if (storedStatus === 'Paid') return 'Paid'
  return dayjs(dueDate).isBefore(dayjs(), 'day') ? 'Overdue' : 'Due'
}

const ObligationCheckoutPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const year = Number(searchParams.get('year'))
  const chargeIds = useMemo(() => new Set(searchParams.getAll('chargeIds').map(Number)), [searchParams])
  const installmentIds = useMemo(
    () => new Set(searchParams.getAll('installmentIds').map(Number)),
    [searchParams]
  )
  const enrollmentIds = useMemo(
    () => searchParams.getAll('enrollmentIds').map(Number).filter((id) => Number.isInteger(id)),
    [searchParams]
  )
  const [creditBalanceApplied, setCreditBalanceApplied] = useState(null)
  const [completedPayment, setCompletedPayment] = useState(null)
  const obligations = useFetch(
    Number.isInteger(year) ? ApiUrls.ACCOUNT_HOLDER.TUITION_OBLIGATIONS : '',
    { Year: year },
    [year]
  )
  const summary = useFetch(ApiUrls.ACCOUNT_HOLDER.TUITION_SUMMARY)
  const legacyCharges = useFetch(
    enrollmentIds.length ? ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES : '',
    { EnrollmentIds: enrollmentIds, Page: 1, PageSize: 100 },
    [enrollmentIds]
  )
  const payment = useAxiosSubmit({
    url: ApiUrls.PAYMENT.OBLIGATIONS,
    method: 'POST',
    contentType: 'json',
  })
  const yearlyItems = (obligations.data?.months ?? [])
    .flatMap((month) => month.items)
    .filter((item) =>
      item.installmentId ? installmentIds.has(item.installmentId) : chargeIds.has(item.chargeId)
    )
  const yearlyKeys = new Set(
    yearlyItems.map((item) => `${item.chargeId}:${item.installmentId ?? 'full'}`)
  )
  const fallbackItems = (legacyCharges.data?.collection ?? []).flatMap((charge) => {
    const result = []
    if (chargeIds.has(charge.chargeId) && !yearlyKeys.has(`${charge.chargeId}:full`)) {
      result.push({
        obligationType: 'FullCharge',
        chargeId: charge.chargeId,
        enrollmentId: charge.enrollmentId,
        installmentId: null,
        courseCode: charge.courseCode,
        courseName: charge.courseName,
        amount: charge.remainingAmount,
        dueDate: charge.paymentDueDate,
        status: fallbackStatus(charge.paymentDueDate, charge.status),
        isPayable: true,
      })
    }
    charge.installments
      .filter(
        (installment) =>
          installmentIds.has(installment.id) &&
          !yearlyKeys.has(`${charge.chargeId}:${installment.id}`)
      )
      .forEach((installment) =>
        result.push({
          obligationType: 'Installment',
          chargeId: charge.chargeId,
          enrollmentId: charge.enrollmentId,
          installmentId: installment.id,
          courseCode: charge.courseCode,
          courseName: charge.courseName,
          amount: installment.amount,
          dueDate: installment.dueDate,
          installmentNumber: installment.installmentNumber,
          totalInstallments: charge.installments.length,
          status: fallbackStatus(installment.dueDate, installment.status),
          isPayable: true,
        })
      )
    return result
  })
  const items = [...yearlyItems, ...fallbackItems].sort(
    (left, right) =>
      (statusPriority[left.status] ?? 4) - (statusPriority[right.status] ?? 4) ||
      new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
  )
  const requestedCount = chargeIds.size + installmentIds.size
  const invalid =
    requestedCount === 0 || items.length !== requestedCount || items.some((item) => !item.isPayable)
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0)
  const availableBalance = Number(summary.data?.educationAccountBalance ?? 0)
  const maxCredit = Math.min(total, availableBalance)
  const appliedCredit = Math.min(Number(creditBalanceApplied || 0), maxCredit)
  const onlineAmount = Math.max(total - appliedCredit, 0)
  const tuitionListRoute = routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX)

  const submit = async () => {
    if (invalid || total <= 0) return
    const response = await payment.submit({
      overrideData: {
        Items: items.map((item) => ({
          ChargeId: item.chargeId,
          InstallmentId: item.installmentId ?? null,
        })),
        CreditBalanceApplied: appliedCredit,
      },
    })
    const result = response?.data
    if (!result) return
    if (result.requiresRedirect) {
      if (!result.link) return showErrorToast(t('tuition-payment.checkout.missing_redirect'))
      window.location.assign(result.link)
      return
    }
    if (result.status === 'Succeeded') {
      setCompletedPayment(result)
      showSuccessToast(t('tuition-payment.callback.succeeded'))
      return
    }
    showErrorToast(t('tuition-payment.checkout.unexpected_status', { status: result.status }))
  }

  if (completedPayment) {
    return (
      <Card style={{ maxWidth: 900, margin: '0 auto' }}>
        <Result
          status="success"
          title={t('tuition-payment.callback.success_title')}
          subTitle={t('tuition-payment.checkout.completed_description')}
          extra={<Button type="primary" onClick={() => navigate(tuitionListRoute)}>{t('tuition-payment.action.back_to_charges')}</Button>}
        />
      </Card>
    )
  }

  if (
    (obligations.loading && !obligations.data) ||
    (summary.loading && !summary.data) ||
    (legacyCharges.loading && !legacyCharges.data)
  )
    return <Skeleton active paragraph={{ rows: 10 }} />
  if (invalid) return <Empty description={t('tuition-payment.checkout.charges_not_eligible')} />

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <Flex align="center" gap={8}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(tuitionListRoute)} />
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('tuition-payment.checkout.action.obligations')}
        </Typography.Title>
      </Flex>
      <Card title={t('tuition-payment.checkout.selected_charges')}>
        <Flex vertical gap={10}>
          <div className="tuition-checkout-obligation tuition-checkout-obligation--header">
            <Typography.Text>{t('tuition-payment.charge.course')}</Typography.Text>
            <Typography.Text>{t('tuition-payment.checkout.payment_target')}</Typography.Text>
            <Typography.Text>{t('tuition-payment.charge.due_date')}</Typography.Text>
            <Typography.Text>{t('tuition-payment.timeline.status')}</Typography.Text>
            <Typography.Text>{t('tuition-payment.timeline.amount')}</Typography.Text>
          </div>
          {items.map((item) => (
            <div
              key={`${item.chargeId}:${item.installmentId ?? 'full'}`}
              className="tuition-checkout-obligation"
            >
              <Flex vertical className="tuition-checkout-obligation__course">
                <Typography.Text strong>{item.courseName}</Typography.Text>
                <Typography.Text type="secondary">{item.courseCode}</Typography.Text>
              </Flex>
              <div className="tuition-checkout-obligation__target">
                <Tag>
                  {item.installmentId
                    ? `${item.installmentNumber} / ${item.totalInstallments}`
                    : t('tuition-payment.timeline.full_payment')}
                </Tag>
              </div>
              <Typography.Text className="tuition-checkout-obligation__date">
                <CalendarOutlined /> {dayjs(item.dueDate).format('DD MMM YYYY')}
              </Typography.Text>
              <div className="tuition-checkout-obligation__status">
                <Tag color={statusColor[item.status]}>
                  {t(`tuition-payment.status.${item.status}`)}
                </Tag>
              </div>
              <Typography.Text strong className="tuition-checkout-obligation__amount">
                {formatCurrencyBasedOnCurrentLanguage(item.amount)}
              </Typography.Text>
            </div>
          ))}
        </Flex>
      </Card>
      <Card title={t('tuition-payment.checkout.payment_summary')}>
        <Flex vertical gap={14}>
          <Flex justify="space-between"><Typography.Text>{t('tuition-payment.checkout.available_balance')}</Typography.Text><Typography.Text strong>{formatCurrencyBasedOnCurrentLanguage(availableBalance)}</Typography.Text></Flex>
          <InputNumber min={0} max={maxCredit} precision={2} value={creditBalanceApplied} prefix={<WalletOutlined />} style={{ width: '100%' }} onFocus={selectInputNumberTextOnFocus} onChange={setCreditBalanceApplied} />
          <Button size="small" disabled={maxCredit <= 0 || appliedCredit === maxCredit} onClick={() => setCreditBalanceApplied(maxCredit)}>{t('tuition-payment.checkout.use_max_balance')}</Button>
          <Divider style={{ margin: 0 }} />
          <Flex justify="space-between"><Typography.Text>{t('tuition-payment.checkout.total_due_today')}</Typography.Text><Typography.Title level={4} style={{ margin: 0 }}>{formatCurrencyBasedOnCurrentLanguage(total)}</Typography.Title></Flex>
          <Flex justify="space-between"><Typography.Text>{t('tuition-payment.checkout.from_balance')}</Typography.Text><Typography.Text>{formatCurrencyBasedOnCurrentLanguage(appliedCredit)}</Typography.Text></Flex>
          <Flex justify="space-between"><Typography.Text><BankOutlined /> {t('tuition-payment.checkout.online_payment')}</Typography.Text><Typography.Text>{formatCurrencyBasedOnCurrentLanguage(onlineAmount)}</Typography.Text></Flex>
          <Button type="primary" size="large" block loading={payment.loading} onClick={submit}>{t('tuition-payment.checkout.pay_amount', { amount: formatCurrencyBasedOnCurrentLanguage(total) })}</Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default ObligationCheckoutPage
