import { useLocalStorage } from '@/shared/hooks/useStorage'
import useTranslation from '@/shared/hooks/useTranslation'
import { CloseOutlined } from '@ant-design/icons'
import { Button, Flex, Space, Typography, theme } from 'antd'

const getActionVariant = (action) => {
  const key = String(action.key || '').toLowerCase()
  if (action.variant) return action.variant
  if (key === 'deactivate' || key === 'inactive') return 'warning'
  return undefined
}

const getActionButtonStyle = (action, token, isDark) => {
  const variant = getActionVariant(action)
  if (variant !== 'warning') return action.style

  return {
    color: isDark ? 'var(--app-warning)' : token.colorWarningText,
    borderColor: isDark ? 'var(--app-warning-soft-border)' : token.colorWarningBorder,
    background: isDark ? 'var(--app-warning-soft-bg)' : token.colorWarningBg,
    ...action.style,
  }
}

const getBarStyle = (token, isDark) => ({
  position: 'sticky',
  bottom: 16,
  zIndex: 20,
  padding: '12px 16px',
  border: isDark ? '1px solid rgba(145, 165, 185, 0.32)' : `1px solid ${token.colorBorder}`,
  borderRadius: token.borderRadiusLG,
  background: isDark ? 'var(--app-subtle-bg)' : token.colorFillSecondary,
  boxShadow: isDark ? '0 16px 40px rgba(2, 8, 20, 0.46)' : token.boxShadowSecondary,
})

const BulkActionBar = ({
  selectedCount = 0,
  selectedLabel,
  clearLabel,
  actions = [],
  loading = false,
  onClear,
}) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const [themeMode] = useLocalStorage('theme', 'light')
  const isDark = themeMode === 'dark'

  if (!selectedCount) return null

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={16}
      wrap="wrap"
      style={getBarStyle(token, isDark)}
    >
      <Space size={8}>
        <Typography.Text strong>
          {selectedLabel ?? `${selectedCount} ${t('text.selected').toLowerCase()}`}
        </Typography.Text>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClear}>
          {clearLabel ?? t('button.clear')}
        </Button>
      </Space>
      <Space wrap>
        {actions.map((action) => {
          const variant = getActionVariant(action)

          return (
            <Button
              key={action.key || action.label}
              type={action.type}
              danger={variant === 'warning' ? false : action.danger}
              icon={action.icon}
              style={getActionButtonStyle(action, token, isDark)}
              loading={action.loading ?? loading}
              disabled={action.disabled ?? loading}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )
        })}
      </Space>
    </Flex>
  )
}

export default BulkActionBar
