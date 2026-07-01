import { ApiUrls } from '@/shared/api/apiUrls'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultChargeStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Select, Skeleton, Steps, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  compareChargeStatusThenInstallmentNumber,
  compareInstallmentDueDateThenNumber,
  isInstallmentDueForPayment,
} from '../utils/chargeStatusSort'

const PaymentAction = {
  Due: 'due',
  Remaining: 'remaining',
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
  const getStepStatus = (installment) => {
    if (installment.status === EnumConfig.ChargeStatus.Paid) return 'finish'
    if (installment.status === EnumConfig.ChargeStatus.Overdue) return 'error'
    if (installment.id === oldestDueInstallment?.id) return 'process'
    return 'wait'
  }
  const currentStepIndex = oldestDueInstallment
    ? installments.findIndex((installment) => installment.id === oldestDueInstallment.id)
    : installments.length

  const tableFields = [
    {
      key: 'installmentNumber',
      title: t('tuition-payment.installments.number'),
    },
    {
      key: 'amount',
      title: t('tuition-payment.installments.amount'),
      render: (value) => formatCurrencyBasedOnCurrentLanguage(value),
    },
    {
      key: 'dueDate',
      title: t('tuition-payment.installments.due_date'),
      render: (value) => formatDateBasedOnCurrentLanguage(value),
    },
    {
      key: 'status',
      title: t('tuition-payment.installments.status'),
      render: (value) => <Tag color={defaultChargeStatusStyle(value)}>{value}</Tag>,
    },
  ]

  return (
    <Flex vertical gap={18} style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
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

      <Flex gap={12} wrap="wrap">
        <Card style={{ flex: '1 1 240px' }}>
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">
              {t('tuition-payment.installments.due_amount')}
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrencyBasedOnCurrentLanguage(selectedDueAmount)}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontWeight: 500 }}>
              {t('tuition-payment.charge.installments_to_pay')}
            </Typography.Text>
            <Select
              aria-label={t('tuition-payment.charge.installments_to_pay')}
              value={oldestDueInstallment ? installmentCount : undefined}
              disabled={!oldestDueInstallment}
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
        <Card style={{ flex: '1 1 240px' }}>
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">
              {t('tuition-payment.installments.remaining_amount')}
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrencyBasedOnCurrentLanguage(remainingInstallmentAmount)}
            </Typography.Title>
          </Flex>
        </Card>
      </Flex>

      <Card title={t('tuition-payment.installments.timeline')}>
        <Steps
          responsive
          current={currentStepIndex}
          items={installments.map((installment) => ({
            title: t('tuition-payment.installments.step_title', {
              number: installment.installmentNumber,
            }),
            description: (
              <Flex vertical gap={2}>
                <Typography.Text>
                  {formatCurrencyBasedOnCurrentLanguage(installment.amount)}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {formatDateBasedOnCurrentLanguage(installment.dueDate)}
                </Typography.Text>
                <Tag color={defaultChargeStatusStyle(installment.status)}>{installment.status}</Tag>
              </Flex>
            ),
            status: getStepStatus(installment),
          }))}
        />
      </Card>

      <Card>
        <GenericTable
          rowKey="id"
          data={installments}
          fields={tableFields}
          loading={charges.loading}
        />
      </Card>

      <Flex justify="end" gap={8} wrap="wrap">
        <Button
          type="primary"
          disabled={!oldestDueInstallment}
          onClick={() => openCheckout(PaymentAction.Due)}
        >
          {t('tuition-payment.action.pay_due')}
        </Button>
        <Button
          disabled={!unpaidInstallments.length}
          onClick={() => openCheckout(PaymentAction.Remaining)}
        >
          {t('tuition-payment.action.pay_remaining')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default InstallmentPlanPage
