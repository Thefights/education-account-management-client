import AccountHolderLayout from '@/app/layouts/AccountHolderLayout'
import FinanceAdminLayout from '@/app/layouts/FinanceAdminLayout'
import SchoolAdminLayout from '@/app/layouts/SchoolAdminLayout'
import SystemAdminLayout from '@/app/layouts/SystemAdminLayout'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import AccountProfilePage from '@/features/account-holder/pages/AccountProfilePage'
import AccountTransactionHistoryPage from '@/features/account-holder/pages/AccountTransactionHistoryPage'
import AdminManagementPage from '@/features/admin-management/pages/AdminManagementPage'
import AiAssistantSettingPage from '@/features/ai-assistant-setting/pages/AiAssistantSettingPage'
import AuditLogPage from '@/features/audit-log/pages/AuditLogPage'
import BatchJobReportsPage from '@/features/batch-job-reports/pages/BatchJobReportsPage'
import CourseManagementPage from '@/features/course-management/pages/CourseManagementPage'
import EServiceAccountsPage from '@/features/education-accounts/pages/EServiceAccountsPage'
import EducationAccountDetailPage from '@/features/education-accounts/pages/EducationAccountDetailPage'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import RoleHomePage from '@/features/role-home/pages/RoleHomePage'
import SchoolManagementPage from '@/features/school-management/pages/SchoolManagementPage'
import ManualTopupPage from '@/features/topup/pages/ManualTopupPage'
import TopupRulesPage from '@/features/topup/pages/TopupRulesPage'
import TopupSchedulesPage from '@/features/topup/pages/TopupSchedulesPage'
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
        path: routeUrls.SCHOOL_MANAGEMENT.INDEX,
        element: <SchoolManagementPage />,
      },
      {
        path: routeUrls.ADMIN_MANAGEMENT.INDEX,
        element: <AdminManagementPage />,
      },
      {
        path: routeUrls.AI_ASSISTANT_SETTING.INDEX,
        element: <AiAssistantSettingPage />,
      },
      {
        path: routeUrls.EDUCATION_ACCOUNTS.INDEX,
        element: <EServiceAccountsPage />,
      },
      {
        path: routeUrls.EDUCATION_ACCOUNTS.DETAIL(),
        element: <EducationAccountDetailPage />,
      },
      {
        path: routeUrls.BATCH_REPORTS.INDEX,
        element: <BatchJobReportsPage />,
      },
      {
        path: routeUrls.AUDIT_LOGS.INDEX,
        element: <AuditLogPage />,
      },
    ],
  },
  {
    basePath: 'finance-admin',
    role: EnumConfig.RoleEnum.FinanceAdmin,
    Layout: FinanceAdminLayout,
    routes: [
      { path: routeUrls.MANUAL_TOPUP.INDEX, element: <ManualTopupPage /> },
      { path: routeUrls.TOPUP_RULES.INDEX, element: <TopupRulesPage /> },
      { path: routeUrls.TOPUP_SCHEDULES.INDEX, element: <TopupSchedulesPage /> },
    ],
  },
  {
    basePath: 'school-admin',
    role: EnumConfig.RoleEnum.SchoolAdmin,
    Layout: SchoolAdminLayout,
    routes: [
      {
        path: routeUrls.COURSE_MANAGEMENT.INDEX,
        element: <CourseManagementPage />,
      },
    ],
  },
  {
    basePath: 'account-holder',
    role: EnumConfig.RoleEnum.AccountHolder,
    Layout: AccountHolderLayout,
    routes: [
      { path: routeUrls.PROFILE.INDEX, element: <AccountProfilePage /> },
      {
        path: routeUrls.TRANSACTIONS.INDEX,
        element: <AccountTransactionHistoryPage />,
      },
    ],
  },
]

const RoleRoutes = () => {
  return (
    <Routes>
      {roleRouteGroups.map(({ basePath, role, Layout, routes = [] }) => (
        <Route
          key={role}
          path={`${basePath}/*`}
          element={
            <ProtectedRoute
              allowRoles={
                role === EnumConfig.RoleEnum.SystemAdmin
                  ? [role]
                  : [role, EnumConfig.RoleEnum.SystemAdmin]
              }
            />
          }
        >
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
