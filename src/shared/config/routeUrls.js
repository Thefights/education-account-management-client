export const routeUrls = {
  BASE_ROUTE: {
    AUTH: (route = '') => `/auth${route}`,
    ADMIN: (route = '') => `/admin${route}`,
  },

  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_OTP: '/verify-otp',
  },

  APP: {
    MY_SERVICE: '/',
    ACCOUNT: '/account',
    OLD_ACCOUNT_MANAGEMENT: '/account-management',
    SETTINGS: '/settings',
    REPORT: '/report',
  },

  ADMIN: {
    AUDIT_LOG_MANAGEMENT: {
      INDEX: '/audit-log',
      DETAIL: (id) => `/audit-log/${id}`,
    },

    ACCOUNT_MANAGEMENT: {
      INDEX: '/account-management',
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
