import SkeletonLoadingPage from '@/shared/components/skeletons/SkeletonLoadingPage'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAuth from '@/shared/hooks/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const GuestRoute = () => {
  const { auth, initialized } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return <SkeletonLoadingPage />
  }

  if (auth?.role) {
    let basePath = '/'
    if (auth.role === EnumConfig.RoleEnum.SystemAdmin)
      basePath = routeUrls.BASE_ROUTE.SYSTEM_ADMIN()
    else if (auth.role === EnumConfig.RoleEnum.FinanceAdmin)
      basePath = routeUrls.BASE_ROUTE.FINANCE_ADMIN()
    else if (auth.role === EnumConfig.RoleEnum.SchoolAdmin)
      basePath = routeUrls.BASE_ROUTE.SCHOOL_ADMIN()
    else if (auth.role === EnumConfig.RoleEnum.AccountHolder)
      basePath = routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()

    return <Navigate to={basePath} replace state={{ from: location }} />
  }

  return <Outlet />
}

export default GuestRoute
