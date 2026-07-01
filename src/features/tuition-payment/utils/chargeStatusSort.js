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

export const isInstallmentUnlockedForNextPayment = (installment) => {
  if (installment.status === EnumConfig.ChargeStatus.Paid) return false
  if (installment.status === EnumConfig.ChargeStatus.Overdue) return true
  return new Date(installment.dueDate).getTime() <= Date.now()
}

export const compareInstallmentDueDateThenNumber = (left, right) =>
  new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime() ||
  left.installmentNumber - right.installmentNumber
