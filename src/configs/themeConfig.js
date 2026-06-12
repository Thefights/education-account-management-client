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

    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    borderRadiusXS: 2,

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
      boxShadowTertiary: '0 1px 2px rgba(15, 23, 42, 0.04)',
    },

    Button: {
      borderRadius: 4,
      controlHeight: 36,
      primaryShadow: 'none',
    },

    Input: {
      borderRadius: 4,
      controlHeight: 36,
    },

    Select: {
      borderRadius: 4,
      controlHeight: 36,
    },

    Pagination: {
      itemActiveBg: lightPalette.primary.main,
      itemActiveColor: lightPalette.primary.contrastText,
      itemBorderRadius: 4,
    },

    Table: {
      borderColor: lightPalette.divider,
      headerBg: lightPalette.grey[100],
      headerSplitColor: lightPalette.divider,
      rowHoverBg: lightPalette.primary.softBg,
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

    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    borderRadiusXS: 2,

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
    },

    Button: {
      borderRadius: 4,
      controlHeight: 36,
      primaryShadow: 'none',
    },

    Input: {
      borderRadius: 4,
      controlHeight: 36,
    },

    Select: {
      borderRadius: 4,
      controlHeight: 36,
    },

    Pagination: {
      itemActiveBg: darkPalette.primary.main,
      itemActiveColor: darkPalette.primary.contrastText,
      itemBorderRadius: 4,
    },

    Table: {
      borderColor: darkPalette.divider,
      headerBg: darkPalette.grey[100],
      headerSplitColor: darkPalette.divider,
      rowHoverBg: darkPalette.primary.softBg,
    },
  },
}
