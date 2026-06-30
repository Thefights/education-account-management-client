export const EnumConfig = {
  AuthAccountStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
  },

  RoleId: {
    SystemAdmin: 1,
    FinanceAdmin: 2,
    SchoolAdmin: 3,
    AccountHolder: 4,
  },

  ProductAssignmentRole: {
    Student: 'Student',
    Staff: 'Staff',
    Trainer: 'Trainer',
  },

  ProductStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
  },

  RoleEnum: {
    SystemAdmin: 'SystemAdmin',
    FinanceAdmin: 'FinanceAdmin',
    SchoolAdmin: 'SchoolAdmin',
    AccountHolder: 'AccountHolder',
  },

  SchoolStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
  },

  CourseStatus: {
    Draft: 'Draft',
    Enrolling: 'Enrolling',
    Upcoming: 'Upcoming',
    InProgress: 'InProgress',
    Closed: 'Closed',
  },

  EnrollmentStatus: {
    Active: 'Active',
    Withdrawn: 'Withdrawn',
  },

  ChargeStatus: {
    PendingPayment: 'PendingPayment',
    Paid: 'Paid',
    Overdue: 'Overdue',
  },

  SchoolStudentStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
  },

  UserGender: {
    Unknown: 'Unknown',
    Male: 'Male',
    Female: 'Female',
    Other: 'Other',
  },

  UserStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
  },

  SocialProvider: {
    Google: 1,
    Microsoft365: 2,
    Facebook: 3,
  },

  AuditLogCategory: {
    AccountCreation: 'AccountCreation',
    StatusChange: 'StatusChange',
    Topup: 'Topup',
    Security: 'Security',
    Transaction: 'Transaction',
    Billing: 'Billing',
    AI: 'AI',
  },

  ManagementActionEntityType: {
    School: 'School',
    Admin: 'Admin',
    EducationAccount: 'EducationAccount',
    SchoolStudent: 'SchoolStudent',
    Course: 'Course',
    FasScheme: 'FasScheme',
    Enrollment: 'Enrollment',
    SystemTopup: 'SystemTopup',
    ScheduleTopUp: 'ScheduleTopUp',
  },

  ManagementAction: {
    Activate: 'Activate',
    Deactivate: 'Deactivate',
    Delete: 'Delete',
    Publish: 'Publish',
    Close: 'Close',
  },

  SweepAction: {
    Create: 'Create',
    Close: 'Close',
    Extend: 'Extend',
  },

  SweepTargetStatus: {
    Pending: 'Pending',
    Success: 'Success',
    Failed: 'Failed',
  },

  SystemTopupStatus: { Active: 'Active', Inactive: 'Inactive' },
  TopupLogicalOperator: { And: 'And', Or: 'Or' },
  TopupConditionField: { Age: 'Age', Balance: 'Balance', SchoolingStatus: 'SchoolingStatus' },
  TopupConditionOperator: {
    Equals: 'Equals',
    NotEquals: 'NotEquals',
    GreaterThan: 'GreaterThan',
    GreaterThanOrEqual: 'GreaterThanOrEqual',
    LessThan: 'LessThan',
    LessThanOrEqual: 'LessThanOrEqual',
    Between: 'Between',
  },
  TopupExecutionSourceType: { System: 'System', Schedule: 'Schedule', Manual: 'Manual' },
  TopupExecutionStatus: { Pending: 'Pending', Executing: 'Executing', Completed: 'Completed' },
  TopupTargetStatus: {
    Pending: 'Pending',
    Processing: 'Processing',
    Success: 'Success',
    Failed: 'Failed',
  },
  ScheduleTopupFrequencyId: { OneTime: 1, Monthly: 2, Yearly: 3 },
  ScheduleTopupStatusId: { Active: 1, Inactive: 2, Completed: 3 },
  FasSchemeStatus: { Active: 'active', Inactive: 'inactive', Draft: 'draft' },
  FasApplicationStatusId: { Pending: 1, Approved: 2, Rejected: 3, Withdrawn: 4, Draft: 5, Expired: 6 },
  FasApplicationStatus: {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
    Withdrawn: 'withdrawn',
    Draft: 'draft',
    Expired: 'expired',
  },
  FasGuardianNationalityId: { SingaporeCitizen: 1, Other: 2 },
  ScheduleTopupFrequency: { OneTime: 'OneTime', Monthly: 'Monthly', Yearly: 'Yearly' },
  ScheduleTopupStatus: { Active: 'Active', Inactive: 'Inactive', Completed: 'Completed' },
  StudentTuitionFilterStatus: {
    All: 'All',
    Due: 'Due',
    Overdue: 'Overdue',
    Paid: 'Paid',
  },
  EducationAccountStatus: {
    Active: 'Active',
    Extended: 'Extended',
    Closed: 'Closed',
  },
  EducationCreditTransactionType: {
    Topup: 'Topup',
    CourseFeePayment: 'CourseFeePayment',
    ExpiredBalance: 'ExpiredBalance',
  },
  EducationCreditTransactionDirection: {
    Credit: 'Credit',
    Debit: 'Debit',
  },
}
