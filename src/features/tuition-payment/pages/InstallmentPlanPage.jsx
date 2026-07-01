import { ApiUrls } from '@/shared/api/apiUrls'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultChargeStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useFetch from '@/shared/hooks/useFetch'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Modal, Skeleton, Tag, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

const PaymentAction = {
  Next: 'next',
  Remaining: 'remaining',
}

const InstallmentPlanPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { enrollmentId } = useParams()
  const parsedEnrollmentId = Number(enrollmentId)
  const charges = useFetch(
    Number.isInteger(parsedEnrollmentId) && parsedEnrollmentId > 0
      ? ApiUrls.ACCOUNT_HOLDER.TUITION_CHARGES
      : '',
    {
      EnrollmentIds: [parsedEnrollmentId],
      Status: EnumConfig.StudentTuitionFilterStatus.All,
      IsInstallment: true,
      Page: 1,
      PageSize: 1,
    }
  )
  const charge = charges.data?.collection?.[0]

  const openCheckout = (action) => {
    const params = new URLSearchParams({ action })
    params.append('enrollmentIds', String(parsedEnrollmentId))
    navigate(
      `${routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.CHECKOUT)}?${params.toString()}`
    )
  }

  const confirmCheckout = (action) => {
    if (!hasOverdue) {
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

  if (charges.loading && !charges.data) return <Skeleton active paragraph={{ rows: 10 }} />
  if (!charge) return <Empty description={t('tuition-payment.installments.not_found')} />

  const installments = [...charge.installments].sort(
    (left, right) => left.installmentNumber - right.installmentNumber
  )
  const unpaidInstallments = installments.filter(
    (installment) => installment.status !== EnumConfig.ChargeStatus.Paid
  )
  const hasOverdue = installments.some(
    (installment) => installment.status === EnumConfig.ChargeStatus.Overdue
  )

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
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <Flex vertical>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('tuition-payment.installments.title')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {charge.courseName} ({charge.courseCode})
          </Typography.Text>
        </Flex>
      </Flex>

      {hasOverdue && (
        <Alert
          showIcon
          icon={<WarningOutlined />}
          type="warning"
          message={t('tuition-payment.overdue.title')}
          description={t('tuition-payment.overdue.description')}
        />
      )}

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
          disabled={!unpaidInstallments.length}
          onClick={() => confirmCheckout(PaymentAction.Remaining)}
        >
          {t('tuition-payment.action.pay_remaining')}
        </Button>
        <Button
          type="primary"
          disabled={!unpaidInstallments.length}
          onClick={() => confirmCheckout(PaymentAction.Next)}
        >
          {t('tuition-payment.action.pay_next')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default InstallmentPlanPage
