import AccountHolderLayout from '@/app/layouts/AccountHolderLayout'
import CourseAdminLayout from '@/app/layouts/CourseAdminLayout'
import FinanceAdminLayout from '@/app/layouts/FinanceAdminLayout'
import SystemAdminLayout from '@/app/layouts/SystemAdminLayout'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import RoleHomePage from '@/features/role-home/pages/RoleHomePage'
import { EnumConfig } from '@/shared/config/enumConfig'
import { Route, Routes } from 'react-router-dom'

const roleRouteGroups = [
  {
    basePath: 'system-admin',
    role: EnumConfig.RoleEnum.SystemAdmin,
    Layout: SystemAdminLayout,
  },
  {
    basePath: 'finance-admin',
    role: EnumConfig.RoleEnum.FinanceAdmin,
    Layout: FinanceAdminLayout,
  },
  {
    basePath: 'course-admin',
    role: EnumConfig.RoleEnum.CourseAdmin,
    Layout: CourseAdminLayout,
  },
  {
    basePath: 'account-holder',
    role: EnumConfig.RoleEnum.AccountHolder,
    Layout: AccountHolderLayout,
  },
]

const RoleRoutes = () => {
  return (
    <Routes>
      {roleRouteGroups.map(({ basePath, role, Layout }) => (
        <Route key={role} path={`${basePath}/*`} element={<ProtectedRoute allowRoles={[role]} />}>
          <Route element={<Layout />}>
            <Route index element={<RoleHomePage role={role} />} />
          </Route>
        </Route>
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default RoleRoutes
