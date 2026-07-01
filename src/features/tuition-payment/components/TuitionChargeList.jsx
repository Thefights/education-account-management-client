import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultChargeStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import EmptyRow from '@/shared/components/placeholders/EmptyRow'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'

const getDisabledReasonKey = (charge) => {
  if (!charge.chargeId) return 'tuition-payment.charge.unavailable'
  if (charge.status === EnumConfig.ChargeStatus.Paid) return 'tuition-payment.charge.already_paid'
  if (charge.remainingAmount <= 0) return 'tuition-payment.charge.no_payable_balance'
  return null
}

const canPayCharge = (charge) =>
  Boolean(charge.chargeId) &&
  charge.status !== EnumConfig.ChargeStatus.Paid &&
  charge.remainingAmount > 0

const DetailCell = ({ label, value }) => (
  <Flex vertical gap={2} style={{ minWidth: 120 }}>
    <Typography.Text type="secondary">{label}</Typography.Text>
    <Typography.Text strong>{value}</Typography.Text>
  </Flex>
)

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
  if (charges.length === 0) {
    return (
      <Card>
        <EmptyRow title={t('tuition-payment.empty')} minHeight={220} />
      </Card>
    )
  }

  const isSelected = (chargeId) => selectedCharges.some((charge) => charge.chargeId === chargeId)
  const payableCharges = charges.filter(canPayCharge)
  const selectedPayableCount = payableCharges.filter((charge) => isSelected(charge.chargeId)).length
  const allPayableSelected =
    payableCharges.length > 0 && selectedPayableCount === payableCharges.length
  const toggleCharge = (charge, checked) => {
    if (!canPayCharge(charge)) return
    onSelectionChange(
      checked
        ? [...selectedCharges, charge]
        : selectedCharges.filter((selected) => selected.chargeId !== charge.chargeId)
    )
  }
  const toggleAllPayableCharges = (checked) => {
    const payableChargeIds = new Set(payableCharges.map((charge) => charge.chargeId))
    onSelectionChange(
      checked
        ? [
            ...selectedCharges.filter((charge) => !payableChargeIds.has(charge.chargeId)),
            ...payableCharges,
          ]
        : selectedCharges.filter((charge) => !payableChargeIds.has(charge.chargeId))
    )
  }

  return (
    <Flex vertical gap={12}>
      <Card size="small">
        <Checkbox
          checked={allPayableSelected}
          indeterminate={selectedPayableCount > 0 && !allPayableSelected}
          disabled={payableCharges.length === 0}
          onChange={(event) => toggleAllPayableCharges(event.target.checked)}
        >
          {t('tuition-payment.action.select_all_payable')}
        </Checkbox>
      </Card>
      {charges.map((charge) => {
        const canPay = canPayCharge(charge)
        const unpaidInstallments = charge.installments
          .filter((installment) => installment.status !== EnumConfig.ChargeStatus.Paid)
          .sort((left, right) => left.installmentNumber - right.installmentNumber)
        const nextInstallment = unpaidInstallments[0]
        const hasFas = Boolean(charge.appliedFasSchemeName)
        const disabledReasonKey = getDisabledReasonKey(charge)
        const amountLabel = showInstallments
          ? t('tuition-payment.charge.next_installment_amount')
          : t('tuition-payment.charge.remaining_amount')

        return (
          <Card
            key={charge.enrollmentId}
            styles={{ body: { padding: 16 } }}
            onClick={() => toggleCharge(charge, !isSelected(charge.chargeId))}
            style={{
              cursor: canPay ? 'pointer' : 'not-allowed',
              borderColor: isSelected(charge.chargeId) ? 'var(--app-primary)' : undefined,
              background: isSelected(charge.chargeId) ? 'var(--app-primary-soft-bg)' : undefined,
              opacity: canPay ? 1 : 0.72,
            }}
          >
            <Flex vertical gap={16}>
              <Flex justify="space-between" align="start" gap={16} wrap="wrap">
                <Flex gap={12} align="start">
                  <Tooltip title={disabledReasonKey ? t(disabledReasonKey) : ''}>
                    <span>
                      <Checkbox
                        checked={isSelected(charge.chargeId)}
                        disabled={!canPay}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => toggleCharge(charge, event.target.checked)}
                      />
                    </span>
                  </Tooltip>
                  <Flex vertical gap={6}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {charge.courseName}
                    </Typography.Title>
                    <Flex gap={8} wrap="wrap">
                      <Tag>{charge.courseCode}</Tag>
                      <Tag color={defaultChargeStatusStyle(charge.status)}>{charge.status}</Tag>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex vertical align="end" gap={2}>
                  <Typography.Text type="secondary">{amountLabel}</Typography.Text>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {formatCurrencyBasedOnCurrentLanguage(
                      nextInstallment?.amount ?? charge.remainingAmount
                    )}
                  </Typography.Title>
                </Flex>
              </Flex>

              <Divider style={{ margin: 0 }} />

              <Flex gap={24} wrap="wrap">
                <DetailCell
                  label={t('tuition-payment.charge.due_date')}
                  value={formatDateBasedOnCurrentLanguage(charge.paymentDueDate)}
                />
                <DetailCell
                  label={t('tuition-payment.charge.gross_amount')}
                  value={formatCurrencyBasedOnCurrentLanguage(charge.grossAmount)}
                />
                <DetailCell
                  label={t('tuition-payment.charge.net_payable')}
                  value={formatCurrencyBasedOnCurrentLanguage(charge.netPayable)}
                />
                <DetailCell
                  label={t('tuition-payment.charge.paid_amount')}
                  value={formatCurrencyBasedOnCurrentLanguage(charge.paidAmount)}
                />
                <DetailCell
                  label={t('tuition-payment.charge.fas')}
                  value={
                    hasFas
                      ? `${charge.appliedFasSchemeName}${charge.appliedFasTierName ? ` - ${charge.appliedFasTierName}` : ''}`
                      : t('tuition-payment.charge.no_fas')
                  }
                />
                {showInstallments && (
                  <DetailCell
                    label={t('tuition-payment.charge.next_installment')}
                    value={
                      nextInstallment
                        ? `${nextInstallment.installmentNumber}/${charge.installments.length} - ${nextInstallment.status}`
                        : t('tuition-payment.charge.completed')
                    }
                  />
                )}
              </Flex>

              {showInstallments && (
                <Flex justify="end">
                  <Button
                    type="link"
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(
                        routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(
                          routeUrls.TUITION_PAYMENT.INSTALLMENTS(charge.enrollmentId)
                        )
                      )
                    }}
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
