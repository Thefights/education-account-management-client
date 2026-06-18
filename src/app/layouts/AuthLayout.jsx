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
  const hasBackgroundImage = imageLayout && Boolean(imageSrc)

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: hasBackgroundImage ? 'center' : 'flex-start',
        background: token.colorBgLayout,
        color: token.colorText,
        fontFamily: token.fontFamily,
        padding: hasBackgroundImage
          ? isMobile
            ? '72px 16px'
            : '72px 24px'
          : isMobile
            ? '24px 16px'
            : '24px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden auto',
      }}
    >
      {hasBackgroundImage && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: -16,
              backgroundImage: `url(${imageSrc})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              filter: 'blur(7px)',
              transform: 'scale(1.03)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(8, 18, 33, 0.48)',
            }}
          />
        </>
      )}

      {showBrand && <AuthBrand fixed={hasBackgroundImage} />}

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
          maxWidth: contentMaxWidth,
          padding:
            contentPadding ??
            (hasBackgroundImage ? (isMobile ? '28px 22px' : '40px 48px') : 0),
          boxSizing: 'border-box',
          margin: hasBackgroundImage ? 0 : 'auto',
          position: 'relative',
          zIndex: 1,
          background: hasBackgroundImage ? token.colorBgContainer : undefined,
          border: hasBackgroundImage ? `1px solid ${token.colorBorderSecondary}` : undefined,
          borderRadius: hasBackgroundImage ? token.borderRadiusLG * 2 : undefined,
          boxShadow: hasBackgroundImage ? token.boxShadowSecondary : undefined,
        }}
      >
        {children}
      </section>
    </main>
  )
}
