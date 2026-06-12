import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import LayoutTenant from '@/app/layouts/LayoutTenant'
import PageNotFound from '@/features/not-found/PageNotFound'
import FavoriteProductPage from '@/features/favorite-product/FavoriteProductPage'
import HomePage from '@/features/tenant-home/HomePage'
import { Route, Routes } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

const RouteTenant = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute
            allowRoles={[EnumConfig.RoleEnum.TenantUser, EnumConfig.RoleEnum.Admin]}
          />
        }
      >
        <Route element={<LayoutTenant />}>
          <Route path={routeUrls.TENANT.HOME} index element={<HomePage />} />
          <Route path={routeUrls.TENANT.FAVORITE_PRODUCT.INDEX} element={<FavoriteProductPage />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default RouteTenant
