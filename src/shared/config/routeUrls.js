export const routeUrls = {
  LANDING: {
    HOME: '/',
    FAQ: '/faq',
    CONTACT: '/contact',
  },
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
    DETAIL: (id = ':id') => `/admin-management/${id}`,
  },
  APPLICATION_SETTING: {
    INDEX: '/application-setting',
  },
  EDUCATION_ACCOUNTS: {
    INDEX: '/education-accounts',
    DETAIL: (id = ':id') => `/education-accounts/${id}`,
  },
  TUITION_PAYMENT: {
    INDEX: '/tuition-payment',
  },

  PAY: {
    INDEX: '/pay',
  },
  SWEEP_REPORTS: { INDEX: '/sweep-reports' },
  AUDIT_LOGS: { INDEX: '/audit-logs' },
  LOGS: {
    AUDIT: '/logs/audit',
    MANAGEMENT_ACTIONS: '/logs/management-actions',
    MANAGEMENT_ACTION_DETAIL: (id = ':id') => `/logs/management-actions/${id}`,
  },
  COURSE_MANAGEMENT: {
    INDEX: '/course-management',
    CREATE: '/course-management/create',
    DETAIL: (id = ':id') => `/course-management/${id}`,
    EDIT: (id = ':id') => `/course-management/${id}/edit`,
  },
  SCHOOL_STUDENT_MANAGEMENT: { INDEX: '/school-student' },
  TOPUP_MANAGEMENT: {
    INDEX: '/topup-management',
    SYSTEM_CREATE: '/topup-management/system/create',
    SYSTEM_DETAIL: (id = ':id') => `/topup-management/system/${id}`,
    SYSTEM_EDIT: (id = ':id') => `/topup-management/system/${id}/edit`,
    SCHEDULE_CREATE: '/topup-management/schedules/create',
    SCHEDULE_DETAIL: (id = ':id') => `/topup-management/schedules/${id}`,
    SCHEDULE_EDIT: (id = ':id') => `/topup-management/schedules/${id}/edit`,
    HISTORY: '/topup-management/history',
    HISTORY_DETAIL: (id = ':id') => `/topup-management/history/${id}`,
  },
  FAS_ADMIN: {
    SCHEMES: '/fas/schemes',
    APPLICATIONS: '/fas/applications',
  },
  LEGACY_TOPUP: {
    MANUAL: '/manual-topup',
    RULES: '/topup-rules',
    SCHEDULES: '/topup-schedules',
  },
  PROFILE: { INDEX: '/profile' },
  TRANSACTIONS: { INDEX: '/transactions' },
  MY_FAS: {
    APPLY: '/fas/apply',
    MANAGEMENT: '/fas/management',
  },
}

export const publicRouteUrls = [
  routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN),
  routeUrls.LANDING.HOME,
  routeUrls.LANDING.FAQ,
  routeUrls.LANDING.CONTACT,
]

export const isPublicRoute = (pathname = window.location.pathname) =>
  publicRouteUrls.some((route) => pathname === route || pathname.startsWith(`${route}/`))
