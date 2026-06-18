import { EnumConfig } from '@/shared/config/enumConfig'
import useTranslation from './useTranslation'

export default function useEnum() {
  const { t } = useTranslation()

  return {
    authAccountStatusOptions: [
      {
        value: EnumConfig.AuthAccountStatus.Active,
        label: t('enum.auth_account_status.active'),
      },
      {
        value: EnumConfig.AuthAccountStatus.Inactive,
        label: t('enum.auth_account_status.inactive'),
      },
    ],

    roleIdOptions: [
      {
        value: EnumConfig.RoleId.SystemAdmin,
        label: t('enum.role.system_admin'),
      },
      {
        value: EnumConfig.RoleId.FinanceAdmin,
        label: t('enum.role.finance_admin'),
      },
      {
        value: EnumConfig.RoleId.CourseAdmin,
        label: t('enum.role.course_admin'),
      },
      {
        value: EnumConfig.RoleId.AccountHolder,
        label: t('enum.role.account_holder'),
      },
    ],

    productAssignmentRoleOptions: [
      {
        value: EnumConfig.ProductAssignmentRole.Student,
        label: t('enum.product_assignment_role.student'),
      },
      {
        value: EnumConfig.ProductAssignmentRole.Staff,
        label: t('enum.product_assignment_role.staff'),
      },
      {
        value: EnumConfig.ProductAssignmentRole.Trainer,
        label: t('enum.product_assignment_role.trainer'),
      },
    ],

    productStatusOptions: [
      {
        value: EnumConfig.ProductStatus.Active,
        label: t('enum.product_status.active'),
      },
      {
        value: EnumConfig.ProductStatus.Inactive,
        label: t('enum.product_status.inactive'),
      },
    ],

    roleOptions: [
      {
        value: EnumConfig.RoleEnum.SystemAdmin,
        label: t('enum.role.system_admin'),
      },
      {
        value: EnumConfig.RoleEnum.FinanceAdmin,
        label: t('enum.role.finance_admin'),
      },
      {
        value: EnumConfig.RoleEnum.CourseAdmin,
        label: t('enum.role.course_admin'),
      },
      {
        value: EnumConfig.RoleEnum.AccountHolder,
        label: t('enum.role.account_holder'),
      },
    ],

    genderOptions: [
      {
        value: EnumConfig.UserGender.Unknown,
        label: t('enum.gender.unknown'),
      },
      {
        value: EnumConfig.UserGender.Male,
        label: t('enum.gender.male'),
      },
      {
        value: EnumConfig.UserGender.Female,
        label: t('enum.gender.female'),
      },
      {
        value: EnumConfig.UserGender.Other,
        label: t('enum.gender.other'),
      },
    ],

    userStatusOptions: [
      {
        value: EnumConfig.UserStatus.Active,
        label: t('enum.user_status.active'),
      },
      {
        value: EnumConfig.UserStatus.Inactive,
        label: t('enum.user_status.inactive'),
      },
    ],

    auditLogCategoryOptions: [
      {
        value: EnumConfig.AuditLogCategory.Authentication,
        label: t('audit_log.category.authentication'),
      },
      {
        value: EnumConfig.AuditLogCategory.AccountManagement,
        label: t('audit_log.category.account_management'),
      },
      {
        value: EnumConfig.AuditLogCategory.SecuritySetting,
        label: t('audit_log.category.security_setting'),
      },
      {
        value: EnumConfig.AuditLogCategory.EmailWhitelist,
        label: t('audit_log.category.email_whitelist'),
      },
      {
        value: EnumConfig.AuditLogCategory.Product,
        label: t('audit_log.category.product'),
      },
      {
        value: EnumConfig.AuditLogCategory.FavoriteProduct,
        label: t('audit_log.category.favorite_product'),
      },
      {
        value: EnumConfig.AuditLogCategory.AuditLog,
        label: t('audit_log.category.audit_log'),
      },
    ],

    auditLogActionOptions: [
      {
        value: EnumConfig.AuditLogAction.Register,
        label: t('audit_log.action.register'),
      },
      {
        value: EnumConfig.AuditLogAction.SendRegisterEmailOtp,
        label: t('audit_log.action.send_register_email_otp'),
      },
      {
        value: EnumConfig.AuditLogAction.VerifyRegisterEmailOtp,
        label: t('audit_log.action.verify_register_email_otp'),
      },
      {
        value: EnumConfig.AuditLogAction.Login,
        label: t('audit_log.action.login'),
      },
      {
        value: EnumConfig.AuditLogAction.LoginFailed,
        label: t('audit_log.action.login_failed'),
      },
      {
        value: EnumConfig.AuditLogAction.SocialLogin,
        label: t('audit_log.action.social_login'),
      },
      {
        value: EnumConfig.AuditLogAction.Logout,
        label: t('audit_log.action.logout'),
      },
      {
        value: EnumConfig.AuditLogAction.RefreshToken,
        label: t('audit_log.action.refresh_token'),
      },
      {
        value: EnumConfig.AuditLogAction.VerifyMfaOtp,
        label: t('audit_log.action.verify_mfa_otp'),
      },
      {
        value: EnumConfig.AuditLogAction.ForgotPassword,
        label: t('audit_log.action.forgot_password'),
      },
      {
        value: EnumConfig.AuditLogAction.ResetPassword,
        label: t('audit_log.action.reset_password'),
      },
      {
        value: EnumConfig.AuditLogAction.CreateAccount,
        label: t('audit_log.action.create_account'),
      },
      {
        value: EnumConfig.AuditLogAction.UpdateAccount,
        label: t('audit_log.action.update_account'),
      },
      {
        value: EnumConfig.AuditLogAction.DeleteAccount,
        label: t('audit_log.action.delete_account'),
      },
      {
        value: EnumConfig.AuditLogAction.DeleteAccounts,
        label: t('audit_log.action.delete_accounts'),
      },
      {
        value: EnumConfig.AuditLogAction.UpdateAccountStatus,
        label: t('audit_log.action.update_account_status'),
      },
      {
        value: EnumConfig.AuditLogAction.ImportAccounts,
        label: t('audit_log.action.import_accounts'),
      },
      {
        value: EnumConfig.AuditLogAction.UpdateMfaSetting,
        label: t('audit_log.action.update_mfa_setting'),
      },
      {
        value: EnumConfig.AuditLogAction.UpdateEmailWhitelistSetting,
        label: t('audit_log.action.update_email_whitelist_setting'),
      },
      {
        value: EnumConfig.AuditLogAction.SaveEmailWhitelist,
        label: t('audit_log.action.save_email_whitelist'),
      },
      {
        value: EnumConfig.AuditLogAction.CreateProduct,
        label: t('audit_log.action.create_product'),
      },
      {
        value: EnumConfig.AuditLogAction.UpdateProduct,
        label: t('audit_log.action.update_product'),
      },
      {
        value: EnumConfig.AuditLogAction.DeleteProduct,
        label: t('audit_log.action.delete_product'),
      },
      {
        value: EnumConfig.AuditLogAction.DeleteProducts,
        label: t('audit_log.action.delete_products'),
      },
      {
        value: EnumConfig.AuditLogAction.ImportProducts,
        label: t('audit_log.action.import_products'),
      },
      {
        value: EnumConfig.AuditLogAction.AddFavoriteProduct,
        label: t('audit_log.action.add_favorite_product'),
      },
      {
        value: EnumConfig.AuditLogAction.RemoveFavoriteProduct,
        label: t('audit_log.action.remove_favorite_product'),
      },
      {
        value: EnumConfig.AuditLogAction.ViewAuditLogs,
        label: t('audit_log.action.view_audit_logs'),
      },
    ],
  }
}
