import { EnumConfig } from '@/shared/config/enumConfig'

export const defaultAuthAccountStatusStyle = (status) => {
  const map = {
    [EnumConfig.AuthAccountStatus.Active]: 'success',
    [EnumConfig.AuthAccountStatus.Inactive]: 'default',
  }

  return map[status] || 'default'
}

export const defaultUserStatusStyle = (status) => {
  const map = {
    [EnumConfig.UserStatus.Active]: 'success',
    [EnumConfig.UserStatus.Inactive]: 'default',
  }

  return map[status] || 'default'
}

export const defaultRoleStyle = (role) => {
  const map = {
    [EnumConfig.RoleEnum.SystemAdmin]: 'processing',
    [EnumConfig.RoleEnum.FinanceAdmin]: 'green',
    [EnumConfig.RoleEnum.SchoolAdmin]: 'blue',
    [EnumConfig.RoleEnum.AccountHolder]: 'default',
    [EnumConfig.RoleId.SystemAdmin]: 'processing',
    [EnumConfig.RoleId.FinanceAdmin]: 'green',
    [EnumConfig.RoleId.SchoolAdmin]: 'blue',
    [EnumConfig.RoleId.AccountHolder]: 'default',
  }

  return map[role] || 'default'
}

export const defaultManagementStatusStyle = (status) => {
  const map = {
    [EnumConfig.SchoolStatus.Active]: 'success',
    [EnumConfig.SchoolStatus.Inactive]: 'default',
    [EnumConfig.CourseStatus.Draft]: 'default',
    [EnumConfig.CourseStatus.Enrolling]: 'processing',
    [EnumConfig.CourseStatus.Upcoming]: 'warning',
    [EnumConfig.CourseStatus.InProgress]: 'success',
    [EnumConfig.CourseStatus.Closed]: 'default',
  }

  return map[status] || 'default'
}

export const defaultGenderStyle = (gender) => {
  const map = {
    [EnumConfig.UserGender.Male]: 'blue',
    [EnumConfig.UserGender.Female]: 'magenta',
    [EnumConfig.UserGender.Other]: 'purple',
    [EnumConfig.UserGender.Unknown]: 'default',
  }

  return map[gender] || 'default'
}

export const defaultProductAssignmentRoleStyle = (role) => {
  const map = {
    [EnumConfig.ProductAssignmentRole.Student]: 'green',
    [EnumConfig.ProductAssignmentRole.Staff]: 'blue',
    [EnumConfig.ProductAssignmentRole.Trainer]: 'gold',
  }

  return map[role] || 'default'
}

export const defaultAuditLogCategoryStyle = (category) => {
  const map = {
    [EnumConfig.AuditLogCategory.AccountCreation]: 'green',
    [EnumConfig.AuditLogCategory.StatusChange]: 'orange',
    [EnumConfig.AuditLogCategory.Topup]: 'cyan',
    [EnumConfig.AuditLogCategory.Security]: 'volcano',
    [EnumConfig.AuditLogCategory.Transaction]: 'blue',
    [EnumConfig.AuditLogCategory.Billing]: 'gold',
    [EnumConfig.AuditLogCategory.AI]: 'purple',
  }

  return map[category] || 'default'
}

export const defaultSweepActionStyle = (action) => {
  const map = {
    [EnumConfig.SweepAction.Create]: 'green',
    [EnumConfig.SweepAction.Close]: 'red',
    [EnumConfig.SweepAction.Extend]: 'orange',
  }

  return map[action] || 'default'
}

export const defaultSweepTargetStatusStyle = (status) => {
  const map = {
    [EnumConfig.SweepTargetStatus.Pending]: 'default',
    [EnumConfig.SweepTargetStatus.Success]: 'success',
    [EnumConfig.SweepTargetStatus.Failed]: 'error',
  }

  return map[status] || 'default'
}

export const defaultTopupStatusStyle = (status) => {
  const map = {
    Active: 'success',
    Inactive: 'default',
    Completed: 'processing',
  }

  return map[status] || 'default'
}

export const defaultTopupExecutionSourceStyle = (source) => {
  const map = { System: 'blue', Schedule: 'purple', Manual: 'cyan' }
  return map[source] || 'default'
}

export const defaultTopupExecutionStatusStyle = (status) => {
  const map = { Pending: 'default', Executing: 'processing', Completed: 'success' }
  return map[status] || 'default'
}

export const defaultTopupTargetStatusStyle = (status) => {
  const map = { Pending: 'default', Processing: 'processing', Success: 'success', Failed: 'error' }
  return map[status] || 'default'
}

export const defaultAuditLogActionStyle = (action) => {
  const map = {
    [EnumConfig.AuditLogAction.Login]: 'success',
    [EnumConfig.AuditLogAction.LoginFailed]: 'error',
    [EnumConfig.AuditLogAction.Logout]: 'default',
    [EnumConfig.AuditLogAction.CreateAccount]: 'processing',
    [EnumConfig.AuditLogAction.UpdateAccount]: 'warning',
    [EnumConfig.AuditLogAction.DeleteAccount]: 'error',
    [EnumConfig.AuditLogAction.DeleteAccounts]: 'error',
    [EnumConfig.AuditLogAction.UpdateAccountStatus]: 'warning',
    [EnumConfig.AuditLogAction.ImportAccounts]: 'processing',
    [EnumConfig.AuditLogAction.CreateProduct]: 'processing',
    [EnumConfig.AuditLogAction.UpdateProduct]: 'warning',
    [EnumConfig.AuditLogAction.DeleteProduct]: 'error',
    [EnumConfig.AuditLogAction.DeleteProducts]: 'error',
    [EnumConfig.AuditLogAction.ImportProducts]: 'processing',
  }

  return map[action] || 'default'
}

export const defaultChargeStatusStyle = (status) => {
  const map = {
    [EnumConfig.ChargeStatus.Unpaid]: 'error',
    [EnumConfig.ChargeStatus.PartiallyPaid]: 'warning',
    [EnumConfig.ChargeStatus.Paid]: 'success',
    [EnumConfig.ChargeStatus.Outstanding]: 'volcano',
  }

  return map[status] || 'default'
}
