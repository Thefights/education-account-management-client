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

    chargeStatusOptions: [
      {
        value: EnumConfig.ChargeStatus.PendingPayment,
        label: t('enum.charge_status.pending_payment'),
      },
      { value: EnumConfig.ChargeStatus.Paid, label: t('enum.charge_status.paid') },
      {
        value: EnumConfig.ChargeStatus.Overdue,
        label: t('enum.charge_status.overdue'),
      },
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
      { value: EnumConfig.AuditLogCategory.Topup, label: 'Top-up' },
      { value: EnumConfig.AuditLogCategory.Security, label: 'Security' },
      { value: EnumConfig.AuditLogCategory.Transaction, label: 'Transaction' },
      { value: EnumConfig.AuditLogCategory.Billing, label: 'Billing' },
      { value: EnumConfig.AuditLogCategory.AI, label: 'AI' },
    ],

    managementActionEntityTypeOptions: [
      { value: EnumConfig.ManagementActionEntityType.School, label: 'School' },
      { value: EnumConfig.ManagementActionEntityType.Admin, label: 'Admin' },
      { value: EnumConfig.ManagementActionEntityType.EducationAccount, label: 'Education Account' },
      { value: EnumConfig.ManagementActionEntityType.SchoolStudent, label: 'School Student' },
      { value: EnumConfig.ManagementActionEntityType.Course, label: 'Course' },
      { value: EnumConfig.ManagementActionEntityType.FasScheme, label: 'FAS Scheme' },
      { value: EnumConfig.ManagementActionEntityType.Enrollment, label: 'Enrollment' },
      { value: EnumConfig.ManagementActionEntityType.SystemTopup, label: 'System Top-up' },
      { value: EnumConfig.ManagementActionEntityType.ScheduleTopUp, label: 'Schedule Top-up' },
    ],

    managementActionOptions: [
      { value: EnumConfig.ManagementAction.Activate, label: 'Activate' },
      { value: EnumConfig.ManagementAction.Deactivate, label: 'Deactivate' },
      { value: EnumConfig.ManagementAction.Delete, label: 'Delete' },
      { value: EnumConfig.ManagementAction.Publish, label: 'Publish' },
      { value: EnumConfig.ManagementAction.Close, label: 'Close' },
    ],

    sweepActionOptions: [
      { value: EnumConfig.SweepAction.Create, label: t('enum.sweep_action.create') },
      { value: EnumConfig.SweepAction.Close, label: t('enum.sweep_action.close') },
      { value: EnumConfig.SweepAction.Extend, label: t('enum.sweep_action.extend') },
    ],

    sweepTargetStatusOptions: [
      { value: EnumConfig.SweepTargetStatus.Pending, label: t('enum.sweep_target_status.pending') },
      { value: EnumConfig.SweepTargetStatus.Success, label: t('enum.sweep_target_status.success') },
      { value: EnumConfig.SweepTargetStatus.Failed, label: t('enum.sweep_target_status.failed') },
    ],

    enrollmentStatusOptions: [
      { value: EnumConfig.EnrollmentStatus.Active, label: t('enum.enrollment_status.active') },
      {
        value: EnumConfig.EnrollmentStatus.Withdrawn,
        label: t('enum.enrollment_status.withdrawn'),
      },
    ],

    systemTopupStatusOptions: [
      { value: EnumConfig.SystemTopupStatus.Active, label: t('topup_form.active') },
      { value: EnumConfig.SystemTopupStatus.Inactive, label: t('topup_form.inactive') },
    ],

    topupExecutionSourceTypeOptions: [
      { value: EnumConfig.TopupExecutionSourceType.System, label: t('topup.system_tab') },
      { value: EnumConfig.TopupExecutionSourceType.Schedule, label: t('topup.schedule_tab') },
      { value: EnumConfig.TopupExecutionSourceType.Manual, label: t('topup.manual_tab') },
    ],

    topupExecutionStatusOptions: [
      { value: EnumConfig.TopupExecutionStatus.Pending, label: t('topup.pending') },
      { value: EnumConfig.TopupExecutionStatus.Executing, label: t('topup.executing') },
      { value: EnumConfig.TopupExecutionStatus.Completed, label: t('topup.completed') },
    ],

    topupTargetStatusOptions: [
      { value: EnumConfig.TopupTargetStatus.Pending, label: t('topup.pending') },
      { value: EnumConfig.TopupTargetStatus.Processing, label: t('topup.processing') },
      { value: EnumConfig.TopupTargetStatus.Success, label: t('topup.succeeded') },
      { value: EnumConfig.TopupTargetStatus.Failed, label: t('topup.failed') },
    ],

    scheduleTopupFrequencyOptions: [
      { value: EnumConfig.ScheduleTopupFrequency.OneTime, label: t('topup_form.one_time') },
      { value: EnumConfig.ScheduleTopupFrequency.Monthly, label: t('topup_form.monthly') },
      { value: EnumConfig.ScheduleTopupFrequency.Yearly, label: t('topup_form.yearly') },
    ],

    scheduleTopupStatusOptions: [
      { value: EnumConfig.ScheduleTopupStatus.Active, label: t('topup_form.active') },
      { value: EnumConfig.ScheduleTopupStatus.Inactive, label: t('topup_form.inactive') },
      { value: EnumConfig.ScheduleTopupStatus.Completed, label: t('topup_form.completed') },
    ],

    studentTuitionFilterStatusOptions: [
      { value: EnumConfig.StudentTuitionFilterStatus.Overdue, label: t('text.overdue') },
      { value: EnumConfig.StudentTuitionFilterStatus.Due, label: t('text.due') },
      { value: EnumConfig.StudentTuitionFilterStatus.Paid, label: t('text.paid') },
    ],

    educationAccountStatusOptions: [
      { value: EnumConfig.EducationAccountStatus.Active, label: t('topup_form.active') },
      { value: EnumConfig.EducationAccountStatus.Extended, label: 'Extended' },
      { value: EnumConfig.EducationAccountStatus.Closed, label: t('course_management.status.closed') },
    ],

    educationCreditTransactionTypeOptions: [
      { value: EnumConfig.EducationCreditTransactionType.Topup, label: 'Top-up' },
      { value: EnumConfig.EducationCreditTransactionType.CourseFeePayment, label: 'Course Fee Payment' },
      { value: EnumConfig.EducationCreditTransactionType.ExpiredBalance, label: 'Expired Balance' },
    ],

    educationCreditTransactionDirectionOptions: [
      { value: EnumConfig.EducationCreditTransactionDirection.Credit, label: 'Credit' },
      { value: EnumConfig.EducationCreditTransactionDirection.Debit, label: 'Debit' },
    ],

    paymentPlanOptions: [
      { value: EnumConfig.PaymentPlanMonths.Full, label: t('enum.payment_plan_months.full') },
      { value: EnumConfig.PaymentPlanMonths.ThreeMonths, label: t('enum.payment_plan_months.three_months') },
      { value: EnumConfig.PaymentPlanMonths.SixMonths, label: t('enum.payment_plan_months.six_months') },
      { value: EnumConfig.PaymentPlanMonths.NineMonths, label: t('enum.payment_plan_months.nine_months') },
      { value: EnumConfig.PaymentPlanMonths.TwelveMonths, label: t('enum.payment_plan_months.twelve_months') },
    ],
  }
}
