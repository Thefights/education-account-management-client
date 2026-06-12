import { EnumConfig } from '@/configs/enumConfig'
import { routeUrls } from '@/configs/routeUrls'
import LayoutAdmin from '@/layouts/LayoutAdmin'
import AccountManagementPage from '@/pages/admin/accountManagementPage/AccountManagementPage'
import AuditLogPage from '@/pages/admin/auditLogPage/AuditLogPage'
import EmailNotificationPage from '@/pages/admin/emailNotificationPage/EmailNotificationPage'
import MfaSettingPage from '@/pages/admin/mfaSettingPage/MfaSettingPage'
import PageNotFound from '@/pages/general/PageNotFound/PageNotFound'
import ProductManagementPage from '@/pages/admin/productManagementPage/ProductManagementPage'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

const RouteAdmin = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowRoles={[EnumConfig.RoleEnum.Admin]} />}>
        <Route element={<LayoutAdmin />}>
          <Route
            index
            element={
              <Navigate
                to={routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX)}
                replace
              />
            }
          />
          <Route
            path={routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX}
            element={<AuditLogPage title="Audit log" />}
          />
          <Route
            path={routeUrls.ADMIN.ACCOUNT_MANAGEMENT.INDEX}
            element={<AccountManagementPage />}
          />
          <Route
            path={routeUrls.ADMIN.PRODUCT_MANAGEMENT.INDEX}
            element={<ProductManagementPage />}
          />
          <Route path={routeUrls.ADMIN.MFA_SETTING.INDEX} element={<MfaSettingPage />} />
          <Route path={routeUrls.ADMIN.EMAIL_WHITELIST.INDEX} element={<EmailNotificationPage />} />
          <Route
            path={routeUrls.ADMIN.EMAIL_WHITELIST_SETTING.INDEX}
            element={<EmailNotificationPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default RouteAdmin
