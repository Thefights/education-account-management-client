import { GoogleOAuthProvider } from '@react-oauth/google'
import { ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { Navigate, Route, BrowserRouter as RouterProvider, Routes } from 'react-router-dom'
import { Slide, ToastContainer } from 'react-toastify'
import AuthProvider from '@/app/providers/AuthProvider'
import ConfirmationProvider from '@/app/providers/ConfirmationProvider'
import AdminRoutes from '@/app/routes/AdminRoutes'
import AuthRoutes from '@/app/routes/AuthRoutes'
import RoleRoutes from '@/app/routes/RoleRoutes'
import { envConfig } from '@/shared/config/envConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { platformDarkTheme, platformLightTheme } from '@/shared/config/theme/themeConfig'
import { darkPalette, lightPalette } from '@/shared/config/theme/themePaletteConfig'
import ScrollToTop from '@/shared/hooks/ScrollToTop'
import { useLocalStorage } from '@/shared/hooks/useStorage'

const fixedDashboardDrawerPalette = {
  background: darkPalette.background.sider,
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: 'rgba(148, 163, 184, 0.24)',
  hoverBg: 'rgba(255, 255, 255, 0.08)',
  activeBg: 'rgba(99, 106, 188, 0.24)',
  activeText: darkPalette.primary.light,
}

function App() {
  const [themeMode] = useLocalStorage('theme', 'light')
  const isDark = themeMode === 'dark'
  const appTheme = isDark ? platformDarkTheme : platformLightTheme
  const appPalette = isDark ? darkPalette : lightPalette

  const appThemeWithFont = {
    ...appTheme,
    token: {
      ...appTheme.token,
      fontFamily: '"Open Sans", "Segoe UI", Segoe, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
    },
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg', appPalette.background.default)
    document.documentElement.style.setProperty(
      '--app-header-bg',
      appPalette.background.header || appPalette.background.paper
    )
    document.documentElement.style.setProperty(
      '--app-sider-bg',
      fixedDashboardDrawerPalette.background
    )
    document.documentElement.style.setProperty('--app-sider-text', fixedDashboardDrawerPalette.text)
    document.documentElement.style.setProperty(
      '--app-sider-text-muted',
      fixedDashboardDrawerPalette.textMuted
    )
    document.documentElement.style.setProperty(
      '--app-sider-border',
      fixedDashboardDrawerPalette.border
    )
    document.documentElement.style.setProperty(
      '--app-sider-hover-bg',
      fixedDashboardDrawerPalette.hoverBg
    )
    document.documentElement.style.setProperty(
      '--app-sider-active-bg',
      fixedDashboardDrawerPalette.activeBg
    )
    document.documentElement.style.setProperty(
      '--app-sider-active-text',
      fixedDashboardDrawerPalette.activeText
    )
    document.documentElement.style.setProperty('--app-border-color', appPalette.divider)
  }, [appPalette])

  return (
    <ConfigProvider theme={appThemeWithFont}>
      <RouterProvider>
        <ScrollToTop />
        <GoogleOAuthProvider clientId={envConfig.auth.googleClientId}>
          <AuthProvider>
            <ConfirmationProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate to={routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)} replace />
                  }
                />
                <Route path={`${routeUrls.BASE_ROUTE.AUTH()}/*`} element={<AuthRoutes />} />
                <Route path={`${routeUrls.BASE_ROUTE.ADMIN()}/*`} element={<AdminRoutes />} />
                <Route path="/*" element={<RoleRoutes />} />
              </Routes>
              <ToastContainer
                autoClose={3000}
                closeOnClick
                pauseOnHover
                theme={isDark ? 'dark' : 'light'}
                position="top-right"
                transition={Slide}
                limit={5}
              />
            </ConfirmationProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </RouterProvider>
    </ConfigProvider>
  )
}

export default App
