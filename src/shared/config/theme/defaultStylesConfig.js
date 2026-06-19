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
    [EnumConfig.CourseStatus.Active]: 'success',
    [EnumConfig.CourseStatus.Inactive]: 'default',
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
    [EnumConfig.AuditLogCategory.Authentication]: 'blue',
    [EnumConfig.AuditLogCategory.AccountManagement]: 'purple',
    [EnumConfig.AuditLogCategory.SecuritySetting]: 'volcano',
    [EnumConfig.AuditLogCategory.EmailWhitelist]: 'cyan',
    [EnumConfig.AuditLogCategory.Product]: 'green',
    [EnumConfig.AuditLogCategory.FavoriteProduct]: 'gold',
    [EnumConfig.AuditLogCategory.AuditLog]: 'default',
  }

  return map[category] || 'default'
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
