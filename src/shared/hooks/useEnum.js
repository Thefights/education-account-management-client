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
        value: EnumConfig.RoleId.SchoolAdmin,
        label: t('enum.role.school_admin'),
      },
      {
        value: EnumConfig.RoleId.AccountHolder,
        label: t('enum.role.account_holder'),
      },
    ],

    schoolStatusOptions: [
      { value: EnumConfig.SchoolStatus.Active, label: t('enum.school_status.active') },
      { value: EnumConfig.SchoolStatus.Inactive, label: t('enum.school_status.inactive') },
    ],

    courseStatusOptions: [
      { value: EnumConfig.CourseStatus.Active, label: t('enum.course_status.active') },
      { value: EnumConfig.CourseStatus.Inactive, label: t('enum.course_status.inactive') },
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
        value: EnumConfig.RoleEnum.SchoolAdmin,
        label: t('enum.role.school_admin'),
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
      { value: EnumConfig.AuditLogCategory.AccountCreation, label: 'Account Creation' },
      { value: EnumConfig.AuditLogCategory.StatusChange, label: 'Status Change' },
      { value: EnumConfig.AuditLogCategory.TopupConfig, label: 'Top-up Config' },
      { value: EnumConfig.AuditLogCategory.Security, label: 'Security' },
      { value: EnumConfig.AuditLogCategory.Transaction, label: 'Transaction' },
      { value: EnumConfig.AuditLogCategory.Billing, label: 'Billing' },
      { value: EnumConfig.AuditLogCategory.AI, label: 'AI' },
    ],
  }
}
