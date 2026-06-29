import { useLocalStorage } from '@/shared/hooks/useStorage'
import { Space } from 'antd'

const appName = 'Singapore Financial System'

const SystemLogoAndName = ({ onClick, collapsed = false }) => {
  const [themeMode] = useLocalStorage('theme', 'light')
  const logoSrc = themeMode === 'dark' ? '/logo-dark.png' : '/logo-white.png'

  return (
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
        src={logoSrc}
        alt={appName}
        style={{
          width: collapsed ? 48 : 220,
          height: collapsed ? 48 : 130,
          objectFit: 'contain',
          objectPosition: 'center',
        }}
      />
    </Space>
  )
}

export default SystemLogoAndName
