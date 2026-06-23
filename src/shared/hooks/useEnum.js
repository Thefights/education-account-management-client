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
      { value: EnumConfig.CourseStatus.Draft, label: t('enum.course_status.draft') },
      { value: EnumConfig.CourseStatus.Enrolling, label: t('enum.course_status.enrolling') },
      { value: EnumConfig.CourseStatus.Upcoming, label: t('enum.course_status.upcoming') },
      { value: EnumConfig.CourseStatus.InProgress, label: t('enum.course_status.in_progress') },
      { value: EnumConfig.CourseStatus.Closed, label: t('enum.course_status.closed') },
    ],

    schoolStudentStatusOptions: [
      {
        value: EnumConfig.SchoolStudentStatus.Active,
        label: t('enum.school_student_status.active'),
      },
      {
        value: EnumConfig.SchoolStudentStatus.Inactive,
        label: t('enum.school_student_status.inactive'),
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

    sweepActionOptions: [
      { value: EnumConfig.SweepAction.Create, label: t('enum.sweep_action.create') },
      { value: EnumConfig.SweepAction.Close, label: t('enum.sweep_action.close') },
      { value: EnumConfig.SweepAction.Extend, label: t('enum.sweep_action.extend') },
    ],

    sweepActionFilterOptions: [
      { value: EnumConfig.SweepActionId.Create, label: t('enum.sweep_action.create') },
      { value: EnumConfig.SweepActionId.Close, label: t('enum.sweep_action.close') },
      { value: EnumConfig.SweepActionId.Extend, label: t('enum.sweep_action.extend') },
    ],

    sweepTargetStatusFilterOptions: [
      {
        value: EnumConfig.SweepTargetStatusId.Pending,
        label: t('enum.sweep_target_status.pending'),
      },
      {
        value: EnumConfig.SweepTargetStatusId.Success,
        label: t('enum.sweep_target_status.success'),
      },
      { value: EnumConfig.SweepTargetStatusId.Failed, label: t('enum.sweep_target_status.failed') },
    ],

    sweepTargetStatusOptions: [
      { value: EnumConfig.SweepTargetStatus.Pending, label: t('enum.sweep_target_status.pending') },
      { value: EnumConfig.SweepTargetStatus.Success, label: t('enum.sweep_target_status.success') },
      { value: EnumConfig.SweepTargetStatus.Failed, label: t('enum.sweep_target_status.failed') },
    ],

    topupRuleTypeIdOptions: [
      { value: EnumConfig.TopupRuleTypeId.System, label: t('topup.system_tab') },
      { value: EnumConfig.TopupRuleTypeId.Schedule, label: t('topup.schedule_tab') },
    ],

    topupRuleTypeOptions: [
      { value: EnumConfig.TopupRuleType.System, label: t('topup.system_tab') },
      { value: EnumConfig.TopupRuleType.Schedule, label: t('topup.schedule_tab') },
    ],

    topupMatchModeIdOptions: [
      { value: EnumConfig.TopupMatchModeId.And, label: 'AND' },
      { value: EnumConfig.TopupMatchModeId.Or, label: 'OR' },
    ],

    topupMatchModeOptions: [
      { value: EnumConfig.TopupMatchMode.And, label: 'AND' },
      { value: EnumConfig.TopupMatchMode.Or, label: 'OR' },
    ],

    topupExecutionSourceTypeIdOptions: [
      { value: EnumConfig.TopupExecutionSourceTypeId.System, label: t('topup.system_tab') },
      { value: EnumConfig.TopupExecutionSourceTypeId.Schedule, label: t('topup.schedule_tab') },
      { value: EnumConfig.TopupExecutionSourceTypeId.Manual, label: t('topup.manual_tab') },
    ],

    topupExecutionSourceTypeOptions: [
      { value: EnumConfig.TopupExecutionSourceType.System, label: t('topup.system_tab') },
      { value: EnumConfig.TopupExecutionSourceType.Schedule, label: t('topup.schedule_tab') },
      { value: EnumConfig.TopupExecutionSourceType.Manual, label: t('topup.manual_tab') },
    ],

    topupExecutionStatusIdOptions: [
      { value: EnumConfig.TopupExecutionStatusId.Pending, label: t('topup.pending') },
      { value: EnumConfig.TopupExecutionStatusId.Executing, label: t('topup.executing') },
      { value: EnumConfig.TopupExecutionStatusId.Completed, label: t('topup.completed') },
    ],

    topupExecutionStatusOptions: [
      { value: EnumConfig.TopupExecutionStatus.Pending, label: t('topup.pending') },
      { value: EnumConfig.TopupExecutionStatus.Executing, label: t('topup.executing') },
      { value: EnumConfig.TopupExecutionStatus.Completed, label: t('topup.completed') },
    ],

    topupTargetStatusIdOptions: [
      { value: EnumConfig.TopupTargetStatusId.Pending, label: t('topup.pending') },
      { value: EnumConfig.TopupTargetStatusId.Processing, label: t('topup.processing') },
      { value: EnumConfig.TopupTargetStatusId.Success, label: t('topup.succeeded') },
      { value: EnumConfig.TopupTargetStatusId.Failed, label: t('topup.failed') },
    ],

    topupTargetStatusOptions: [
      { value: EnumConfig.TopupTargetStatus.Pending, label: t('topup.pending') },
      { value: EnumConfig.TopupTargetStatus.Processing, label: t('topup.processing') },
      { value: EnumConfig.TopupTargetStatus.Success, label: t('topup.succeeded') },
      { value: EnumConfig.TopupTargetStatus.Failed, label: t('topup.failed') },
    ],

    topupScheduleTypeIdOptions: [
      { value: EnumConfig.TopupScheduleTypeId.OneTime, label: t('topup_form.one_time') },
      { value: EnumConfig.TopupScheduleTypeId.Monthly, label: t('topup_form.monthly') },
      { value: EnumConfig.TopupScheduleTypeId.Yearly, label: t('topup_form.yearly') },
    ],

    topupScheduleTypeOptions: [
      { value: 'OneTime', label: t('topup_form.one_time') },
      { value: 'Monthly', label: t('topup_form.monthly') },
      { value: 'Yearly', label: t('topup_form.yearly') },
    ],

    topupScheduleStatusIdOptions: [
      { value: EnumConfig.TopupScheduleStatusId.Active, label: t('topup_form.active') },
      { value: EnumConfig.TopupScheduleStatusId.Inactive, label: t('topup_form.inactive') },
      { value: EnumConfig.TopupScheduleStatusId.Completed, label: t('topup_form.completed') },
    ],

    topupScheduleStatusOptions: [
      { value: 'Active', label: t('topup_form.active') },
      { value: 'Inactive', label: t('topup_form.inactive') },
      { value: 'Completed', label: t('topup_form.completed') },
    ],
  }
}
