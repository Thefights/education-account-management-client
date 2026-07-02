import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleFilled,
  UnorderedListOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Card, Empty, Flex, Select, Skeleton, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  compareChargeStatusThenInstallmentNumber,
  compareInstallmentDueDateThenNumber,
  isInstallmentDueForPayment,
} from '../utils/chargeStatusSort'
import '../styles/tuitionPayment.css'

const PaymentAction = {
  Due: 'due',
  Remaining: 'remaining',
}

const InstallmentVisualStatus = {
  Overdue: 'overdue',
  Due: 'due',
  Upcoming: 'upcoming',
  Paid: 'paid',
}

const getInstallmentVisualStatus = (installment) => {
  if (installment.status === EnumConfig.ChargeStatus.Paid) return InstallmentVisualStatus.Paid
  if (installment.status === EnumConfig.ChargeStatus.Overdue) return InstallmentVisualStatus.Overdue
  if (isInstallmentDueForPayment(installment)) return InstallmentVisualStatus.Due
  return InstallmentVisualStatus.Upcoming
}

const getInstallmentStatusIcon = (status) => {
  if (status === InstallmentVisualStatus.Overdue) return <ExclamationCircleOutlined />
  if (status === InstallmentVisualStatus.Due) return <ClockCircleOutlined />
  if (status === InstallmentVisualStatus.Paid) return <CheckCircleOutlined />
  return null
}

const InstallmentPlanPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { enrollmentId } = useParams()
  const parsedEnrollmentId = Number(enrollmentId)
  const [installmentCount, setInstallmentCount] = useState(1)
  const charges = useFetch(
    Number.isInteger(parsedEnrollmentId) && parsedEnrollmentId > 0
      ? ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES
      : '',
    {
      EnrollmentIds: [parsedEnrollmentId],
      IsInstallment: true,
      Page: 1,
      PageSize: 1,
    }
  )
  const charge = charges.data?.collection?.[0]

  const openCheckout = (action) => {
    const params = new URLSearchParams({ action })
    params.append('enrollmentIds', String(parsedEnrollmentId))
    if (action === PaymentAction.Due) {
      params.set(`installmentCount.${charge.chargeId}`, String(installmentCount))
    }
    navigate(
      `${routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.CHECKOUT)}?${params.toString()}`
    )
  }

  if (charges.loading && !charges.data) return <Skeleton active paragraph={{ rows: 10 }} />
  if (!charge) return <Empty description={t('tuition-payment.installments.not_found')} />

  const installments = [...charge.installments].sort(compareChargeStatusThenInstallmentNumber)
  const unpaidInstallments = installments.filter(
    (installment) => installment.status !== EnumConfig.ChargeStatus.Paid
  )
  const unlockedInstallments = installments
    .filter(isInstallmentDueForPayment)
    .sort(compareInstallmentDueDateThenNumber)
  const oldestDueInstallment = unlockedInstallments[0]
  const selectedDueAmount = unlockedInstallments
    .slice(0, installmentCount)
    .reduce((total, installment) => total + Number(installment.amount), 0)
  const remainingInstallmentAmount = unpaidInstallments.reduce(
    (total, installment) => total + Number(installment.amount),
    0
  )
  const tuitionListRoute = routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX)
  const installmentStatusCounts = installments.reduce(
    (counts, installment) => {
      const visualStatus = getInstallmentVisualStatus(installment)
      return { ...counts, [visualStatus]: counts[visualStatus] + 1 }
    },
    {
      [InstallmentVisualStatus.Overdue]: 0,
      [InstallmentVisualStatus.Due]: 0,
      [InstallmentVisualStatus.Upcoming]: 0,
      [InstallmentVisualStatus.Paid]: 0,
    }
  )
  const timelineLegend = [
    InstallmentVisualStatus.Overdue,
    InstallmentVisualStatus.Due,
    InstallmentVisualStatus.Upcoming,
    InstallmentVisualStatus.Paid,
  ]

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      <Flex align="center" gap={8}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(tuitionListRoute)}
        />
        <Flex vertical>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('tuition-payment.installments.title')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {charge.courseName} ({charge.courseCode})
          </Typography.Text>
        </Flex>
      </Flex>

      <Flex gap={20} wrap="wrap">
        <Card className="installment-summary-card" style={{ flex: '1 1 420px' }}>
          <Flex vertical gap={18}>
            <Flex align="center" gap={18}>
              <div className="installment-summary-card__icon installment-summary-card__icon--wallet">
                <WalletOutlined />
              </div>
              <Flex vertical gap={4}>
                <Typography.Text type="secondary">
                  {t('tuition-payment.installments.due_amount')}
                </Typography.Text>
                <Typography.Title level={2} className="installment-summary-card__amount">
                  {formatCurrencyBasedOnCurrentLanguage(selectedDueAmount)}
                </Typography.Title>
              </Flex>
            </Flex>
            <div className="installment-summary-card__divider" />
            <Typography.Text type="secondary" style={{ fontWeight: 500 }}>
              {t('tuition-payment.charge.installments_to_pay')}
            </Typography.Text>
            <Select
              size="large"
              className="installment-summary-card__select"
              aria-label={t('tuition-payment.charge.installments_to_pay')}
              value={oldestDueInstallment ? installmentCount : undefined}
              disabled={!oldestDueInstallment}
              prefix={<UnorderedListOutlined />}
              placeholder={t('tuition-payment.installments.none_due')}
              options={unlockedInstallments.map((_, index) => ({
                value: index + 1,
                label: t(
                  index === 0
                    ? 'tuition-payment.charge.installment_count_one'
                    : 'tuition-payment.charge.installment_count_many',
                  { count: index + 1 }
                ),
              }))}
              onChange={setInstallmentCount}
            />
          </Flex>
        </Card>
        <Card className="installment-summary-card" style={{ flex: '1 1 420px' }}>
          <Flex vertical gap={22}>
            <Flex align="center" gap={18}>
              <div className="installment-summary-card__icon installment-summary-card__icon--clock">
                <ClockCircleOutlined />
              </div>
              <Flex vertical gap={4}>
                <Typography.Text type="secondary">
                  {t('tuition-payment.installments.remaining_amount')}
                </Typography.Text>
                <Typography.Title level={2} className="installment-summary-card__amount">
                  {formatCurrencyBasedOnCurrentLanguage(remainingInstallmentAmount)}
                </Typography.Title>
              </Flex>
            </Flex>
            <Flex align="center" gap={12} className="installment-summary-card__notice">
              <InfoCircleFilled />
              <Typography.Text>
                {t('tuition-payment.installments.summary_prefix')}{' '}
                <Typography.Text strong className="installment-summary-card__due-count">
                  {t('tuition-payment.installments.due_count', {
                    count: installmentStatusCounts[InstallmentVisualStatus.Due],
                  })}
                </Typography.Text>{' '}
                {t('tuition-payment.installments.summary_and')}{' '}
                <Typography.Text strong className="installment-summary-card__overdue-count">
                  {t('tuition-payment.installments.overdue_count', {
                    count: installmentStatusCounts[InstallmentVisualStatus.Overdue],
                  })}
                </Typography.Text>
              </Typography.Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      <Card className="installment-timeline-card">
        <Flex align="start" justify="space-between" gap={16} wrap="wrap">
          <Flex align="center" gap={16}>
            <div className="installment-timeline-card__icon">
              <CalendarOutlined />
            </div>
            <Flex vertical gap={2}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('tuition-payment.installments.timeline')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('tuition-payment.installments.timeline_overview')}
              </Typography.Text>
            </Flex>
          </Flex>
          <Flex gap={24} wrap="wrap" className="installment-timeline-card__legend">
            {timelineLegend.map((status) => (
              <Flex key={status} align="center" gap={8}>
                <span className={`installment-timeline__legend-dot is-${status}`} />
                <Typography.Text>{t(`tuition-payment.installments.legend.${status}`)}</Typography.Text>
              </Flex>
            ))}
          </Flex>
        </Flex>

        <div
          className="installment-timeline"
          style={{ '--installment-count': installments.length }}
        >
          <div className="installment-timeline__rail" />
          {installments.map((installment) => {
            const visualStatus = getInstallmentVisualStatus(installment)
            const statusIcon = getInstallmentStatusIcon(visualStatus)
            return (
              <div
                key={installment.id}
                className={`installment-timeline__item is-${visualStatus}`}
              >
                <div className="installment-timeline__node">
                  {statusIcon || installment.installmentNumber}
                </div>
                <div className="installment-timeline__installment-card">
                  <Typography.Text type="secondary">
                    {t('tuition-payment.installments.number')}
                  </Typography.Text>
                  <Typography.Title level={3} className="installment-timeline__number">
                    {installment.installmentNumber}
                  </Typography.Title>
                  <Typography.Text strong>
                    {formatCurrencyBasedOnCurrentLanguage(installment.amount)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {formatDateBasedOnCurrentLanguage(installment.dueDate)}
                  </Typography.Text>
                  <Tag className={`installment-timeline__status-pill is-${visualStatus}`}>
                    {statusIcon}
                    {t(`tuition-payment.installments.legend.${visualStatus}`)}
                  </Tag>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Flex justify="end" gap={8} wrap="wrap">
        <Button
          disabled={!unpaidInstallments.length}
          onClick={() => openCheckout(PaymentAction.Remaining)}
        >
          {t('tuition-payment.action.pay_remaining')}
        </Button>
        <Button
          type="primary"
          disabled={!oldestDueInstallment}
          onClick={() => openCheckout(PaymentAction.Due)}
        >
          {t('tuition-payment.action.pay_due')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default InstallmentPlanPage
