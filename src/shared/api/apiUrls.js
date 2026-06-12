export const ApiUrls = {
  AUTH: {
    INDEX: '/auth',
    REGISTER: '/auth/register',
    SEND_REGISTER_EMAIL_OTP: '/auth/register/email-otp/send',
    VERIFY_REGISTER_EMAIL_OTP: '/auth/register/email-otp/verify',
    LOGIN: '/auth/login',
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
    GET_FAVORITES: '/product/favorites',
    MY_SERVICES: '/product/my-services',
    APP_STORE: '/product/app-store',
    FAVORITE: (productId) => `/product/${productId}/favorite`,
    MANAGEMENT: {
      INDEX: '/product-management',
      DETAIL: (id) => `/product-management/${id}`,
      GET_ALL: '/product-management/all',
      DELETE_SELECTED: '/product-management/selected',
      UPDATE_STATUS: '/product-management/status',
      IMPORT: '/product-management/import',
      BATCH_IMPORT: '/product-management/batch-import',
    },
  },

  USER_PRODUCT_ASSIGNMENT: {
    INDEX: '/user-product-assignment',
    GET_ALL: '/user-product-assignment/all',
    BY_USER: (userId) => `/user-product-assignment/by-user/${userId}`,
    BY_PRODUCT: (productId) => `/user-product-assignment/by-product/${productId}`,
  },

  MFA_SETTING: {
    INDEX: '/mfa-setting',
  },

  EMAIL_WHITELIST: {
    INDEX: '/email-whitelist',
    GET_ALL: '/email-whitelist/all',
  },

  EMAIL_WHITELIST_SETTING: {
    INDEX: '/email-whitelist-setting',
  },
}
