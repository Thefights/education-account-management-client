import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { defaultChargeStatusStyle } from '@/shared/config/theme/defaultStylesConfig'
import useTranslation from '@/shared/hooks/useTranslation'
import EmptyRow from '@/shared/components/placeholders/EmptyRow'
import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import { formatDateBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import { ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Select,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import '../styles/tuitionPayment.css'
import {
  compareInstallmentDueDateThenNumber,
  isInstallmentDueForPayment,
} from '../utils/chargeStatusSort'

const getDisabledReasonKey = (charge) => {
  if (!charge.chargeId) return 'tuition-payment.charge.unavailable'
  if (charge.status === EnumConfig.ChargeStatus.Paid) return 'tuition-payment.charge.already_paid'
  if (charge.remainingAmount <= 0) return 'tuition-payment.charge.no_payable_balance'
  return null
}

const canPayCharge = (charge) =>
  Boolean(charge.chargeId) &&
  charge.status !== EnumConfig.ChargeStatus.Paid &&
  charge.remainingAmount > 0 &&
  (!charge.installments.length ||
    charge.installments.some((installment) => isInstallmentDueForPayment(installment)))

const DetailCell = ({ label, value, children }) => (
  <Flex vertical gap={2} style={{ minWidth: 120 }}>
    <Typography.Text type="secondary" style={{ fontWeight: 500 }}>
      {label}
    </Typography.Text>
    {children ?? <Typography.Text>{value}</Typography.Text>}
  </Flex>
)

const TuitionChargeList = ({
  charges,
  loading,
  selectedCharges,
  onSelectionChange,
  installmentCounts,
  onInstallmentCountChange,
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
        const dueInstallments = charge.installments
          .filter(isInstallmentDueForPayment)
          .sort(compareInstallmentDueDateThenNumber)
        const selectedInstallmentCount = Math.min(
          installmentCounts[charge.chargeId] ?? 1,
          dueInstallments.length
        )
        const selectedDueInstallments = dueInstallments.slice(0, selectedInstallmentCount)
        const firstDueInstallment = dueInstallments[0]
        const selectedDueAmount = selectedDueInstallments.reduce(
          (total, installment) => total + Number(installment.amount),
          0
        )
        const hasFas = Boolean(charge.appliedFasSchemeName)
        const disabledReasonKey = getDisabledReasonKey(charge)
        const amountLabel = showInstallments
          ? t('tuition-payment.charge.due_payment')
          : t('tuition-payment.charge.remaining_amount')
        const selected = isSelected(charge.chargeId)

        return (
          <Card
            key={charge.enrollmentId}
            className={`tuition-charge-card${selected ? ' tuition-charge-card--selected' : ''}`}
            styles={{ body: { padding: 16 } }}
            role="checkbox"
            aria-checked={selected}
            aria-disabled={!canPay}
            tabIndex={canPay ? 0 : -1}
            onClick={() => toggleCharge(charge, !selected)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              toggleCharge(charge, !selected)
            }}
            style={{
              cursor: canPay ? 'pointer' : 'not-allowed',
              opacity: canPay ? 1 : 0.72,
            }}
          >
            <Flex vertical gap={16}>
              <Flex justify="space-between" align="start" gap={16} wrap="wrap">
                <Flex gap={12} align="start">
                  <Tooltip title={disabledReasonKey ? t(disabledReasonKey) : ''}>
                    <span>
                      <Checkbox
                        className="tuition-charge-card__selector"
                        checked={selected}
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
                      <Typography.Text type="secondary" className="tuition-charge-card__code">
                        {charge.courseCode}
                      </Typography.Text>
                      <Tag color={defaultChargeStatusStyle(charge.status)}>{charge.status}</Tag>
                      {selected && (
                        <Tag color="blue" icon={<CheckCircleFilled />}>
                          {t('tuition-payment.charge.selected')}
                        </Tag>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex vertical align="end" gap={4} className="tuition-charge-card__payment">
                  <Typography.Text type="secondary">{amountLabel}</Typography.Text>
                  <Typography.Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                    {formatCurrencyBasedOnCurrentLanguage(
                      showInstallments ? selectedDueAmount : charge.remainingAmount
                    )}
                  </Typography.Title>
                  {showInstallments && (
                    <Flex vertical align="end" gap={6} onClick={(event) => event.stopPropagation()}>
                      <Typography.Text type="secondary" style={{ fontWeight: 500 }}>
                        {t('tuition-payment.charge.installments_to_pay')}
                      </Typography.Text>
                      <Select
                        aria-label={t('tuition-payment.charge.installments_to_pay')}
                        value={selectedInstallmentCount}
                        options={dueInstallments.map((_, index) => ({
                          value: index + 1,
                          label: t(
                            index === 0
                              ? 'tuition-payment.charge.installment_count_one'
                              : 'tuition-payment.charge.installment_count_many',
                            {
                              count: index + 1,
                            }
                          ),
                        }))}
                        onChange={(count) => {
                          onInstallmentCountChange(charge, count)
                          if (!selected) toggleCharge(charge, true)
                        }}
                      />
                      <Button
                        type="link"
                        className="tuition-charge-card__installment-link"
                        onClick={() =>
                          navigate(
                            routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(
                              routeUrls.TUITION_PAYMENT.INSTALLMENTS(charge.enrollmentId)
                            )
                          )
                        }
                      >
                        {t('tuition-payment.action.view_installments')} <ArrowRightOutlined />
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>

              <Divider className="tuition-charge-card__divider" />

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
                  <DetailCell label={t('tuition-payment.charge.current_installment')}>
                    {firstDueInstallment ? (
                      <Typography.Text>
                        {t('tuition-payment.charge.installment_progress', {
                          current: firstDueInstallment.installmentNumber,
                          total: charge.installments.length,
                        })}
                      </Typography.Text>
                    ) : (
                      <Typography.Text>{t('tuition-payment.charge.completed')}</Typography.Text>
                    )}
                  </DetailCell>
                )}
              </Flex>
            </Flex>
          </Card>
        )
      })}
    </Flex>
  )
}

export default TuitionChargeList
