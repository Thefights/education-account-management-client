import { platformDarkTheme, platformLightTheme } from '@/shared/config/theme/themeConfig'
import { darkPalette, lightPalette } from '@/shared/config/theme/themePaletteConfig'
import { useLocalStorage } from '@/shared/hooks/useStorage'
import { ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

const dashboardDrawerPalette = {
  background: lightPalette.background.sider,
  text: lightPalette.text.primary,
  textMuted: lightPalette.text.secondary,
  border: lightPalette.divider,
  hoverBg: 'rgba(30, 58, 138, 0.08)',
  activeBg: '#DDEBFF',
  activeText: lightPalette.primary.dark,
}

const darkDashboardDrawerPalette = {
  background: darkPalette.background.sider,
  text: darkPalette.text.primary,
  textMuted: darkPalette.text.secondary,
  border: 'rgba(148, 163, 184, 0.18)',
  hoverBg: 'rgba(59, 130, 246, 0.12)',
  activeBg: 'rgba(59, 130, 246, 0.2)',
  activeText: darkPalette.primary.light,
}

const setCssVariables = (palette, isDark) => {
  const root = document.documentElement
  const drawerPalette = isDark ? darkDashboardDrawerPalette : dashboardDrawerPalette
  const variables = {
    '--app-bg': palette.background.default,
    '--app-bg-accent': isDark ? 'none' : palette.gradients.background,
    '--app-header-bg': palette.background.header || palette.background.paper,
    '--app-paper-bg': palette.background.paper,
    '--app-elevated-bg': isDark ? palette.background.paper : '#FFFFFF',
    '--app-subtle-bg': isDark ? palette.background.lightGray : '#EEF6FF',
    '--app-muted-bg': isDark ? palette.grey[100] : '#E8F1FF',
    '--app-control-bg': isDark ? palette.background.paper : 'rgba(255, 255, 255, 0.96)',
    '--app-table-bg': isDark ? palette.background.paper : 'rgba(255, 255, 255, 0.94)',
    '--app-table-row-bg': isDark ? palette.background.paper : '#FFFFFF',
    '--app-sider-bg': drawerPalette.background,
    '--app-sider-text': drawerPalette.text,
    '--app-sider-text-muted': drawerPalette.textMuted,
    '--app-sider-border': drawerPalette.border,
    '--app-sider-hover-bg': drawerPalette.hoverBg,
    '--app-sider-active-bg': drawerPalette.activeBg,
    '--app-sider-active-text': drawerPalette.activeText,
    '--app-border-color': palette.divider,
    '--app-text-primary': palette.text.primary,
    '--app-text-secondary': palette.text.secondary,
    '--app-text-disabled': palette.text.disabled,
    '--app-primary': palette.primary.main,
    '--app-primary-dark': palette.primary.dark,
    '--app-primary-soft-bg': palette.primary.softBg,
    '--app-primary-soft-border': palette.primary.softBorder,
    '--app-secondary': palette.secondary.main,
    '--app-secondary-soft-bg': palette.secondary.softBg,
    '--app-secondary-soft-border': palette.secondary.softBorder,
    '--app-success': palette.success.main,
    '--app-success-soft-bg': palette.success.softBg,
    '--app-success-soft-border': palette.success.softBorder,
    '--app-warning': palette.warning.main,
    '--app-warning-soft-bg': palette.warning.softBg,
    '--app-warning-soft-border': palette.warning.softBorder,
    '--app-error': palette.error.main,
    '--app-error-soft-bg': palette.error.softBg,
    '--app-error-soft-border': palette.error.softBorder,
    '--app-filter-bg': isDark ? palette.grey[100] : '#EEF6FF',
    '--app-card-shadow': isDark
      ? '0 12px 34px rgba(2, 6, 23, 0.32)'
      : '0 16px 38px rgba(15, 23, 42, 0.09)',
    '--app-shell-shadow': isDark
      ? '0 8px 24px rgba(2, 6, 23, 0.26)'
      : '0 8px 26px rgba(15, 23, 42, 0.06)',
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
      fontSize: 16,
      motion: false,
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
