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
      INDEX: '/audit-log-management',
      GET_ALL: '/audit-log-management/all',
      DETAIL: (id) => `/audit-log-management/${id}`,
      EXPORT: '/audit-log-management/export',
    },
  },

  AI_ASSISTANT_SETTING: {
    INDEX: '/ai-assistant-setting-management',
  },

  ADMIN_MANAGEMENT: {
    INDEX: '/admin-management',
    GET_ALL: '/admin-management/all',
    DETAIL: (id) => `/admin-management/${id}`,
  },

  SCHOOL_MANAGEMENT: {
    INDEX: '/school-management',
    GET_ALL: '/school-management/all',
    DETAIL: (id) => `/school-management/${id}`,
  },

  COURSE_MANAGEMENT: {
    INDEX: '/course-management',
    GET_ALL: '/course-management/all',
    DETAIL: (id) => `/course-management/${id}`,
  },

  EDUCATION_ACCOUNT: {
    INDEX: '/education-account-management',
    GET_ALL: '/education-account-management/all',
    DETAIL: (id) => `/education-account-management/${id}`,
    TRANSACTIONS: (id) => `/transaction-history/admin/education-accounts/${id}`,
    IMPORT: '/education-account-management/import',
  },
  SWEEP_REPORT: {
    INDEX: '/education-account-sweep-report-management',
    TARGETS: (batchDate) => `/education-account-sweep-report-management/${batchDate}/targets`,
    MANUAL_HANDLING: '/education-account-sweep-report-management/failed-records/manual-handling',
  },
  TOPUP: {
    EXECUTE_MANUAL: '/topup-management/manual/execute',
    ELIGIBLE_ACCOUNTS: '/topup-management/eligible-accounts',
    HISTORY: '/topup-management/history',
    HISTORY_DETAIL: (id) => `/topup-management/history/${id}`,
    HISTORY_TARGETS: (id) => `/topup-management/history/${id}/targets`,
  },
  TOPUP_RULE: {
    INDEX: '/topup-rule-management',
    GET_ALL: '/topup-rule-management/all',
    DETAIL: (id) => `/topup-rule-management/${id}`,
    UPDATE_STATUS: '/topup-rule-management/status',
  },
  TOPUP_SCHEDULE: {
    INDEX: '/topup-schedule-management',
    GET_ALL: '/topup-schedule-management/all',
    DETAIL: (id) => `/topup-schedule-management/${id}`,
    UPDATE_STATUS: '/topup-schedule-management/status',
  },
  ACCOUNT_HOLDER: {
    PROFILE: '/account-holder/profile',
    TRANSACTIONS: '/transaction-history/account-holder/current',
  },
}
