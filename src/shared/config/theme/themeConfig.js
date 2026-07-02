import { theme } from 'antd'
import { darkPalette, lightPalette } from './themePaletteConfig'

const { darkAlgorithm, defaultAlgorithm } = theme

export const platformLightTheme = {
  algorithm: defaultAlgorithm,

  token: {
    colorPrimary: lightPalette.primary.main,
    colorSuccess: lightPalette.success.main,
    colorWarning: lightPalette.warning.main,
    colorError: lightPalette.error.main,
    colorInfo: lightPalette.info.main,

    colorTextBase: lightPalette.text.primary,
    colorBorder: lightPalette.divider,

    colorBgLayout: lightPalette.background.default,
    colorBgContainer: lightPalette.background.paper,
    colorBgElevated: '#FFFFFF',
    colorFillSecondary: '#EEF6FF',
    colorFillTertiary: '#F8FAFC',
    colorLink: lightPalette.primary.main,
    colorLinkHover: lightPalette.primary.dark,

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
    borderRadiusXS: 6,

    fontFamily: 'Lexend, sans-serif',
  },

  components: {
    Layout: {
      bodyBg: lightPalette.background.default,
      headerBg: lightPalette.background.header,
      siderBg: lightPalette.background.sider,
      triggerBg: lightPalette.background.sider,
    },

    Card: {
      colorBorderSecondary: lightPalette.divider,
      boxShadowTertiary: '0 16px 38px rgba(15, 23, 42, 0.09)',
      paddingLG: 20,
    },

    Button: {
      borderRadius: 8,
      controlHeight: 40,
      primaryShadow: '0 10px 22px rgba(30, 58, 138, 0.24)',
      defaultHoverBorderColor: lightPalette.primary.light,
      defaultHoverColor: lightPalette.primary.dark,
    },

    Checkbox: {
      borderRadiusSM: 3,
    },

    Input: {
      borderRadius: 8,
      controlHeight: 40,
      activeBorderColor: lightPalette.primary.main,
      activeShadow: '0 0 0 3px rgba(30, 58, 138, 0.13)',
    },

    Select: {
      borderRadius: 8,
      controlHeight: 40,
      activeBorderColor: lightPalette.primary.main,
      activeOutlineColor: 'rgba(30, 58, 138, 0.13)',
    },

    Pagination: {
      itemActiveBg: lightPalette.primary.main,
      itemActiveColor: lightPalette.primary.contrastText,
      itemBorderRadius: 8,
    },

    Table: {
      borderColor: lightPalette.divider,
      headerBg: '#E8F1FF',
      headerColor: '#0F172A',
      headerSplitColor: 'transparent',
      rowHoverBg: '#F3F8FF',
    },

    Tag: {
      borderRadiusSM: 6,
    },
  },
}

export const platformDarkTheme = {
  algorithm: darkAlgorithm,

  token: {
    colorPrimary: darkPalette.primary.main,
    colorSuccess: darkPalette.success.main,
    colorWarning: darkPalette.warning.main,
    colorError: darkPalette.error.main,
    colorInfo: darkPalette.info.main,

    colorTextBase: darkPalette.text.primary,
    colorBorder: darkPalette.divider,

    colorBgLayout: darkPalette.background.default,
    colorBgContainer: darkPalette.background.paper,
    colorBgElevated: darkPalette.background.paper,

    borderRadius: 10,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 6,

    fontFamily: 'Lexend, sans-serif',
  },

  components: {
    Layout: {
      bodyBg: darkPalette.background.default,
      headerBg: darkPalette.background.header,
      siderBg: darkPalette.background.sider,
      triggerBg: darkPalette.background.sider,
    },

    Card: {
      colorBorderSecondary: darkPalette.divider,
      boxShadowTertiary: '0 12px 34px rgba(2, 8, 20, 0.28)',
      paddingLG: 20,
    },

    Button: {
      borderRadius: 10,
      controlHeight: 40,
      primaryShadow: '0 6px 18px rgba(59, 130, 246, 0.24)',
    },

    Checkbox: {
      borderRadiusSM: 3,
    },

    Input: {
      borderRadius: 10,
      controlHeight: 40,
      activeShadow: '0 0 0 3px rgba(59, 130, 246, 0.16)',
    },

    Select: {
      borderRadius: 10,
      controlHeight: 40,
      activeOutlineColor: 'rgba(59, 130, 246, 0.16)',
    },

    Pagination: {
      itemActiveBg: darkPalette.primary.main,
      itemActiveColor: darkPalette.primary.contrastText,
      itemBorderRadius: 8,
    },

    Table: {
      borderColor: darkPalette.divider,
      headerBg: '#273449',
      headerSplitColor: 'transparent',
      rowHoverBg: darkPalette.primary.softBg,
    },
  },
}
