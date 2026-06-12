import { EnumConfig } from '@/configs/enumConfig'
import { routeUrls } from '@/configs/routeUrls'
import LayoutTenant from '@/layouts/LayoutTenant'
import PageNotFound from '@/pages/general/PageNotFound/PageNotFound'
import FavoriteProductPage from '@/pages/tenant/favoriteProductPage/FavoriteProductPage'
import HomePage from '@/pages/tenant/homePage/HomePage'
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
