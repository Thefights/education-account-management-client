export const routeUrls = {
  BASE_ROUTE: {
    AUTH: (route = '') => `/auth${route}`,
    TENANT: (route = '') => `/tenant${route}`,
    ADMIN: (route = '') => `/admin${route}`,
  },

  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_OTP: '/verify-otp',
    DATA_DELETION: '/data-deletion',
  },

  APP: {
    MY_SERVICE: '/',
    ACCOUNT: '/account',
    OLD_ACCOUNT_MANAGEMENT: '/account-management',
    SETTINGS: '/settings',
    REPORT: '/report',
  },

  TENANT: {
    HOME: '/',
    FAVORITE_PRODUCT: {
      INDEX: '/favorite-product',
      DETAIL: (id) => `/favorite-product/${id}`,
    },
  },

  ADMIN: {
    PROFILE: '/profile',
    AUDIT_LOG_MANAGEMENT: {
      INDEX: '/audit-log',
      DETAIL: (id) => `/audit-log/${id}`,
    },

    ACCOUNT_MANAGEMENT: {
      INDEX: '/account-management',
    },

    PRODUCT_MANAGEMENT: {
      INDEX: '/product-management',
    },

    MFA_SETTING: {
      INDEX: '/mfa-setting',
    },

    EMAIL_WHITELIST: {
      INDEX: '/email-whitelist',
    },

    EMAIL_WHITELIST_SETTING: {
      INDEX: '/email-whitelist-setting',
    },
  },
}

export const publicRouteUrls = [
  routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN),
  routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.REGISTER),
  routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.FORGOT_PASSWORD),
  routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.RESET_PASSWORD),
  routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.VERIFY_OTP),
]

export const isPublicRoute = (pathname = window.location.pathname) =>
  publicRouteUrls.some((route) => pathname === route || pathname.startsWith(`${route}/`))
