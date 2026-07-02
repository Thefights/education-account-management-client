import AccountHolderLayout from '@/app/layouts/AccountHolderLayout'
import FinanceAdminLayout from '@/app/layouts/FinanceAdminLayout'
import SchoolAdminLayout from '@/app/layouts/SchoolAdminLayout'
import SystemAdminLayout from '@/app/layouts/SystemAdminLayout'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import AccountHolderCourseManagementPage from '@/features/account-holder-course-management/pages/AccountHolderCourseManagementPage'
import AccountProfilePage from '@/features/account-holder/pages/AccountProfilePage'
import AccountTransactionHistoryPage from '@/features/account-holder/pages/AccountTransactionHistoryPage'
import AdminManagementDetailPage from '@/features/admin-management/pages/AdminManagementDetailPage'
import AdminManagementPage from '@/features/admin-management/pages/AdminManagementPage'
import AdminProfilePage from '@/features/admin-profile/pages/AdminProfilePage'
import ApplicationSettingPage from '@/features/application-setting/pages/ApplicationSettingPage'
import AuditLogManagementPage from '@/features/audit-log/pages/AuditLogManagementPage'
import CourseDetailPage from '@/features/course-management/pages/CourseDetailPage'
import CourseManagementFormPage from '@/features/course-management/pages/CourseManagementFormPage'
import CourseManagementPage from '@/features/course-management/pages/CourseManagementPage'
import EServiceAccountsPage from '@/features/education-accounts/pages/EServiceAccountsPage'
import EducationAccountDetailPage from '@/features/education-accounts/pages/EducationAccountDetailPage'
import FasApplicationQueuePage from '@/features/financial-assistance/pages/FasApplicationQueuePage'
import FasSchemeCreatePage from '@/features/financial-assistance/pages/FasSchemeCreatePage'
import FasSchemeDetailPage from '@/features/financial-assistance/pages/FasSchemeDetailPage'
import FasSchemeManagementPage from '@/features/financial-assistance/pages/FasSchemeManagementPage'
import MyFasApplyPage from '@/features/financial-assistance/pages/MyFasApplyPage'
import MyFasManagementPage from '@/features/financial-assistance/pages/MyFasManagementPage'
import ManagementActionLogDetailPage from '@/features/management-action-log/pages/ManagementActionLogDetailPage'
import ManagementActionLogManagementPage from '@/features/management-action-log/pages/ManagementActionLogManagementPage'
import PageNotFound from '@/features/not-found/pages/PageNotFound'
import RoleHomePage from '@/features/role-home/pages/RoleHomePage'
import SchoolManagementDetailPage from '@/features/school-management/pages/SchoolManagementDetailPage'
import SchoolManagementPage from '@/features/school-management/pages/SchoolManagementPage'
import SchoolStudentManagementPage from '@/features/school-student-management/pages/SchoolStudentManagementPage'
import SweepReportsPage from '@/features/sweep-reports/pages/SweepReportsPage'
import TopupConfigurationDetailPage from '@/features/topup/pages/TopupConfigurationDetailPage'
import TopupConfigurationFormPage from '@/features/topup/pages/TopupConfigurationFormPage'
import TopupHistoryDetailPage from '@/features/topup/pages/TopupHistoryDetailPage'
import TopupHistoryPage from '@/features/topup/pages/TopupHistoryPage'
import TopupManagementPage from '@/features/topup/pages/TopupManagementPage'
import TuitionPaymentPage from '@/features/tuition-payment/pages/TuitionPaymentPage'
import SupportTicketManagement from '@/features/support-ticket/SupportTicketManagement'
import MySupportTicketsPage from '@/features/support-ticket/pages/MySupportTicketsPage'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { Navigate, Route, Routes } from 'react-router-dom'

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
        path: routeUrls.SCHOOL_MANAGEMENT.DETAIL(),
        element: <SchoolManagementDetailPage />,
      },
      {
        path: routeUrls.ADMIN_MANAGEMENT.INDEX,
        element: <AdminManagementPage />,
      },
      {
        path: routeUrls.ADMIN_MANAGEMENT.DETAIL(),
        element: <AdminManagementDetailPage />,
      },
      {
        path: routeUrls.PROFILE.INDEX,
        element: <AdminProfilePage />,
      },
      {
        path: routeUrls.APPLICATION_SETTING.INDEX,
        element: <ApplicationSettingPage />,
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
        path: routeUrls.ACCOUNT_CREATION_REPORT.INDEX,
        element: <SweepReportsPage />,
      },
      {
        path: routeUrls.AUDIT_LOGS.INDEX,
        element: <Navigate replace to={routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.LOGS.AUDIT)} />,
      },
      {
        path: routeUrls.LOGS.AUDIT,
        element: <AuditLogManagementPage />,
      },
      {
        path: routeUrls.LOGS.MANAGEMENT_ACTIONS,
        element: <ManagementActionLogManagementPage />,
      },
      {
        path: routeUrls.LOGS.MANAGEMENT_ACTION_DETAIL(),
        element: <ManagementActionLogDetailPage />,
      },
      {
        path: routeUrls.SUPPORT_TICKETS.INDEX,
        element: <SupportTicketManagement />,
      },
    ],
  },
  {
    basePath: 'finance-admin',
    role: EnumConfig.RoleEnum.FinanceAdmin,
    Layout: FinanceAdminLayout,
    routes: [
      { path: routeUrls.PROFILE.INDEX, element: <AdminProfilePage /> },
      { path: routeUrls.TOPUP_MANAGEMENT.INDEX, element: <TopupManagementPage /> },
      {
        path: routeUrls.TOPUP_MANAGEMENT.SYSTEM_CREATE,
        element: <TopupConfigurationFormPage type="system" mode="create" />,
      },
      {
        path: routeUrls.TOPUP_MANAGEMENT.SYSTEM_EDIT(),
        element: <TopupConfigurationDetailPage type="system" />,
      },
      {
        path: routeUrls.TOPUP_MANAGEMENT.SYSTEM_DETAIL(),
        element: <TopupConfigurationDetailPage type="system" />,
      },
      {
        path: routeUrls.TOPUP_MANAGEMENT.SCHEDULE_CREATE,
        element: <TopupConfigurationFormPage type="schedule" mode="create" />,
      },
      {
        path: routeUrls.TOPUP_MANAGEMENT.SCHEDULE_EDIT(),
        element: <TopupConfigurationDetailPage type="schedule" />,
      },
      {
        path: routeUrls.TOPUP_MANAGEMENT.SCHEDULE_DETAIL(),
        element: <TopupConfigurationDetailPage type="schedule" />,
      },
      { path: routeUrls.TOPUP_MANAGEMENT.HISTORY, element: <TopupHistoryPage /> },
      { path: routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(), element: <TopupHistoryDetailPage /> },
      {
        path: routeUrls.LEGACY_TOPUP.MANUAL,
        element: (
          <Navigate
            replace
            to={routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX)}
          />
        ),
      },
      {
        path: routeUrls.LEGACY_TOPUP.RULES,
        element: (
          <Navigate
            replace
            to={routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX)}
          />
        ),
      },
      {
        path: routeUrls.LEGACY_TOPUP.SCHEDULES,
        element: (
          <Navigate
            replace
            to={routeUrls.BASE_ROUTE.FINANCE_ADMIN(routeUrls.TOPUP_MANAGEMENT.INDEX)}
          />
        ),
      },
    ],
  },
  {
    basePath: 'school-admin',
    role: EnumConfig.RoleEnum.SchoolAdmin,
    Layout: SchoolAdminLayout,
    routes: [
      { path: routeUrls.PROFILE.INDEX, element: <AdminProfilePage /> },
      {
        path: routeUrls.FAS_ADMIN.INDEX,
        element: (
          <Navigate replace to={routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEMES)} />
        ),
      },
      { path: routeUrls.FAS_ADMIN.SCHEMES, element: <FasSchemeManagementPage /> },
      { path: routeUrls.FAS_ADMIN.SCHEME_CREATE, element: <FasSchemeCreatePage /> },
      { path: routeUrls.FAS_ADMIN.SCHEME_DETAIL(), element: <FasSchemeDetailPage /> },
      { path: routeUrls.FAS_ADMIN.APPLICATIONS, element: <FasApplicationQueuePage /> },
      {
        path: routeUrls.COURSE_MANAGEMENT.INDEX,
        element: <CourseManagementPage />,
      },
      {
        path: routeUrls.COURSE_MANAGEMENT.CREATE,
        element: <CourseManagementFormPage />,
      },
      {
        path: routeUrls.COURSE_MANAGEMENT.EDIT(),
        element: <CourseDetailPage />,
      },
      {
        path: routeUrls.COURSE_MANAGEMENT.DETAIL(),
        element: <CourseDetailPage />,
      },
      {
        path: routeUrls.SCHOOL_STUDENT_MANAGEMENT.INDEX,
        element: <SchoolStudentManagementPage />,
      },
    ],
  },
  {
    basePath: 'account-holder',
    role: EnumConfig.RoleEnum.AccountHolder,
    Layout: AccountHolderLayout,
    routes: [
      {
        path: routeUrls.MY_FAS.INDEX,
        element: <Navigate replace to={routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.APPLY)} />,
      },
      { path: routeUrls.MY_FAS.APPLY, element: <MyFasApplyPage /> },
      { path: routeUrls.MY_FAS.MANAGEMENT, element: <MyFasManagementPage /> },
      { path: routeUrls.PROFILE.INDEX, element: <AccountProfilePage /> },
      { path: routeUrls.TRANSACTION_HISTORY.INDEX, element: <AccountTransactionHistoryPage /> },
      {
        path: routeUrls.COURSE_MANAGEMENT.INDEX,
        element: <AccountHolderCourseManagementPage />,
      },
      {
        path: routeUrls.TUITION_PAYMENT.INDEX + '/*',
        element: <TuitionPaymentPage />,
      },
      {
        path: routeUrls.SUPPORT_TICKETS.INDEX,
        element: <MySupportTicketsPage />,
      },
    ],
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
