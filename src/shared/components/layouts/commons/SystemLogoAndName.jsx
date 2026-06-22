import { Space, Typography } from 'antd'

const SystemLogoAndName = ({ onClick, collapsed = false }) => (
  <Space
    align="center"
    size={10}
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : 'default',
      minWidth: 0,
      justifyContent: 'center',
      width: '100%',
    }}
  >
    <img
      src="/mp-favicon-logo.svg"
      alt="MaivenPoint MOS"
      style={{
        width: collapsed ? 36 : 44,
        height: collapsed ? 36 : 44,
        flex: '0 0 auto',
      }}
    />
    {!collapsed && (
      <div style={{ minWidth: 0, textAlign: 'left' }}>
        <Typography.Text
          strong
          style={{ display: 'block', color: 'var(--app-sider-text)', fontSize: 14 }}
        >
          Education Portal
        </Typography.Text>
        <Typography.Text style={{ color: 'var(--app-sider-text-muted)', fontSize: 11 }}>
          Account Management
        </Typography.Text>
      </div>
    )}
  </Space>
)

export default SystemLogoAndName
