export const ApiUrls = {
  AUTH: {
    INDEX: '/auth',
    ADMIN_AZURE_AD_LOGIN: '/auth/admin/azure-ad-login',
    MOCK_SINGPASS_LOGIN: '/auth/account-holder/mock-singpass-login',
    MOCK_ADMIN_LOGIN: '/auth/admin/mock-login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },

  AI_CHAT: {
    STATUS: '/ai-chat/status',
    CHAT: '/ai-chat',
  },

  AUDIT_LOG: {
    MANAGEMENT: {
      INDEX: '/audit-log-management',
      GET_ALL: '/audit-log-management/all',
      DETAIL: (id) => `/audit-log-management/${id}`,
      EXPORT: '/audit-log-management/export',
    },
  },

  MANAGEMENT_ACTION_LOG: {
    MANAGEMENT: {
      INDEX: '/management-action-log-management',
      GET_ALL: '/management-action-log-management/all',
      DETAIL: (id) => `/management-action-log-management/${id}`,
      EXPORT: '/management-action-log-management/export',
    },
  },

  APPLICATION_SETTING: {
    INDEX: '/application-setting-management',
  },

  ADMIN_MANAGEMENT: {
    INDEX: '/admin-management',
    GET_ALL: '/admin-management/all',
    DETAIL: (id) => `/admin-management/${id}`,
    UPDATE_STATUS: '/admin-management/status',
    DELETE_SELECTED: '/admin-management/selected',
    IMPORT: '/admin-management/import',
  },

  ADMIN_PROFILE: {
    CURRENT: '/admin-profile/current',
  },

  SCHOOL_MANAGEMENT: {
    INDEX: '/school-management',
    GET_ALL: '/school-management/all',
    DETAIL: (id) => `/school-management/${id}`,
    UPDATE_STATUS: '/school-management/status',
    DELETE_SELECTED: '/school-management/selected',
    IMPORT: '/school-management/import',
  },

  COURSE_MANAGEMENT: {
    INDEX: '/course-management',
    GET_ALL: '/course-management/all',
    DETAIL: (id) => `/course-management/${id}`,
    DUPLICATE: (id) => `/course-management/${id}/duplicate`,
    FAS_SCHEMES: (id) => `/course-management/${id}/fas-schemes`,
    PUBLISH: '/course-management/publish',
    DELETE_SELECTED: '/course-management/selected',
    IMPORT: '/course-management/import',
    ELIGIBLE_STUDENTS: (id) => `/course-management/${id}/eligible-students`,
    ENROLLMENTS: (id) => `/course-management/${id}/enrollments`,
  },

  ENROLLMENT_MANAGEMENT: {
    INDEX: '/enrollment-management',
    DETAIL: (id) => `/enrollment-management/${id}`,
    WITHDRAW: (id) => `/enrollment-management/${id}/withdraw`,
    DELETE_SELECTED: '/enrollment-management/selected',
  },

  SCHOOL_STUDENT_MANAGEMENT: {
    INDEX: '/school-student-management',
    DETAIL: (id) => `/school-student-management/${id}`,
    DELETE_SELECTED: '/school-student-management/selected',
    IMPORT: '/school-student-management/import',
  },

  EDUCATION_ACCOUNT: {
    INDEX: '/education-account-management',
    GET_ALL: '/education-account-management/all',
    DETAIL: (id) => `/education-account-management/${id}`,
    UPDATE_STATUS: '/education-account-management/status',
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
  SYSTEM_TOPUP: {
    INDEX: '/system-topup-management',
    GET_ALL: '/system-topup-management/all',
    DETAIL: (id) => `/system-topup-management/${id}`,
    UPDATE_STATUS: '/system-topup-management/status',
    DELETE_SELECTED: '/system-topup-management/selected',
  },
  SCHEDULE_TOPUP: {
    INDEX: '/schedule-top-up-management',
    GET_ALL: '/schedule-top-up-management/all',
    DETAIL: (id) => `/schedule-top-up-management/${id}`,
    UPDATE_STATUS: '/schedule-top-up-management/status',
    DELETE_SELECTED: '/schedule-top-up-management/selected',
  },
  FAS_SCHEME_MANAGEMENT: {
    INDEX: '/fas-scheme-management',
    GET_ALL: '/fas-scheme-management/all',
    DETAIL: (id) => `/fas-scheme-management/${id}`,
    UPDATE_STATUS: '/fas-scheme-management/status',
    DUPLICATE: (id) => `/fas-scheme-management/${id}/duplicate`,
    DELETE_SELECTED: '/fas-scheme-management/selected',
  },
  ACCOUNT_HOLDER: {
    PROFILE: '/account-holder/profile',
    TRANSACTIONS: '/transaction-history/account-holder/current',
    COURSES: '/account-holder/courses',
    TUITION_SUMMARY: '/account-holder/tuition-summary',
    TUITION_CHARGES: '/account-holder/tuition-charges',
    FAS_AVAILABLE_SCHEMES: '/account-holder/fas-schemes/available',
    FAS_APPLICATIONS: '/account-holder/fas-applications',
    FAS_APPLICATION_DETAIL: (id) => `/account-holder/fas-applications/${id}`,
    FAS_APPLICATION_REAPPLY_DRAFT: (id) => `/account-holder/fas-applications/${id}/reapply-draft`,
    FAS_APPLICATION_PUBLISH_DRAFT: (id) => `/account-holder/fas-applications/${id}/publish`,
    FAS_APPLICATION_WITHDRAW: (id) => `/account-holder/fas-applications/withdraw/${id}`,
  },
}
