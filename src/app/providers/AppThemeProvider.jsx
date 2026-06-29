import { platformDarkTheme, platformLightTheme } from '@/shared/config/theme/themeConfig'
import { darkPalette, lightPalette } from '@/shared/config/theme/themePaletteConfig'
import { useLocalStorage } from '@/shared/hooks/useStorage'
import { ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

const dashboardDrawerPalette = {
  background: lightPalette.background.sider,
  text: '#263B5E',
  textMuted: '#6B778C',
  border: '#D9E0EA',
  hoverBg: 'rgba(37, 99, 235, 0.07)',
  activeBg: '#E2E8F0',
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
    '--app-bg-accent': isDark ? 'none' : palette.gradients.background,
    '--app-header-bg': palette.background.header || palette.background.paper,
    '--app-paper-bg': palette.background.paper,
    '--app-elevated-bg': isDark ? palette.background.paper : '#FFFFFF',
    '--app-subtle-bg': isDark ? palette.background.lightGray : '#F6F8FB',
    '--app-muted-bg': isDark ? palette.grey[100] : '#EEF2F7',
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
    '--app-filter-bg': isDark ? palette.grey[100] : '#F6F8FB',
    '--app-card-shadow': isDark
      ? '0 12px 34px rgba(2, 8, 20, 0.28)'
      : '0 14px 36px rgba(51, 65, 85, 0.09)',
    '--app-shell-shadow': isDark
      ? '0 8px 24px rgba(2, 8, 20, 0.18)'
      : '0 8px 26px rgba(51, 65, 85, 0.07)',
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
