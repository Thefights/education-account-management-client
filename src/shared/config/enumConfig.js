export const EnumConfig = {
  AuthAccountStatus: {
    Active: 'Active',
    Inactive: 'Inactive',
  },

  RoleId: {
    SystemAdmin: 1,
    FinanceAdmin: 2,
    CourseAdmin: 3,
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
    CourseAdmin: 'CourseAdmin',
    AccountHolder: 'AccountHolder',
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
    Authentication: 'Authentication',
    AccountManagement: 'AccountManagement',
    SecuritySetting: 'SecuritySetting',
    EmailWhitelist: 'EmailWhitelist',
    Product: 'Product',
    FavoriteProduct: 'FavoriteProduct',
    AuditLog: 'AuditLog',
  },

  AuditLogAction: {
    Register: 'Register',
    SendRegisterEmailOtp: 'SendRegisterEmailOtp',
    VerifyRegisterEmailOtp: 'VerifyRegisterEmailOtp',
    Login: 'Login',
    LoginFailed: 'LoginFailed',
    SocialLogin: 'SocialLogin',
    Logout: 'Logout',
    RefreshToken: 'RefreshToken',
    VerifyMfaOtp: 'VerifyMfaOtp',
    ForgotPassword: 'ForgotPassword',
    ResetPassword: 'ResetPassword',
    CreateAccount: 'CreateAccount',
    UpdateAccount: 'UpdateAccount',
    DeleteAccount: 'DeleteAccount',
    DeleteAccounts: 'DeleteAccounts',
    UpdateAccountStatus: 'UpdateAccountStatus',
    ImportAccounts: 'ImportAccounts',
    UpdateMfaSetting: 'UpdateMfaSetting',
    UpdateEmailWhitelistSetting: 'UpdateEmailWhitelistSetting',
    SaveEmailWhitelist: 'SaveEmailWhitelist',
    CreateProduct: 'CreateProduct',
    UpdateProduct: 'UpdateProduct',
    DeleteProduct: 'DeleteProduct',
    DeleteProducts: 'DeleteProducts',
    ImportProducts: 'ImportProducts',
    AddFavoriteProduct: 'AddFavoriteProduct',
    RemoveFavoriteProduct: 'RemoveFavoriteProduct',
    ViewAuditLogs: 'ViewAuditLogs',
  },
}
