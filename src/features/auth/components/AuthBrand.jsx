import { useLocalStorage } from '@/shared/hooks/useStorage'
import { Flex, Grid, Image, Typography, theme } from 'antd'

const appName = 'Singapore Financial System'

export function AuthBrand({ fixed = false, left = 60 }) {
  const screens = Grid.useBreakpoint()
  const { token } = theme.useToken()
  const [themeMode] = useLocalStorage('theme', 'light')
  const isMobile = !screens.md
  const logoSrc = themeMode === 'dark' ? '/logo-dark.png' : '/logo-white.png'

  return (
    <Flex
      align="center"
      gap={12}
      style={{
        alignSelf: isMobile ? 'flex-start' : 'auto',
        marginBottom: isMobile ? 32 : 0,
        fontWeight: 800,
        position: fixed && !isMobile ? 'fixed' : isMobile ? 'static' : 'absolute',
        top: 28,
        left,
        zIndex: 10,
      }}
    >
      <Image
        preview={false}
        src={logoSrc}
        alt={appName}
        width={isMobile ? 210 : 280}
        height={isMobile ? 72 : 96}
        style={{ objectFit: 'contain', objectPosition: 'center' }}
      />

      <Typography.Text
        style={{
          color: token.colorText,
          lineHeight: 1.2,
          fontWeight: 700,
          display: isMobile ? 'none' : 'inline',
        }}
      >
        {appName}
      </Typography.Text>
    </Flex>
  )
}
