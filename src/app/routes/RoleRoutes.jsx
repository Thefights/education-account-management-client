import AccountHolderLayout from '@/app/layouts/AccountHolderLayout'
import SchoolAdminLayout from '@/app/layouts/SchoolAdminLayout'
import FinanceAdminLayout from '@/app/layouts/FinanceAdminLayout'
import SystemAdminLayout from '@/app/layouts/SystemAdminLayout'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import RoleHomePage from '@/features/role-home/pages/RoleHomePage'
import AiAssistantSettingPage from '@/features/ai-assistant-setting/pages/AiAssistantSettingPage'
import AdminManagementPage from '@/features/admin-management/pages/AdminManagementPage'
import CourseManagementPage from '@/features/course-management/pages/CourseManagementPage'
import SchoolManagementPage from '@/features/school-management/pages/SchoolManagementPage'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { Route, Routes } from 'react-router-dom'

const roleRouteGroups = [
  {
    basePath: 'system-admin',
    role: EnumConfig.RoleEnum.SystemAdmin,
    Layout: SystemAdminLayout,
    routes: [
      {
        path: routeUrls.SYSTEM_ADMIN.SCHOOL_MANAGEMENT.INDEX,
        element: <SchoolManagementPage />,
      },
      {
        path: routeUrls.SYSTEM_ADMIN.ADMIN_MANAGEMENT.INDEX,
        element: <AdminManagementPage />,
      },
      {
        path: routeUrls.SYSTEM_ADMIN.AI_ASSISTANT_SETTING.INDEX,
        element: <AiAssistantSettingPage />,
      },
    ],
  },
  {
    basePath: 'finance-admin',
    role: EnumConfig.RoleEnum.FinanceAdmin,
    Layout: FinanceAdminLayout,
  },
  {
    basePath: 'school-admin',
    role: EnumConfig.RoleEnum.SchoolAdmin,
    Layout: SchoolAdminLayout,
    routes: [
      {
        path: routeUrls.SCHOOL_ADMIN.COURSE_MANAGEMENT.INDEX,
        element: <CourseManagementPage />,
      },
    ],
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
      {roleRouteGroups.map(({ basePath, role, Layout, routes = [] }) => (
        <Route key={role} path={`${basePath}/*`} element={<ProtectedRoute allowRoles={[role]} />}>
          <Route element={<Layout />}>
            <Route index element={<RoleHomePage role={role} />} />
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path.replace(/^\//, '')}
                element={route.element}
              />
            ))}
          </Route>
        </Route>
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default RoleRoutes
