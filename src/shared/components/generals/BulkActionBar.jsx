import useTranslation from '@/shared/hooks/useTranslation'
import { CloseOutlined } from '@ant-design/icons'
import { Button, Flex, Space, Typography, theme } from 'antd'

const BulkActionBar = ({ selectedCount = 0, actions = [], loading = false, onClear }) => {
  const { t } = useTranslation()
  const { token } = theme.useToken()

  if (!selectedCount) return null

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={16}
      wrap="wrap"
      style={{
        position: 'sticky',
        bottom: 16,
        zIndex: 20,
        padding: '12px 16px',
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgElevated,
        boxShadow: token.boxShadowSecondary,
      }}
    >
      <Space size={8}>
        <Typography.Text strong>
          {selectedCount} {t('text.selected').toLowerCase()}
        </Typography.Text>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClear}>
          {t('button.clear')}
        </Button>
      </Space>
      <Space wrap>
        {actions.map((action) => (
          <Button
            key={action.key || action.label}
            type={action.type}
            danger={action.danger}
            icon={action.icon}
            loading={action.loading ?? loading}
            disabled={action.disabled ?? loading}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </Flex>
  )
}

export default BulkActionBar
