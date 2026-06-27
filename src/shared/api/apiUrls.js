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
    UPDATE_STATUS: '/admin-management/status',
    IMPORT: '/admin-management/import',
  },

  SCHOOL_MANAGEMENT: {
    INDEX: '/school-management',
    GET_ALL: '/school-management/all',
    DETAIL: (id) => `/school-management/${id}`,
    UPDATE_STATUS: '/school-management/status',
    IMPORT: '/school-management/import',
  },

  COURSE_MANAGEMENT: {
    INDEX: '/course-management',
    GET_ALL: '/course-management/all',
    DETAIL: (id) => `/course-management/${id}`,
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
  },
  SCHEDULE_TOPUP: {
    INDEX: '/schedule-top-up-management',
    GET_ALL: '/schedule-top-up-management/all',
    DETAIL: (id) => `/schedule-top-up-management/${id}`,
    UPDATE_STATUS: '/schedule-top-up-management/status',
  },
  ACCOUNT_HOLDER: {
    PROFILE: '/account-holder/profile',
    TRANSACTIONS: '/transaction-history/account-holder/current',
    COURSES: '/account-holder/courses',
    TUITION_SUMMARY: '/account-holder/tuition-summary',
    TUITION_CHARGES: '/account-holder/tuition-charges',
  },
}
