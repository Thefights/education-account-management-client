import { Space } from 'antd'

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
        width: collapsed ? 32 : 36,
        height: collapsed ? 32 : 36,
        flex: '0 0 auto',
      }}
    />
  </Space>
)

export default SystemLogoAndName
