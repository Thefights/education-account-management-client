import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultChargeStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { Button, Card, Checkbox, Descriptions, Empty, Flex, Skeleton, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const TuitionChargeList = ({
  charges,
  loading,
  selectedCharges,
  onSelectionChange,
  showInstallments,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (loading && charges.length === 0) return <Skeleton active paragraph={{ rows: 8 }} />
  if (charges.length === 0) return <Empty description={t('tuition-payment.empty')} />

  const isSelected = (chargeId) => selectedCharges.some((charge) => charge.chargeId === chargeId)
  const toggleCharge = (charge, checked) => {
    onSelectionChange(
      checked
        ? [...selectedCharges, charge]
        : selectedCharges.filter((selected) => selected.chargeId !== charge.chargeId)
    )
  }

  return (
    <Flex vertical gap={12}>
      {charges.map((charge) => {
        const canPay =
          Boolean(charge.chargeId) &&
          charge.status !== EnumConfig.ChargeStatus.Paid &&
          charge.remainingAmount > 0
        const unpaidInstallments = charge.installments
          .filter((installment) => installment.status !== EnumConfig.ChargeStatus.Paid)
          .sort((left, right) => left.installmentNumber - right.installmentNumber)
        const nextInstallment = unpaidInstallments[0]
        const hasFas = Boolean(charge.appliedFasSchemeName)

        return (
          <Card key={charge.enrollmentId} styles={{ body: { padding: 16 } }}>
            <Flex vertical gap={14}>
              <Flex justify="space-between" align="start" gap={16} wrap="wrap">
                <Flex gap={12} align="start">
                  <Checkbox
                    checked={isSelected(charge.chargeId)}
                    disabled={!canPay}
                    onChange={(event) => toggleCharge(charge, event.target.checked)}
                  />
                  <Flex vertical gap={2}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {charge.courseName}
                    </Typography.Title>
                    <Typography.Text type="secondary">{charge.courseCode}</Typography.Text>
                  </Flex>
                </Flex>
                <Flex vertical align="end" gap={4}>
                  <Typography.Text strong>
                    {formatCurrencyBasedOnCurrentLanguage(
                      nextInstallment?.amount ?? charge.remainingAmount
                    )}
                  </Typography.Text>
                  <Tag color={defaultChargeStatusStyle(charge.status)}>{charge.status}</Tag>
                </Flex>
              </Flex>

              <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 4 }}>
                <Descriptions.Item label={t('tuition-payment.charge.due_date')}>
                  {formatDateBasedOnCurrentLanguage(charge.paymentDueDate)}
                </Descriptions.Item>
                <Descriptions.Item label={t('tuition-payment.charge.gross_amount')}>
                  {formatCurrencyBasedOnCurrentLanguage(charge.grossAmount)}
                </Descriptions.Item>
                <Descriptions.Item label={t('tuition-payment.charge.net_payable')}>
                  {formatCurrencyBasedOnCurrentLanguage(charge.netPayable)}
                </Descriptions.Item>
                <Descriptions.Item label={t('tuition-payment.charge.remaining_amount')}>
                  {formatCurrencyBasedOnCurrentLanguage(charge.remainingAmount)}
                </Descriptions.Item>
                <Descriptions.Item label={t('tuition-payment.charge.fas')}>
                  {hasFas
                    ? `${charge.appliedFasSchemeName}${charge.appliedFasTierName ? ` - ${charge.appliedFasTierName}` : ''}`
                    : t('tuition-payment.charge.no_fas')}
                </Descriptions.Item>
                <Descriptions.Item label={t('tuition-payment.charge.fas_subsidy')}>
                  {formatCurrencyBasedOnCurrentLanguage(charge.fasSubsidyAmount)}
                </Descriptions.Item>
                <Descriptions.Item label={t('tuition-payment.charge.paid_amount')}>
                  {formatCurrencyBasedOnCurrentLanguage(charge.paidAmount)}
                </Descriptions.Item>
                {showInstallments && (
                  <Descriptions.Item label={t('tuition-payment.charge.next_installment')}>
                    {nextInstallment
                      ? `${nextInstallment.installmentNumber}/${charge.installments.length} - ${nextInstallment.status}`
                      : t('tuition-payment.charge.completed')}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {showInstallments && (
                <Flex justify="end">
                  <Button
                    type="link"
                    onClick={() =>
                      navigate(
                        routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(
                          routeUrls.TUITION_PAYMENT.INSTALLMENTS(charge.enrollmentId)
                        )
                      )
                    }
                  >
                    {t('tuition-payment.action.view_installments')}
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card>
        )
      })}
    </Flex>
  )
}

export default TuitionChargeList
