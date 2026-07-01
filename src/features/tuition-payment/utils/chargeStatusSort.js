import { EnumConfig } from '@/shared/config/enumConfig'

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
  return (
    Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()) <=
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
}

export const compareInstallmentDueDateThenNumber = (left, right) =>
  new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime() ||
  left.installmentNumber - right.installmentNumber
