import AppThemeProvider from '@/app/providers/AppThemeProvider'
import AuthProvider from '@/app/providers/AuthProvider'
import ConfirmationProvider from '@/app/providers/ConfirmationProvider'
import AppRoutes from '@/app/routes/AppRoutes'
import ScrollToTop from '@/shared/hooks/ScrollToTop'
import { BrowserRouter as RouterProvider } from 'react-router-dom'

function App() {
  return (
    <AppThemeProvider>
      <RouterProvider>
        <ScrollToTop />
        <AuthProvider>
          <ConfirmationProvider>
            <AppRoutes />
          </ConfirmationProvider>
        </AuthProvider>
      </RouterProvider>
    </AppThemeProvider>
  )
}

export default App
