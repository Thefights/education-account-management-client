import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { Navigate } from 'react-router-dom'

const defaultRouteByRole = {
  [EnumConfig.RoleEnum.SystemAdmin]: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(
    routeUrls.SCHOOL_MANAGEMENT.INDEX
  ),
  [EnumConfig.RoleEnum.FinanceAdmin]: routeUrls.BASE_ROUTE.FINANCE_ADMIN(
    routeUrls.TOPUP_MANAGEMENT.INDEX
  ),
  [EnumConfig.RoleEnum.SchoolAdmin]: routeUrls.BASE_ROUTE.SCHOOL_ADMIN(
    routeUrls.COURSE_MANAGEMENT.INDEX
  ),
  [EnumConfig.RoleEnum.AccountHolder]: routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY),
}

const RoleHomePage = ({ role }) => {
  const defaultRoute = defaultRouteByRole[role]

  return <Navigate replace to={defaultRoute || routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)} />
}

export default RoleHomePage
