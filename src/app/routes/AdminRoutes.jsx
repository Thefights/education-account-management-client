import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import AdminLayout from '@/app/layouts/AdminLayout'
import AccountManagementPage from '@/features/account-management/pages/AccountManagementPage'
import AuditLogPage from '@/features/audit-log/pages/AuditLogPage'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

const adminRoutes = [
  {
    path: routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX,
    element: <AuditLogPage title="Audit log" />,
  },
  {
    path: routeUrls.ADMIN.ACCOUNT_MANAGEMENT.INDEX,
    element: <AccountManagementPage />,
  },
]

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowRoles={[EnumConfig.RoleEnum.SystemAdmin]} />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={
              <Navigate
                to={routeUrls.BASE_ROUTE.ADMIN(routeUrls.ADMIN.AUDIT_LOG_MANAGEMENT.INDEX)}
                replace
              />
            }
          />
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default AdminRoutes
