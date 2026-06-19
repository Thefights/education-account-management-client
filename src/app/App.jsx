import AppThemeProvider from '@/app/providers/AppThemeProvider'
import AuthProvider from '@/app/providers/AuthProvider'
import ConfirmationProvider from '@/app/providers/ConfirmationProvider'
import AuthRoutes from '@/app/routes/AuthRoutes'
import RoleRoutes from '@/app/routes/RoleRoutes'
import { routeUrls } from '@/shared/config/routeUrls'
import ScrollToTop from '@/shared/hooks/ScrollToTop'
import { Navigate, Route, BrowserRouter as RouterProvider, Routes } from 'react-router-dom'

function App() {
  return (
    <AppThemeProvider>
      <RouterProvider>
        <ScrollToTop />
        <AuthProvider>
          <ConfirmationProvider>
            <Routes>
              <Route
                path="/"
                element={<Navigate to={routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)} replace />}
              />
              <Route path={`${routeUrls.BASE_ROUTE.AUTH()}/*`} element={<AuthRoutes />} />
              <Route path="/*" element={<RoleRoutes />} />
            </Routes>
          </ConfirmationProvider>
        </AuthProvider>
      </RouterProvider>
    </AppThemeProvider>
  )
}

export default App
