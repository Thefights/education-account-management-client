export const routeUrls = {
  BASE_ROUTE: {
    AUTH: (route = '') => `/auth${route}`,
    SYSTEM_ADMIN: (route = '') => `/system-admin${route}`,
    FINANCE_ADMIN: (route = '') => `/finance-admin${route}`,
    SCHOOL_ADMIN: (route = '') => `/school-admin${route}`,
    ACCOUNT_HOLDER: (route = '') => `/account-holder${route}`,
  },

  AUTH: {
    LOGIN: '/login',
  },

  ROLE_HOME: {
    INDEX: '/',
  },

  SCHOOL_MANAGEMENT: {
    INDEX: '/school-management',
  },
  ADMIN_MANAGEMENT: {
    INDEX: '/admin-management',
  },
  AI_ASSISTANT_SETTING: {
    INDEX: '/ai-assistant-setting',
  },
  EDUCATION_ACCOUNTS: {
    INDEX: '/education-accounts',
    DETAIL: (id = ':id') => `/education-accounts/${id}`,
  },
  BATCH_REPORTS: { INDEX: '/batch-reports' },
  AUDIT_LOGS: { INDEX: '/audit-logs' },
  COURSE_MANAGEMENT: { INDEX: '/course-management' },
  MANUAL_TOPUP: { INDEX: '/manual-topup' },
  TOPUP_RULES: { INDEX: '/topup-rules' },
  TOPUP_SCHEDULES: { INDEX: '/topup-schedules' },
  PROFILE: { INDEX: '/profile' },
  TRANSACTIONS: { INDEX: '/transactions' },
}

export const publicRouteUrls = [routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)]

export const isPublicRoute = (pathname = window.location.pathname) =>
  publicRouteUrls.some((route) => pathname === route || pathname.startsWith(`${route}/`))
