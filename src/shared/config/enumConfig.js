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
    Active: 'Active',
    Inactive: 'Inactive',
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
    TopupConfig: 'TopupConfig',
    Security: 'Security',
    Transaction: 'Transaction',
    Billing: 'Billing',
    AI: 'AI',
  },

  SweepAction: {
    Create: 'Create',
    Close: 'Close',
    Extend: 'Extend',
  },

  SweepActionId: {
    Create: 0,
    Close: 1,
    Extend: 2,
  },

  SweepTargetStatusId: {
    Pending: 0,
    Success: 1,
    Failed: 2,
  },

  SweepTargetStatus: {
    Pending: 'Pending',
    Success: 'Success',
    Failed: 'Failed',
  },

  TopupRuleTypeId: { System: 1, Schedule: 2 },
  TopupRuleType: { System: 'System', Schedule: 'Schedule' },
  TopupMatchModeId: { And: 1, Or: 2 },
  TopupMatchMode: { And: 'And', Or: 'Or' },
  TopupExecutionSourceTypeId: { System: 1, Schedule: 2, Manual: 3 },
  TopupExecutionSourceType: { System: 'System', Schedule: 'Schedule', Manual: 'Manual' },
  TopupExecutionStatusId: { Pending: 1, Executing: 2, Completed: 3 },
  TopupExecutionStatus: { Pending: 'Pending', Executing: 'Executing', Completed: 'Completed' },
  TopupTargetStatusId: { Pending: 1, Processing: 2, Success: 3, Failed: 4 },
  TopupTargetStatus: {
    Pending: 'Pending',
    Processing: 'Processing',
    Success: 'Success',
    Failed: 'Failed',
  },
  TopupScheduleTypeId: { OneTime: 1, Monthly: 2, Yearly: 3 },
  TopupScheduleStatusId: { Active: 1, Inactive: 2, Completed: 3 },
}
