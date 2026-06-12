import { Flex, Grid, Image, Typography, theme } from 'antd'

const appName = 'MOS Platform'
const logoSrc = '/mp-favicon-logo.svg'

export function AuthBrand({ fixed = false, left = 60 }) {
  const screens = Grid.useBreakpoint()
  const { token } = theme.useToken()
  const isMobile = !screens.md

  return (
    <Flex
      align="center"
      gap={10}
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
      <Image preview={false} src={logoSrc} alt={appName} width={36} height={36} />

      <Typography.Text style={{ color: token.colorText, lineHeight: 1.2, fontWeight: 700 }}>
        {appName}
      </Typography.Text>
    </Flex>
  )
}
