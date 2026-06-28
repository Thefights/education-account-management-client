import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { getRoleFromAccessToken } from '@/shared/utils/authTokenUtil'

const getReturnUrlByRole = (role) => {
  switch (String(role || '').toLowerCase()) {
    case EnumConfig.RoleEnum.SystemAdmin.toLowerCase():
      return routeUrls.BASE_ROUTE.SYSTEM_ADMIN()
    case EnumConfig.RoleEnum.FinanceAdmin.toLowerCase():
      return routeUrls.BASE_ROUTE.FINANCE_ADMIN()
    case EnumConfig.RoleEnum.SchoolAdmin.toLowerCase():
      return routeUrls.BASE_ROUTE.SCHOOL_ADMIN()
    case EnumConfig.RoleEnum.AccountHolder.toLowerCase():
      return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()
    default:
      return routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)
  }
}

export const getReturnUrlByAuthTokens = (tokens) => {
  const accessToken = typeof tokens === 'string' ? tokens : tokens?.accessToken
  const role = getRoleFromAccessToken(accessToken)

  return getReturnUrlByRole(role)
}
