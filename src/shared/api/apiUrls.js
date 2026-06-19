export const ApiUrls = {
  AUTH: {
    INDEX: '/auth',
    REGISTER: '/auth/register',
    SEND_REGISTER_EMAIL_OTP: '/auth/register/email-otp/send',
    VERIFY_REGISTER_EMAIL_OTP: '/auth/register/email-otp/verify',
    LOGIN: '/auth/login',
    ADMIN_AZURE_AD_LOGIN: '/auth/admin/azure-ad-login',
    MOCK_SINGPASS_LOGIN: '/auth/account-holder/mock-singpass-login',
    SOCIAL_LOGIN: '/auth/social-login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_MFA: '/auth/mfa/verify',
    VERIFY_OTP: '/auth/mfa/verify',
    RESEND_MFA_OTP: '/auth/mfa/resend',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  AUDIT_LOG: {
    MANAGEMENT: {
      INDEX: '/audit-log',
      DETAIL: (id) => `/audit-log/${id}`,
      EXPORT: '/audit-log/export',
    },
  },

  USER: {
    ME: '/user/me',
    MANAGEMENT: {
      INDEX: '/user-management',
      DETAIL: (id) => `/user-management/${id}`,
      GET_ALL: '/user-management/all',
      DELETE_SELECTED: '/user-management/selected',
      UPDATE_STATUS: '/user-management/status',
      IMPORT: '/user-management/import',
    },
  },

  AUTH_ACCOUNT: {
    ME: '/auth-account/me',
    UPDATE_ME: '/auth-account/me',
    MANAGEMENT: {
      INDEX: '/auth-account-management',
      DETAIL: (id) => `/auth-account-management/${id}`,
      GET_ALL: '/auth-account-management/all',
      DELETE_SELECTED: '/auth-account-management/selected',
      UPDATE_STATUS: '/auth-account-management/status',
      UNLOCK: '/auth-account-management/unlock',
      BATCH_IMPORT: '/auth-account-management/batch-import',
    },
  },

  PRODUCT: {
    GET_ALL: '/product/all',
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
}
