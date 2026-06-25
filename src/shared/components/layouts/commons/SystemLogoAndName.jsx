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
      src="/mp-favicon-logo.png"
      alt="MaivenPoint MOS"
      style={{
        width: collapsed ? 36 : 150,
        height: collapsed ? 36 : 150,
        flex: '0 0 auto',
      }}
    />
  </Space>
)

export default SystemLogoAndName
