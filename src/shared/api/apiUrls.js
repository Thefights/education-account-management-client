export const ApiUrls = {
  AUTH: {
    INDEX: '/auth',
    ADMIN_AZURE_AD_LOGIN: '/auth/admin/azure-ad-login',
    MOCK_SINGPASS_LOGIN: '/auth/account-holder/mock-singpass-login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },

  AUDIT_LOG: {
    MANAGEMENT: {
      INDEX: '/audit-log',
      DETAIL: (id) => `/audit-log/${id}`,
      EXPORT: '/audit-log/export',
    },
  },

  AI_ASSISTANT_SETTING: {
    INDEX: '/ai-assistant-setting',
  },

  ADMIN_MANAGEMENT: {
    INDEX: '/admin-management',
    DETAIL: (id) => `/admin-management/${id}`,
  },

  SCHOOL_MANAGEMENT: {
    INDEX: '/school-management',
    DETAIL: (id) => `/school-management/${id}`,
  },

  COURSE_MANAGEMENT: {
    INDEX: '/course-management',
    DETAIL: (id) => `/course-management/${id}`,
  },

  EDUCATION_ACCOUNT: {
    INDEX: '/education-account',
    DETAIL: (id) => `/education-account/${id}`,
    TRANSACTIONS: (id) => `/education-account/${id}/transactions`,
    IMPORT: '/education-account/import',
  },
  BATCH_REPORT: {
    INDEX: '/batch-reports',
    MANUAL_HANDLING: '/batch-reports/failed-records/manual-handling',
  },
  TOPUP: {
    VALIDATE_MANUAL: '/topup/manual/validate',
    EXECUTE_MANUAL: '/topup/manual/execute',
  },
  TOPUP_RULE: {
    INDEX: '/topup-rule',
    DETAIL: (id) => `/topup-rule/${id}`,
    UPDATE_STATUS: '/topup-rule/status',
  },
  TOPUP_SCHEDULE: {
    INDEX: '/topup-schedule',
    DETAIL: (id) => `/topup-schedule/${id}`,
  },
  ACCOUNT_HOLDER: {
    PROFILE: '/account-management/user/profile',
    TRANSACTIONS: '/account-management/user/transactions',
  },
}
