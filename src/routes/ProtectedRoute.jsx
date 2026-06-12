import SkeletonLoadingPage from '@/components/skeletons/SkeletonLoadingPage'
import { routeUrls } from '@/configs/routeUrls'
import useAuth from '@/hooks/useAuth'
import PageNotFound from '@/pages/general/PageNotFound/PageNotFound'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const ProtectedRoute = ({
  allowRoles = [],
  redirectPath = routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN),
}) => {
  const location = useLocation()

  const { auth, initialized } = useAuth()

  const hasRole = (roles) => {
    if (!auth?.role) return false
    return roles.map((r) => String(r).toLowerCase()).includes(auth.role.toLowerCase())
  }

  if (!initialized) {
    return <SkeletonLoadingPage />
  }

  if (allowRoles.length === 0) return <Outlet />

  if (!auth?.role) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />
  }

  if (!hasRole(allowRoles)) {
    return <PageNotFound />
  }

  return <Outlet />
}

export default ProtectedRoute
