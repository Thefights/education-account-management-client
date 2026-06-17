import SwitchLanguageButton from '@/shared/components/buttons/SwitchLanguageButton'
import SwitchThemeButton from '@/shared/components/buttons/SwitchThemeButton'
import { Flex, Grid, theme } from 'antd'
import { AuthBrand } from '@/features/auth/components/AuthBrand'

export function LayoutAuth({
  children,
  imageSrc,
  contentMaxWidth = 560,
  contentPadding,
  imageLayout = false,
  showBrand = true,
}) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const hasImage = imageLayout && Boolean(imageSrc) && !isMobile

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: hasImage ? 'grid' : 'flex',
        flexDirection: hasImage ? undefined : 'column',
        gridTemplateColumns: hasImage ? 'minmax(480px, 34vw) 1fr' : undefined,
        alignItems: hasImage ? undefined : 'center',
        justifyContent: hasImage ? undefined : 'flex-start',
        background: token.colorBgLayout,
        color: token.colorText,
        fontFamily: token.fontFamily,
        padding: hasImage ? 0 : isMobile ? '24px 16px' : '24px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: hasImage ? 'hidden' : 'auto',
      }}
    >
      {showBrand && <AuthBrand fixed={hasImage} />}

      <Flex
        align="center"
        gap={8}
        style={{
          position: 'absolute',
          top: isMobile ? 16 : 22,
          right: isMobile ? 16 : 28,
          zIndex: 2,
        }}
      >
        <SwitchThemeButton />
        <SwitchLanguageButton />
      </Flex>

      <section
        style={{
          width: '100%',
          maxWidth: hasImage ? 520 : contentMaxWidth,
          height: hasImage ? '90dvh' : 'auto',
          padding: contentPadding ?? (hasImage ? '30px 48px 32px ' : 0),
          boxSizing: 'border-box',
          margin: hasImage ? 0 : 'auto',
        }}
      >
        {children}
      </section>

      {hasImage && (
        <section
          style={{
            height: '100dvh',
            overflow: 'hidden',
          }}
        >
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </section>
      )}
    </main>
  )
}
