import { EnumConfig } from '@/shared/config/enumConfig'

export const PAYMENT_DUE_LEAD_DAYS = 5

export const getChargeStatusPriority = (status) => {
  if (status === EnumConfig.ChargeStatus.Overdue) return 0
  if (status === EnumConfig.ChargeStatus.PendingPayment) return 1
  if (status === EnumConfig.ChargeStatus.Paid) return 2
  return 3
}

export const compareChargeStatusThenInstallmentNumber = (left, right) =>
  getChargeStatusPriority(left.status) - getChargeStatusPriority(right.status) ||
  left.installmentNumber - right.installmentNumber

export const isInstallmentDueForPayment = (installment) => {
  if (installment.status === EnumConfig.ChargeStatus.Paid) return false
  const dueDate = new Date(installment.dueDate)
  if (Number.isNaN(dueDate.getTime())) return false
  const now = new Date()
  const payableThrough = new Date(now)
  payableThrough.setUTCDate(payableThrough.getUTCDate() + PAYMENT_DUE_LEAD_DAYS)
  return (
    Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()) <=
    Date.UTC(
      payableThrough.getUTCFullYear(),
      payableThrough.getUTCMonth(),
      payableThrough.getUTCDate()
    )
  )
}

export const compareInstallmentDueDateThenNumber = (left, right) =>
  new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime() ||
  left.installmentNumber - right.installmentNumber

export const getTuitionStatusLabel = (status, t) => {
  if (status === EnumConfig.ChargeStatus.PendingPayment) {
    return t('tuition-payment.status.Due')
  }
  const translated = t(`tuition-payment.status.${status}`)
  return translated === `tuition-payment.status.${status}` ? status : translated
}
