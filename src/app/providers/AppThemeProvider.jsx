import { platformDarkTheme, platformLightTheme } from '@/shared/config/theme/themeConfig'
import { darkPalette, lightPalette } from '@/shared/config/theme/themePaletteConfig'
import { useLocalStorage } from '@/shared/hooks/useStorage'
import { ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

const dashboardDrawerPalette = {
  background: darkPalette.background.sider,
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: 'rgba(148, 163, 184, 0.24)',
  hoverBg: 'rgba(255, 255, 255, 0.08)',
  activeBg: 'rgba(99, 106, 188, 0.24)',
  activeText: darkPalette.primary.light,
}

const setCssVariables = (palette) => {
  const root = document.documentElement
  const variables = {
    '--app-bg': palette.background.default,
    '--app-header-bg': palette.background.header || palette.background.paper,
    '--app-sider-bg': dashboardDrawerPalette.background,
    '--app-sider-text': dashboardDrawerPalette.text,
    '--app-sider-text-muted': dashboardDrawerPalette.textMuted,
    '--app-sider-border': dashboardDrawerPalette.border,
    '--app-sider-hover-bg': dashboardDrawerPalette.hoverBg,
    '--app-sider-active-bg': dashboardDrawerPalette.activeBg,
    '--app-sider-active-text': dashboardDrawerPalette.activeText,
    '--app-border-color': palette.divider,
  }

  Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value))
}

const AppThemeProvider = ({ children }) => {
  const [themeMode] = useLocalStorage('theme', 'light')
  const isDark = themeMode === 'dark'
  const palette = isDark ? darkPalette : lightPalette
  const baseTheme = isDark ? platformDarkTheme : platformLightTheme
  const theme = {
    ...baseTheme,
    token: {
      ...baseTheme.token,
      fontFamily: '"Open Sans", "Segoe UI", Segoe, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
    },
  }

  useEffect(() => setCssVariables(palette), [palette])

  return (
    <ConfigProvider theme={theme}>
      {children}
      <ToastContainer
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
        position="top-right"
        transition={Slide}
        limit={5}
      />
    </ConfigProvider>
  )
}

export default AppThemeProvider
