import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import LayoutAdmin from '@/app/layouts/LayoutAdmin'
import AccountManagementPage from '@/features/account-management/AccountManagementPage'
import AuditLogPage from '@/features/audit-log/AuditLogPage'
import EmailNotificationPage from '@/features/email-notification/EmailNotificationPage'
import MfaSettingPage from '@/features/mfa-setting/MfaSettingPage'
import PageNotFound from '@/features/not-found/PageNotFound'
import ProductManagementPage from '@/features/product-management/ProductManagementPage'
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
