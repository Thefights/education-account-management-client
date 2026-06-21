import { platformDarkTheme, platformLightTheme } from '@/shared/config/theme/themeConfig'
import { darkPalette, lightPalette } from '@/shared/config/theme/themePaletteConfig'
import { useLocalStorage } from '@/shared/hooks/useStorage'
import { ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

const dashboardDrawerPalette = {
  background: lightPalette.background.sider,
  text: '#334155',
  textMuted: '#7B8DA4',
  border: '#DCE9F6',
  hoverBg: 'rgba(40, 120, 227, 0.08)',
  activeBg: '#D5E9FF',
  activeText: lightPalette.primary.dark,
}

const darkDashboardDrawerPalette = {
  background: darkPalette.background.sider,
  text: '#E8F0F8',
  textMuted: '#91A5B9',
  border: 'rgba(137, 171, 204, 0.14)',
  hoverBg: 'rgba(106, 168, 247, 0.09)',
  activeBg: 'rgba(106, 168, 247, 0.17)',
  activeText: darkPalette.primary.light,
}

const setCssVariables = (palette, isDark) => {
  const root = document.documentElement
  const drawerPalette = isDark ? darkDashboardDrawerPalette : dashboardDrawerPalette
  const variables = {
    '--app-bg': palette.background.default,
    '--app-header-bg': palette.background.header || palette.background.paper,
    '--app-sider-bg': drawerPalette.background,
    '--app-sider-text': drawerPalette.text,
    '--app-sider-text-muted': drawerPalette.textMuted,
    '--app-sider-border': drawerPalette.border,
    '--app-sider-hover-bg': drawerPalette.hoverBg,
    '--app-sider-active-bg': drawerPalette.activeBg,
    '--app-sider-active-text': drawerPalette.activeText,
    '--app-border-color': palette.divider,
    '--app-filter-bg': isDark ? palette.grey[100] : '#F8FBFE',
    '--app-card-shadow': isDark
      ? '0 12px 34px rgba(2, 8, 20, 0.28)'
      : '0 10px 30px rgba(39, 88, 130, 0.07)',
    '--app-shell-shadow': isDark
      ? '0 8px 24px rgba(2, 8, 20, 0.18)'
      : '0 4px 18px rgba(36, 76, 112, 0.04)',
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

  useEffect(() => setCssVariables(palette, isDark), [isDark, palette])

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
